// app/api/data/route.js

import mongoose from "mongoose";
// ✅ NextAuth v5: مفيش getServerSession ولا authOptions خالص.
// بنستورد دالة auth() جاهزة من ملف الإعداد بتاعك مباشرة.
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import {
  connectToMongo,
  getModelForCollection,
  listCollectionsCached,
  invalidateCollectionsCache,
  getCollectionData,
  getAllCollectionsData,
} from "@/lib/serverData";

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
//  AUTH: READ (no API key — data is public menu/footer/navbar/product info)
//  ملحوظة: شيلنا شرط الـ x-api-key من القراءة لأن الداتا دي أصلاً
//  عامة (menu/footer/navbar/products) وبتتنادى من client components
//  كتير جوه المتصفح، ومفيش طريقة تخبي فيها الـ secret key جوه كود
//  بيشتغل على المتصفح (أي حد فاتح DevTools هيشوفه). الحماية الحقيقية
//  (session + admin) لسه شغالة زي ما هي على الـ POST/PUT/DELETE.
//  الـ rate limiting سايبينه شغال كحماية من الإساءة/الـ scraping.
// ============================================================
function authenticateRead(request) {
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return { ok: false, status: 429, error: "Too many requests — slow down" };
  }

  return { ok: true };
}

// ============================================================
//  AUTH: WRITE (logged-in admin session required)
// ============================================================
async function authenticateWrite(request) {
  // نفس شروط القراءة الأول (rate limit)
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
//  (connectToMongo / getModelForCollection / listCollectionsCached now
//   live in lib/serverData.js so Server Components can call them directly
//   instead of round-tripping through this HTTP route - see that file for
//   details on why. listCollectionsCached() also caches the result for a
//   few minutes instead of hitting Mongo's listCollections() on every call.)
// ============================================================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.warn("Warning: MONGO_URI not defined in environment");

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
    const { collection, id } = getSearchParams(request);

    if (!collection) {
      const payload = await getAllCollectionsData();
      return jsonResponse(payload, 200);
    }

    // Single DB round trip: no more listCollections() existence check
    // before the actual query. A query against a collection that doesn't
    // exist yet just returns [] / not-found, which is the correct
    // behaviour anyway - and it's one Mongo call instead of two.
    const result = await getCollectionData(collection, { id });

    if (!result.success) {
      const status = /not allowed/.test(result.error)
        ? 403
        : /not found/i.test(result.error)
        ? 404
        : /Invalid id/.test(result.error)
        ? 400
        : 500;
      return jsonResponse({ error: result.error }, status);
    }

    return jsonResponse(result.data, 200);
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

    invalidateCollectionsCache();
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

    const existingCols = await listCollectionsCached();
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

    const existingCols = await listCollectionsCached();
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