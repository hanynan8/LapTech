//api/auth/userExists/route

export const runtime = "nodejs";

import { connectMongoDB } from "../../../../lib/mongoAuth";
import user from "../../../../models/user"; // تغيير من user إلى user
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    
    const { email, phone, nationalId } = await req.json();

    // إنشاء شروط البحث
    const searchConditions = [];
    
    if (email?.trim()) {
      searchConditions.push({ email: email.trim().toLowerCase() });
    }
    
    if (phone?.trim()) {
      searchConditions.push({ phone: phone.trim() });
    }
    
    if (nationalId?.trim()) {
      searchConditions.push({ nationalId: nationalId.trim() });
    }

    // التحقق من وجود شروط بحث
    if (searchConditions.length === 0) {
      return NextResponse.json(
        { 
          user: null,
          message: "يجب تقديم بريد إلكتروني أو رقم هاتف للتحقق" 
        },
        { status: 400 }
      );
    }

    // البحث عن العميل
    const user = await user.findOne({
      $or: searchConditions
    }).select("_id email phone name createdAt");

    console.log("user search result: ", user);

    if (user) {
      // المستخدم موجود - إرسال معلومات محدودة
      return NextResponse.json({
        user: {
          _id: user._id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          exists: true,
          registrationDate: user.createdAt
        }
      });
    } else {
      // المستخدم غير موجود
      return NextResponse.json({
        user: null
      });
    }

  } catch (error) {
    console.log("User exists check error:", error);
    
    return NextResponse.json(
      { 
        user: null,
        message: "حدث خطأ أثناء التحقق من وجود المستخدم" 
      },
      { status: 500 }
    );
  }
}