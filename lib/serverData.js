// lib/serverData.js
//
// Shared, server-only data access layer for the public "collection" reads
// (laptop / accessories / monitors / ... / Menu / footer / navbar).
//
// WHY THIS FILE EXISTS (perf fix):
// 1) Every category page (app/(products)/*/page.jsx) used to call its OWN
//    API route over HTTP (`fetch(`${baseUrl}/api/data?collection=...`)`)
//    from inside a Server Component. On Vercel that is a full extra
//    network round trip (DNS/TLS/HTTP + a possible cold start of a SECOND
//    serverless function) on every single page navigation, even though the
//    Server Component is running on the very same server that could just
//    talk to MongoDB directly. Removing that hop is the single biggest win
//    for "navigating from laptop -> accessories feels slow".
// 2) The API route was also calling `listCollections()` (a full Mongo
//    command that lists every collection in the DB) on EVERY request just
//    to check "does this collection exist?", in addition to the actual
//    `Model.find({})` query. That's two DB round trips instead of one.
//    Here we cache the collection list in memory for a short TTL so it's
//    effectively free after the first request.
//
// Server Components can now do:
//   import { getCollectionData } from '@/lib/serverData';
//   const products = await getCollectionData('laptop');
// instead of fetching their own API route.

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!globalThis._mongo) globalThis._mongo = { conn: null, promise: null };
if (!globalThis._mongoModels) globalThis._mongoModels = {};
if (!globalThis._mongoCollCache) {
  globalThis._mongoCollCache = { names: null, fetchedAt: 0 };
}
// كاش بيانات الكولكشنات كاملة (المنتج + المنتجات المشابهة + قائمة الفئة
// كلهم كانوا بيعملوا استعلام Mongo منفصل لكل واحد فيهم على كل نقلة صفحة -
// ده كان السبب الرئيسي إن صفحات التفاصيل بطيئة/بتفشل أحيانًا على Vercel).
// دلوقتي أول قراءة للكولكشن بتتخزن هنا لمدة TTL قصيرة، وأي قراءة تانية
// ليها (بالـ id أو بدونه) بتترجع من الذاكرة فورًا من غير أي رحلة لقاعدة
// البيانات - ده اللي بيخلي التنقل بين صفحات المنتجات إحساسه فوري.
if (!globalThis._mongoDataCache) globalThis._mongoDataCache = {};
if (!globalThis._mongoDataInflight) globalThis._mongoDataInflight = {};

const COLLECTION_LIST_TTL_MS = 5 * 60 * 1000; // 5 minutes - collections rarely change
const COLLECTION_DATA_TTL_MS = 60 * 1000; // 60 seconds - بيانات المنتجات بتتغير مش كتير

export async function connectToMongo() {
  if (globalThis._mongo.conn) return globalThis._mongo.conn;
  if (!MONGO_URI) throw new Error('Please set MONGO_URI environment variable');

  if (!globalThis._mongo.promise) {
    globalThis._mongo.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  globalThis._mongo.conn = await globalThis._mongo.promise;
  return globalThis._mongo.conn;
}

const schema = new mongoose.Schema({}, { strict: false });

function normalizeModelName(name) {
  return `Model_${String(name).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function getModelForCollection(collectionName) {
  const name = String(collectionName);
  if (globalThis._mongoModels[name]) return globalThis._mongoModels[name];

  const modelName = normalizeModelName(name);
  const Model =
    mongoose.models[modelName] || mongoose.model(modelName, schema, name);
  globalThis._mongoModels[name] = Model;
  return Model;
}

// Cached collection listing - avoids hitting Mongo's listCollections()
// command on every single API request.
export async function listCollectionsCached({ force = false } = {}) {
  const now = Date.now();
  const cache = globalThis._mongoCollCache;

  if (!force && cache.names && now - cache.fetchedAt < COLLECTION_LIST_TTL_MS) {
    return cache.names;
  }

  await connectToMongo();
  const cols = await mongoose.connection.db.listCollections().toArray();
  const names = cols.map((c) => c.name).filter((n) => !n.startsWith('system.'));

  cache.names = names;
  cache.fetchedAt = now;
  return names;
}

export function invalidateCollectionsCache() {
  globalThis._mongoCollCache.names = null;
  globalThis._mongoCollCache.fetchedAt = 0;
}

const RESTRICTED_COLLECTIONS = ['auth'];

// `.lean()` still leaves BSON types in place - ObjectId for `_id`, Date
// objects for any date fields, etc. Those have their own toJSON() method
// but are NOT plain objects, and Next.js refuses to pass anything but
// plain objects from a Server Component straight into a Client Component
// ("Only plain objects can be passed..."). A JSON round-trip is the
// simplest reliable way to strip them down to plain strings/numbers -
// this data is only ever used for read-only display anyway, so losing
// the BSON-specific methods costs nothing.
function toPlainJSON(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

/**
 * يقرأ كل مستندات الكولكشن (مثل صفحة "accessories" اللي جواها مصفوفة
 * products) مع كاش TTL في الذاكرة. كل الدوال التانية (المنتج نفسه،
 * المنتجات المشابهة، منتجات نفس الفئة، generateStaticParams) بتستخدم
 * نفس الدالة دي، فبتشترك في نفس النسخة المخزنة بدل ما كل واحدة تعمل
 * استعلام Mongo لوحدها.
 *
 * request de-duplication: لو جالك أكتر من طلب لنفس الكولكشن في نفس
 * اللحظة (زي ما بيحصل فعليًا - المنتج + 8 منتجات مشابهة كلهم بيتنفذوا
 * بالتوازي) بيشتركوا في نفس الـ Promise بدل ما كل واحد يعمل استعلام
 * منفصل لقاعدة البيانات.
 */
async function getRawCollectionDocs(colName, { force = false } = {}) {
  const cache = globalThis._mongoDataCache;
  const inflight = globalThis._mongoDataInflight;
  const now = Date.now();
  const entry = cache[colName];

  if (!force && entry && now - entry.fetchedAt < COLLECTION_DATA_TTL_MS) {
    return entry.docs;
  }

  if (inflight[colName]) return inflight[colName];

  const promise = (async () => {
    await connectToMongo();
    const Model = getModelForCollection(colName);
    const docs = await Model.find({}).lean();
    const plain = toPlainJSON(docs);
    cache[colName] = { docs: plain, fetchedAt: Date.now() };
    return plain;
  })();

  inflight[colName] = promise;
  try {
    return await promise;
  } finally {
    delete inflight[colName];
  }
}

/** بيبحث عن منتج بالـ id جوه مصفوفات products الخاصة بمستندات الكولكشن. */
function findProductInDocs(docs, id) {
  for (const doc of docs) {
    if (Array.isArray(doc.products)) {
      const product = doc.products.find((p) => String(p.id) === String(id));
      if (product) return product;
    }
    // بعض الكولكشنز (زي carts/profile) مستنداتها نفسها هي "المنتج"
    if (String(doc.id) === String(id)) return doc;
  }
  return null;
}

export function invalidateCollectionDataCache(colName) {
  if (colName) {
    delete globalThis._mongoDataCache[colName];
  } else {
    globalThis._mongoDataCache = {};
  }
}

/**
 * Direct, server-only read of a single collection. Used by:
 *  - Server Components (app/(products)/*\/page.jsx) instead of self-fetching
 *    their own /api/data route over HTTP.
 *  - The /api/data GET route handler itself, so there's one code path.
 *
 * Returns { success: true, data } or { success: false, error }.
 * `.lean()` is used so Mongoose returns plain JS objects instead of full
 * Documents - cheaper to build and safe to pass straight into a Client
 * Component / JSON.stringify.
 */
export async function getCollectionData(collectionName, { id } = {}) {
  try {
    if (!collectionName) {
      return { success: false, error: 'Collection is required' };
    }

    const colName = String(collectionName);

    if (RESTRICTED_COLLECTIONS.includes(colName)) {
      return { success: false, error: `Access to '${colName}' is not allowed` };
    }

    if (id) {
      // Case 1: `id` is a real Mongo document _id (e.g. cart/profile items
      // fetched via collection=carts&id=<_id>). ده مش منتج جوه مصفوفة
      // products، فبيفضل استعلام مباشر (findById أصلاً بيستخدم الـ _id
      // index فمفيش داعي يتكاش، والداتا دي بتتغير أكتر من كتالوج المنتجات).
      if (mongoose.Types.ObjectId.isValid(id)) {
        await connectToMongo();
        const Model = getModelForCollection(colName);
        const doc = await Model.findById(id).lean();
        if (doc) return { success: true, data: toPlainJSON(doc) };
      }

      // Case 2: `id` is a *product* id, not a document _id. بدل ما نعمل
      // استعلام Mongo منفصل لكل منتج (زي ما كان بيحصل)، بنقرأ الكولكشن
      // كامل من الكاش المشترك (getRawCollectionDocs) ونبحث فيه في
      // الذاكرة - أسرع بكتير خصوصًا لما نفس الصفحة بتطلب 5-10 منتجات
      // مختلفة (المنتج الرئيسي + المنتجات المشابهة) في نفس الوقت.
      const docs = await getRawCollectionDocs(colName);
      const product = findProductInDocs(docs, id);
      if (product) return { success: true, data: toPlainJSON(product) };

      return { success: false, error: 'Document not found' };
    }

    const docs = await getRawCollectionDocs(colName);
    return { success: true, data: toPlainJSON(docs) };
  } catch (error) {
    console.error(`getCollectionData(${collectionName}) failed:`, error);
    return { success: false, error: error.message || 'Internal server error' };
  }
}

/**
 * Fetch every public collection at once (used by the "no collection param"
 * branch of /api/data). Still benefits from the cached collection list.
 */
export async function getAllCollectionsData() {
  const colNames = (await listCollectionsCached()).filter(
    (name) => !RESTRICTED_COLLECTIONS.includes(name)
  );
  const results = await Promise.all(
    colNames.map((name) => getRawCollectionDocs(name))
  );
  return colNames.reduce((acc, name, idx) => {
    acc[name] = results[idx];
    return acc;
  }, {});
}