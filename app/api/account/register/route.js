// app/api/account/register/route.js
//
// تسجيل عميل جديد بإيميل + باسورد (بيطابق الفورم في app/(auth)/register/page.jsx).
// كلمة المرور بتتخزن مشفرة بـ bcryptjs (كانت متثبتة في package.json بس مش
// مستخدمة في أي مكان)، وأبداً متتخزنش نص صريح.
//
// ملحوظة: الراوت ده متعمد يكون برّه مسار /api/auth/ عشان يتفادى تعارض
// معروف مع next-auth's catch-all route ([...nextauth]) اللي بيبلع أي
// طلب POST تحت /api/auth/* (حتى لو فيه راوت static أكتر تحديدًا) في
// بعض إعدادات Turbopack على ويندوز. الراوت القديم /api/register
// بيستخدم اسم مستخدم بس (بدون إيميل/باسورد) ومش متصل بأي صفحة فعلياً.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
//  POST /api/auth/register
//  Body: {
//    name, email, password, phone, phoneSecondary?,
//    addresses: [{ governorate, city, district, street, buildingNumber, ... }],
//    preferredDeliveryTime?, deliveryInstructions?
//  }
// ============================================================
export async function POST(request) {
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return jsonResponse({ message: "طلبات كتير، حاول تاني بعد شوية" }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ message: "بيانات غير صحيحة" }, 400);
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const phone = String(body?.phone || "").trim();
  const phoneSecondary = body?.phoneSecondary ? String(body.phoneSecondary).trim() : null;
  const addresses = Array.isArray(body?.addresses) ? body.addresses : [];
  const preferredDeliveryTime = body?.preferredDeliveryTime
    ? String(body.preferredDeliveryTime).trim()
    : "anytime";
  const deliveryInstructions = body?.deliveryInstructions
    ? String(body.deliveryInstructions).trim()
    : null;

  if (!name || !email || !password || !phone) {
    return jsonResponse(
      { message: "الاسم والبريد الإلكتروني وكلمة المرور والهاتف مطلوبين" },
      400
    );
  }

  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ message: "صيغة البريد الإلكتروني غير صحيحة" }, 400);
  }

  if (password.length < 6) {
    return jsonResponse({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, 400);
  }

  if (addresses.length === 0) {
    return jsonResponse({ message: "بيانات العنوان مطلوبة" }, 400);
  }

  try {
    await connectToMongo();
    const AuthModel = getAuthModel();

    // نفس منطق التحقق الموجود في /api/auth/userExists، وبنكرره هنا كـ
    // double-check قبل الإنشاء عشان نمنع الـ race condition لو طلبين
    // جم في نفس اللحظة.
    const existing = await AuthModel.findOne({
      $or: [
        { email: { $regex: `^${escapeRegex(email)}$`, $options: "i" } },
        { phone },
      ],
    });

    if (existing) {
      return jsonResponse(
        { message: "المستخدم موجود بالفعل بهذا البريد الإلكتروني أو رقم الهاتف" },
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // بنبني نص عنوان مبسط من أول عنوان، عشان أي جزء تاني في الموقع بيقرا
    // حقل address كـ نص مباشر (زي صفحة الدفع) يفضل شغال زي ما هو.
    const primaryAddress = addresses[0] || {};
    const addressSummary = [
      primaryAddress.governorate,
      primaryAddress.city,
      primaryAddress.district,
      primaryAddress.street,
      primaryAddress.buildingNumber,
    ]
      .filter(Boolean)
      .join("، ");

    const created = await AuthModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      phoneSecondary,
      addresses,
      address: addressSummary || null,
      preferredDeliveryTime,
      deliveryInstructions,
      paymentMethod: "cash",
      isAdmin: false, // كل مستخدم جديد بيتسجل من الفورم مش أدمن
      createdAt: new Date().toISOString(),
    });

    return jsonResponse({ ok: true, id: created._id }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return jsonResponse({ message: "حصل خطأ في السيرفر، حاول مرة أخرى" }, 500);
  }
}