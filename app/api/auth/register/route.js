export const runtime = 'nodejs';

import { connectMongoDB } from '../../../../lib/mongoAuth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const {
      name,
      email,
      password,
      phone,
      phoneSecondary,
      addresses,
      preferredDeliveryTime,
      deliveryInstructions,
    } = await req.json();

    // التحقق من البيانات المطلوبة
    if (!name?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return NextResponse.json(
        {
          message:
            'البيانات الأساسية مطلوبة (الاسم، البريد، كلمة المرور، والهاتف)',
        },
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من صحة رقم الهاتف المصري
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        {
          message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010، 011، 012، أو 015',
        },
        { status: 400 }
      );
    }

    // التحقق من الهاتف الثانوي إذا تم إدخاله
    if (phoneSecondary?.trim() && !phoneRegex.test(phoneSecondary.trim())) {
      return NextResponse.json(
        { message: 'رقم الهاتف الثانوي غير صحيح' },
        { status: 400 }
      );
    }

    // ✅ الاتصال أولاً قبل كل حاجة
    await connectMongoDB();

    // ✅ استيراد الموديل بعد الاتصال - تأكد من تغيير المسار للموديل الجديد
    const user = (await import('../../../../models/user')).default;

    // التحقق من عدم وجود العميل مسبقاً
    const existinguser = await user.findOne({
      $or: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
    });

    if (existinguser) {
      return NextResponse.json(
        { message: 'العميل موجود بالفعل بهذا البريد الإلكتروني أو رقم الهاتف' },
        { status: 409 }
      );
    }

    // التحقق من بيانات العنوان الأساسية
    if (
      !addresses ||
      addresses.length === 0 ||
      !addresses[0]?.governorate ||
      !addresses[0]?.city?.trim() ||
      !addresses[0]?.district?.trim() ||
      !addresses[0]?.street?.trim() ||
      !addresses[0]?.buildingNumber?.trim()
    ) {
      return NextResponse.json(
        { message: 'بيانات العنوان الأساسية مطلوبة' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء العميل الجديد
    const newuser = await user.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      phoneSecondary: phoneSecondary?.trim() || undefined,
      addresses: addresses.map((addr) => ({
        type: addr.type || 'home',
        governorate: addr.governorate,
        city: addr.city.trim(),
        district: addr.district.trim(),
        street: addr.street.trim(),
        buildingNumber: addr.buildingNumber.trim(),
        floor: addr.floor?.trim() || undefined,
        apartment: addr.apartment?.trim() || undefined,
        landmark: addr.landmark?.trim() || undefined,
        postalCode: addr.postalCode?.trim() || undefined,
        isDefault: addr.isDefault !== undefined ? addr.isDefault : true,
      })),
      preferredDeliveryTime: preferredDeliveryTime || 'anytime',
      deliveryInstructions: deliveryInstructions?.trim() || undefined,
    });

    // إرسال البيانات بدون كلمة المرور
    const userResponse = {
      id: newuser._id,
      name: newuser.name,
      email: newuser.email,
      phone: newuser.phone,
      addresses: newuser.addresses,
      createdAt: newuser.createdAt,
    };

    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // التعامل مع أخطاء MongoDB المختلفة
    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const arabicField =
        duplicateField === 'email'
          ? 'البريد الإلكتروني'
          : duplicateField === 'phone'
          ? 'رقم الهاتف'
          : duplicateField === 'nationalId'
          ? 'الرقم القومي'
          : 'البيانات';

      return NextResponse.json(
        { message: `${arabicField} مستخدم بالفعل` },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      // خطأ في التحقق من صحة البيانات
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'حدث خطأ في السيرفر. حاول مرة أخرى لاحقاً' },
      { status: 500 }
    );
  }
}
