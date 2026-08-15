// app/api/data/route.js

import mongoose from "mongoose";
// ✅ NextAuth v5: مفيش getServerSession ولا authOptions خالص.
// بنستورد دالة auth() جاهزة من ملف الإعداد بتاعك مباشرة.
import { auth } from "@/app/api/auth/[...nextauth]/auth";

// ============================================================
//  SECURITY CONFIG
// ============================================================
const API_KEY = process.env.API_SECRET_KEY;

const rateLimitMap = new Map();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

// ============================================================
//  AUTH: READ (API key only — data is public menu/footer/navbar info)
// ============================================================
function authenticateRead(request) {
  if (!API_KEY) {
    console.error("API_SECRET_KEY is not set!");
    return { ok: false, status: 500, error: "Server misconfiguration" };
  }

  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return { ok: false, status: 429, error: "Too many requests — slow down" };
  }

  const key = request.headers.get("x-api-key");
  if (!key || key !== API_KEY) {
    return { ok: false, status: 401, error: "Unauthorized — invalid or missing API key" };
  }

  return { ok: true };
}

// ============================================================
//  AUTH: WRITE (API key + logged-in admin session required)
// ============================================================
async function authenticateWrite(request) {
  // نفس شروط القراءة الأول (key + rate limit)
  const readCheck = authenticateRead(request);
  if (!readCheck.ok) return readCheck;

  // ✅ NextAuth v5: بنجيب الـ session بنداء auth() مباشرة، مش getServerSession(authOptions)
  const session = await auth();
  if (!session || !session.user) {
    return { ok: false, status: 401, error: "Unauthorized — login required for this action" };
  }

  // لازم يكون admin (session.user.isAdmin بييجي من next-auth بعد التعديل على callbacks)
  if (!session.user.isAdmin) {
    return { ok: false, status: 403, error: "Forbidden — admin access required" };
  }

  return { ok: true, session };
}

// ============================================================
//  MONGO CONNECTION
// ============================================================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.warn("Warning: MONGO_URI not defined in environment");

if (!globalThis._mongo) globalThis._mongo = { conn: null, promise: null };
if (!globalThis._mongoModels) globalThis._mongoModels = {};

async function connectToMongo() {
  if (globalThis._mongo.conn) return globalThis._mongo.conn;
  if (!MONGO_URI) throw new Error("Please set MONGO_URI environment variable");

  if (!globalThis._mongo.promise) {
    globalThis._mongo.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  globalThis._mongo.conn = await globalThis._mongo.promise;
  return globalThis._mongo.conn;
}

const schema = new mongoose.Schema({}, { strict: false });

function normalizeModelName(name) {
  return `Model_${String(name).replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function getModelForCollection(collectionName) {
  const name = String(collectionName);
  if (globalThis._mongoModels[name]) return globalThis._mongoModels[name];

  const modelName = normalizeModelName(name);
  const Model =
    mongoose.models[modelName] || mongoose.model(modelName, schema, name);
  globalThis._mongoModels[name] = Model;
  return Model;
}

async function listCollections() {
  await connectToMongo();
  const cols = await mongoose.connection.db.listCollections().toArray();
  return cols.map((c) => c.name).filter((n) => !n.startsWith("system."));
}

// ============================================================
//  ALLOWLIST — بس الـ collections دي مسموح يتكتب فيها.
//  عدّلها على حسب أسماء الـ collections الحقيقية عندك.
//  (لو محتاج تسمح بالكتابة في carts/profile من غير ما يكون المستخدم admin،
//   لازم تعمل شرط مختلف — راجع الملاحظة تحت الرد).
// ============================================================
const WRITABLE_COLLECTIONS = ["Menu", "footer", "navbar", "whatsapp"];

// collections حساسة ممنوع الوصول ليها خالص من الـ route العام (قراءة أو كتابة)
const RESTRICTED_COLLECTIONS = ["auth"];

// ============================================================
//  HELPERS
// ============================================================
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getSearchParams(request) {
  const url = new URL(request.url);
  return {
    collection: url.searchParams.get("collection"),
    id: url.searchParams.get("id"),
  };
}

// ============================================================
//  GET — قراءة بس، محتاج API key
// ============================================================
export async function GET(request) {
  const authCheck = authenticateRead(request);
  if (!authCheck.ok) return jsonResponse({ error: authCheck.error }, authCheck.status);

  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);

    if (!collection) {
      const colNames = (await listCollections()).filter(
        (name) => !RESTRICTED_COLLECTIONS.includes(name)
      );
      const results = await Promise.all(
        colNames.map((name) => getModelForCollection(name).find({}))
      );
      const payload = colNames.reduce((acc, name, idx) => {
        acc[name] = results[idx];
        return acc;
      }, {});
      return jsonResponse(payload, 200);
    }

    const colName = String(collection);

    if (RESTRICTED_COLLECTIONS.includes(colName)) {
      return jsonResponse({ error: `Access to '${colName}' is not allowed` }, 403);
    }

    const existingCols = await listCollections();
    if (!existingCols.includes(colName))
      return jsonResponse({ error: `Collection '${colName}' not found` }, 404);

    const Model = getModelForCollection(colName);

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return jsonResponse({ error: "Invalid id format" }, 400);
      const doc = await Model.findById(id);
      if (!doc) return jsonResponse({ error: "Document not found" }, 404);
      return jsonResponse(doc, 200);
    }

    return jsonResponse(await Model.find({}), 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

// ============================================================
//  POST — كتابة، محتاج admin session
// ============================================================
export async function POST(request) {
  const authResult = await authenticateWrite(request);
  if (!authResult.ok) return jsonResponse({ error: authResult.error }, authResult.status);

  try {
    await connectToMongo();
    const { collection } = getSearchParams(request);
    if (!collection)
      return jsonResponse({ error: "Collection is required" }, 400);

    const colName = String(collection);
    if (!WRITABLE_COLLECTIONS.includes(colName)) {
      return jsonResponse({ error: `Writing to '${colName}' is not allowed` }, 403);
    }

    const body = await parseBody(request);
    if (body === null) {
      return jsonResponse({ error: "Invalid or missing JSON body" }, 400);
    }

    const Model = getModelForCollection(colName);
    const created = Array.isArray(body)
      ? await Model.insertMany(body)
      : await Model.create(body);

    return jsonResponse(created, 201);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

// ============================================================
//  PUT — كتابة، محتاج admin session
// ============================================================
export async function PUT(request) {
  const authResult = await authenticateWrite(request);
  if (!authResult.ok) return jsonResponse({ error: authResult.error }, authResult.status);

  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection)
      return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for PUT" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id))
      return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    if (!WRITABLE_COLLECTIONS.includes(colName)) {
      return jsonResponse({ error: `Writing to '${colName}' is not allowed` }, 403);
    }

    const existingCols = await listCollections();
    if (!existingCols.includes(colName))
      return jsonResponse({ error: "Collection not found" }, 404);

    const body = await parseBody(request);
    if (body === null) {
      return jsonResponse({ error: "Invalid or missing JSON body" }, 400);
    }

    const updated = await getModelForCollection(colName).findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: false }
    );

    if (!updated) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(updated, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

// ============================================================
//  DELETE — كتابة، محتاج admin session
// ============================================================
export async function DELETE(request) {
  const authResult = await authenticateWrite(request);
  if (!authResult.ok) return jsonResponse({ error: authResult.error }, authResult.status);

  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection)
      return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for DELETE" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id))
      return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    if (!WRITABLE_COLLECTIONS.includes(colName)) {
      return jsonResponse({ error: `Writing to '${colName}' is not allowed` }, 403);
    }

    const existingCols = await listCollections();
    if (!existingCols.includes(colName))
      return jsonResponse({ error: "Collection not found" }, 404);

    const deleted = await getModelForCollection(colName).findByIdAndDelete(id);
    if (!deleted) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(deleted, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}