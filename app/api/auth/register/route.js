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

    // التحقق من البيانات المطلوبة (تأكد من تحويل القيم لنصوص قبل trim)
    if (!name || !String(name).trim() || !email || !String(email).trim() || !password || !phone || !String(phone).trim()) {
      return NextResponse.json(
        {
          message: 'البيانات الأساسية مطلوبة (الاسم، البريد، كلمة المرور، والهاتف)',
        },
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailTrim = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      return NextResponse.json({ message: 'البريد الإلكتروني غير صحيح' }, { status: 400 });
    }

    // التحقق من صحة رقم الهاتف المصري (010,011,012,015)
    const phoneTrim = String(phone).trim();
    const phoneRegex = /^01(?:0|1|2|5)[0-9]{8}$/;
    if (!phoneRegex.test(phoneTrim)) {
      return NextResponse.json(
        { message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010، 011، 012، أو 015' },
        { status: 400 }
      );
    }

    // الهاتف الثانوي إن وُجد
    const phoneSecondaryTrim = phoneSecondary ? String(phoneSecondary).trim() : '';
    if (phoneSecondaryTrim && !phoneRegex.test(phoneSecondaryTrim)) {
      return NextResponse.json({ message: 'رقم الهاتف الثانوي غير صحيح' }, { status: 400 });
    }

    // الاتصال بقاعدة البيانات
    await connectMongoDB();

    // استيراد الموديل بعد الاتصال أو استورده في أعلى الملف كـ import User from '...'
    const User = (await import('../../../../models/user')).default;

    // التحقق من عدم وجود المستخدم بالفعل (بالبريد أو الهاتف)
    const existingUser = await User.findOne({
      $or: [{ email: emailTrim }, { phone: phoneTrim }],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { message: 'العميل موجود بالفعل بهذا البريد الإلكتروني أو رقم الهاتف' },
        { status: 409 }
      );
    }

    // التحقق من بيانات العنوان الأساسية - نتأكد من وجود مصفوفة وعناصر صالحة
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ message: 'بيانات العنوان الأساسية مطلوبة' }, { status: 400 });
    }

    const mainAddr = addresses[0];
    if (
      !mainAddr ||
      !mainAddr.governorate ||
      !mainAddr.city || !String(mainAddr.city).trim() ||
      !mainAddr.district || !String(mainAddr.district).trim() ||
      !mainAddr.street || !String(mainAddr.street).trim() ||
      !mainAddr.buildingNumber || !String(mainAddr.buildingNumber).trim()
    ) {
      return NextResponse.json({ message: 'بيانات العنوان الأساسية (الحى/المدينة/الشارع/رقم المبنى) مطلوبة' }, { status: 400 });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(String(password), 12);

    // تجهيز العناوين بأمان وتقليم القيم
    const preparedAddresses = addresses.map((addr = {}) => ({
      type: addr.type || 'home',
      governorate: addr.governorate,
      city: addr.city ? String(addr.city).trim() : '',
      district: addr.district ? String(addr.district).trim() : '',
      street: addr.street ? String(addr.street).trim() : '',
      buildingNumber: addr.buildingNumber ? String(addr.buildingNumber).trim() : '',
      floor: addr.floor ? String(addr.floor).trim() : undefined,
      apartment: addr.apartment ? String(addr.apartment).trim() : undefined,
      landmark: addr.landmark ? String(addr.landmark).trim() : undefined,
      postalCode: addr.postalCode ? String(addr.postalCode).trim() : undefined,
      isDefault: typeof addr.isDefault === 'boolean' ? addr.isDefault : false,
    }));

    // إنشاء المستخدم
    const newUser = await User.create({
      name: String(name).trim(),
      email: emailTrim,
      password: hashedPassword,
      phone: phoneTrim,
      phoneSecondary: phoneSecondaryTrim || undefined,
      addresses: preparedAddresses,
      preferredDeliveryTime: preferredDeliveryTime || 'anytime',
      deliveryInstructions: deliveryInstructions ? String(deliveryInstructions).trim() : undefined,
    });

    // إعداد ردّ آمن (بدون password)
    const userResponse = {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      addresses: newUser.addresses,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);

    // Duplicate key (مثلاً email أو phone) من MongoDB
    if (error && error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const arabicField =
        duplicateField === 'email'
          ? 'البريد الإلكتروني'
          : duplicateField === 'phone'
          ? 'رقم الهاتف'
          : duplicateField === 'nationalId'
          ? 'الرقم القومي'
          : 'البيانات';

      return NextResponse.json({ message: `${arabicField} مستخدم بالفعل` }, { status: 409 });
    }

    // Validation errors من Mongoose
    if (error && error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ message: 'حدث خطأ في السيرفر. حاول مرة أخرى لاحقاً' }, { status: 500 });
  }
}
