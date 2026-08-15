// app/api/register/route.js

import mongoose from "mongoose";

// ============================================================
//  نفس الاتصال بالـ Mongo المستخدم في NextAuth (globalThis._mongoAuth)
//  عشان نتجنب فتح اتصال زيادة، وميحصلش أي round-trip لـ /api/data
// ============================================================
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

// ============================================================
//  Rate limit بسيط عشان حد ميعملش تسجيل حسابات بالجملة (spam)
// ============================================================
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================
//  POST /api/register
//  Body: { name, phone, address, location?, paymentMethod }
// ============================================================
export async function POST(request) {
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return jsonResponse({ error: "Too many requests — slow down" }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const address = String(body?.address || "").trim();
  const location = body?.location ? String(body.location).trim() : null;
  const paymentMethod = body?.paymentMethod === "visa" ? "visa" : "cash";

  if (!name || !phone || !address) {
    return jsonResponse({ error: "name, phone and address are required" }, 400);
  }

  try {
    await connectToMongo();
    const AuthModel = getAuthModel();

    // نفس منطق البحث Case-insensitive المستخدم في authorize()
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await AuthModel.findOne({
      name: { $regex: `^${escaped}$`, $options: "i" },
    });

    if (existing) {
      return jsonResponse({ error: "Name already exists" }, 409);
    }

    const created = await AuthModel.create({
      name,
      phone,
      address,
      location,
      paymentMethod,
      isAdmin: false, // كل مستخدم جديد بيتسجل من الفورم مش أدمن
      createdAt: new Date().toISOString(),
    });

    return jsonResponse({ ok: true, id: created._id }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}