// app/api/data/route.js
//
// هدف الملف: يبقى بديل محلي كامل لـ /api/data
// بحيث المشروع يشتغل بالكامل على قاعدة البيانات المحلية (MONGO_URI) من غير أي اعتماد
// على أي سيرفر خارجي.
//
// الأنماط المدعومة (نفس الأنماط اللي كانت مستخدمة في المشروع مع السيرفر القديم):
//
//   GET  /api/data
//     -> بيرجع كل الـ "collections" الخاصة بالمنتجات في object واحد:
//        { laptop: [...], component: [...], other: [...], accessories: [...],
//          printers: [...], monitors: [...], pos: [...], "pc-build": [...],
//          "storage-devices": [...] }
//
//   GET  /api/data?collection=carts
//     -> بيرجع كل الـ documents في الـ collection ده كـ array مباشرة
//        (وده المستخدم في السلة/البروفايل/اليوزرز)
//
//   GET  /api/data?collection=carts&email=someone@example.com
//     -> فلترة حسب الإيميل (اختياري، لو محتاجينه في السيرفر بدل الفرونت)
//
//   GET  /api/data?collection=laptop&id=123
//     -> بيدور على _id في الـ collection، ولو مالقاش، بيدور جوا مصفوفة
//        "products" المتداخلة (nested) جوا الـ documents عن منتج بنفس
//        الـ id بتاعه (زي ما كان شغال في المنتجات)
//
//   GET  /api/data?collection=laptop&category=gaming&limit=12
//     -> فلترة المنتجات المتداخلة جوا "products" حسب الفئة، مع حد أقصى للعدد
//
//   POST /api/data?collection=carts   (body: JSON)
//     -> إضافة document جديد للـ collection
//
//   DELETE /api/data?collection=carts&id=<_id>
//     -> حذف document بالـ _id بتاعه من الـ collection
//
// ملاحظة: لازم يكون عندك متغير البيئة MONGO_URI مضبوط (في .env.local) وبيشاور
// على نفس قاعدة البيانات اللي كان بيستخدمها الباك إند الخارجي، عشان تلاقي نفس
// البيانات بالظبط.

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// أسماء الـ collections الخاصة بصفحات المنتجات، دي اللي بترجع لما محدش يحدد "collection"
const PRODUCT_COLLECTIONS = [
  "laptop",
  "component",
  "other",
  "accessories",
  "printers",
  "monitors",
  "pos",
  "pc-build",
  "storage-devices",
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function toObjectIdSafe(id) {
  try {
    if (!id || !ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// دور جوا مصفوفة "products" المتداخلة داخل documents الـ collection عن عنصر بنفس الـ id
function findNestedProductById(docs, id) {
  for (const doc of docs) {
    if (Array.isArray(doc.products)) {
      const found = doc.products.find((p) => String(p?.id) === String(id));
      if (found) return found;
    }
  }
  return null;
}

// فلترة المنتجات المتداخلة حسب الفئة
function filterNestedByCategory(docs, category, limit) {
  let result = [];
  for (const doc of docs) {
    if (Array.isArray(doc.products)) {
      result.push(
        ...doc.products.filter(
          (p) => String(p?.category).toLowerCase() === String(category).toLowerCase()
        )
      );
    }
  }
  if (limit) {
    const n = Number(limit);
    if (!Number.isNaN(n) && n > 0) result = result.slice(0, n);
  }
  return result;
}

/**
 * GET /api/data
 */
export async function GET(request) {
  try {
    const db = await connectToDatabase();
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const id = url.searchParams.get("id");
    const category = url.searchParams.get("category");
    const limit = url.searchParams.get("limit");
    const email = url.searchParams.get("email");

    // مفيش collection محدد => رجّع كل collections المنتجات مرة واحدة
    if (!collection) {
      const entries = await Promise.all(
        PRODUCT_COLLECTIONS.map(async (col) => {
          const docs = await db.collection(col).find({}).toArray();
          return [col, docs];
        })
      );
      return jsonResponse(Object.fromEntries(entries));
    }

    const coll = db.collection(collection);

    // البحث بالـ id: جرب _id الحقيقي الأول، ولو مش لاقي، دور جوا "products" المتداخلة
    if (id) {
      const oid = toObjectIdSafe(id);
      let doc = null;

      if (oid) {
        doc = await coll.findOne({ _id: oid });
      }

      if (doc) return jsonResponse(doc);

      const docs = await coll.find({}).toArray();
      const nestedProduct = findNestedProductById(docs, id);
      if (nestedProduct) return jsonResponse(nestedProduct);

      return jsonResponse({ error: "Not found" }, 404);
    }

    // فلترة حسب الفئة (وبالحد الأقصى للعدد لو موجود)
    if (category) {
      const docs = await coll.find({}).toArray();
      return jsonResponse(filterNestedByCategory(docs, category, limit));
    }

    // جلب كل الـ documents في الـ collection (مع فلترة اختيارية بالإيميل)
    const filter = email ? { email } : {};
    const docs = await coll.find(filter).toArray();
    return jsonResponse(docs);
  } catch (err) {
    console.error("GET /api/data error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * POST /api/data?collection=carts
 * بيضيف document جديد للـ collection المحددة
 */
export async function POST(request) {
  try {
    const db = await connectToDatabase();
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");

    if (!collection) {
      return jsonResponse({ error: "collection query param is required" }, 400);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid or missing JSON body" }, 400);
    }

    const coll = db.collection(collection);
    const doc = {
      ...body,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const result = await coll.insertOne(doc);
    return jsonResponse({ _id: result.insertedId, ...doc }, 201);
  } catch (err) {
    console.error("POST /api/data error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * DELETE /api/data?collection=carts&id=<_id>
 * بيحذف document بالـ _id بتاعه
 */
export async function DELETE(request) {
  try {
    const db = await connectToDatabase();
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const id = url.searchParams.get("id");

    if (!collection || !id) {
      return jsonResponse({ error: "collection and id query params are required" }, 400);
    }

    const oid = toObjectIdSafe(id);
    if (!oid) {
      return jsonResponse({ error: "Invalid id" }, 400);
    }

    const coll = db.collection(collection);
    const result = await coll.deleteOne({ _id: oid });

    return jsonResponse({
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("DELETE /api/data error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}
