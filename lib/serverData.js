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

const COLLECTION_LIST_TTL_MS = 5 * 60 * 1000; // 5 minutes - collections rarely change

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

    await connectToMongo();

    // Skip the listCollections() existence check on the hot path - a
    // query against a nonexistent collection just returns [] in Mongo,
    // which is exactly what we want to show the "empty" state anyway.
    // We only pay for listCollections() (and only once per TTL window)
    // when the caller actually needs the full catalogue.
    const Model = getModelForCollection(colName);

    if (id) {
      // Case 1: `id` is a real Mongo document _id (e.g. cart/profile items
      // fetched via collection=carts&id=<_id>). Keep this working exactly
      // as before.
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await Model.findById(id).lean();
        if (doc) return { success: true, data: doc };
      }

      // Case 2: `id` is a *product* id, not a document _id. Every
      // category page (laptop/[id], component/[id], monitors/[id], ...)
      // stores its catalogue as ONE page-document containing a
      // `products: [...]` array, and links to `/collection/<product.id>`
      // using that product's own numeric `id` field - never the parent
      // document's Mongo _id. Search the collection's `products` arrays
      // for a matching entry so those detail pages actually resolve.
      const numericId = Number(id);
      const productQuery = Number.isNaN(numericId)
        ? { 'products.id': id }
        : { $or: [{ 'products.id': numericId }, { 'products.id': id }] };

      const docs = await Model.find(productQuery).lean();
      for (const doc of docs) {
        if (Array.isArray(doc.products)) {
          const product = doc.products.find((p) => String(p.id) === String(id));
          if (product) return { success: true, data: product };
        }
      }

      return { success: false, error: 'Document not found' };
    }

    const docs = await Model.find({}).lean();
    return { success: true, data: docs };
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
    colNames.map((name) => getModelForCollection(name).find({}).lean())
  );
  return colNames.reduce((acc, name, idx) => {
    acc[name] = results[idx];
    return acc;
  }, {});
}