export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongoAuth";
import User from "../../../../models/user";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, nationalId } = body ?? {};

    // تأكد من وجود مدخلة واحدة على الأقل
    const searchConditions = [];
    if (email && String(email).trim()) {
      searchConditions.push({ email: String(email).trim().toLowerCase() });
    }
    if (phone && String(phone).trim()) {
      searchConditions.push({ phone: String(phone).trim() });
    }
    if (nationalId && String(nationalId).trim()) {
      searchConditions.push({ nationalId: String(nationalId).trim() });
    }

    if (searchConditions.length === 0) {
      return NextResponse.json(
        {
          user: null,
          message: "يجب تقديم بريد إلكتروني أو رقم هاتف أو رقم قومي للتحقق",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // لا نستخدم نفس اسم الموديل كمتغير نتيحة البحث
    const foundUser = await User.findOne({ $or: searchConditions })
      .select("_id email phone name createdAt")
      .lean();

    console.log("user search result:", foundUser);

    if (foundUser) {
      return NextResponse.json({
        user: {
          _id: foundUser._id,
          email: foundUser.email,
          phone: foundUser.phone,
          name: foundUser.name,
          exists: true,
          registrationDate: foundUser.createdAt,
        },
      });
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("User exists check error:", error);
    return NextResponse.json(
      {
        user: null,
        message: "حدث خطأ أثناء التحقق من وجود المستخدم",
      },
      { status: 500 }
    );
  }
}
