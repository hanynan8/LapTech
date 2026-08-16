// app/api/account/exists/route.js
//
// بيتأكد هل فيه يوزر مسجل بالفعل بنفس الإيميل أو رقم الهاتف قبل ما نكمل
// التسجيل. الراوت ده متعمد يكون برّه مسار /api/auth/ عشان يتفادى تعارض
// معروف مع next-auth's catch-all route (شوف تعليق app/api/account/register/route.js).

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!globalThis._mongoAuth) globalThis._mongoAuth = { conn: null, promise: null };

async function connectToMongo() {
  if (globalThis._mongoAuth.conn) return globalThis._mongoAuth.conn;
  if (!MONGO_URI) throw new Error("MONGO_URI not set");

  if (!globalThis._mongoAuth.promise) {
    globalThis._mongoAuth.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  globalThis._mongoAuth.conn = await globalThis._mongoAuth.promise;
  return globalThis._mongoAuth.conn;
}

const authSchema = new mongoose.Schema({}, { strict: false });
function getAuthModel() {
  return mongoose.models.Model_auth || mongoose.model("Model_auth", authSchema, "auth");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ============================================================
//  POST /api/auth/userExists
//  Body: { email, phone }
//  Response: { user: true | false }
// ============================================================
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();

  if (!email && !phone) {
    return jsonResponse({ error: "email or phone is required" }, 400);
  }

  try {
    await connectToMongo();
    const AuthModel = getAuthModel();

    const orConditions = [];
    if (email) {
      orConditions.push({ email: { $regex: `^${escapeRegex(email)}$`, $options: "i" } });
    }
    if (phone) {
      orConditions.push({ phone });
    }

    const existing = await AuthModel.findOne({ $or: orConditions });

    return jsonResponse({ user: !!existing });
  } catch (err) {
    console.error("userExists error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}