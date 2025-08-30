'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Home,
  ArrowLeft,
  Search,
  RefreshCw,
  Smartphone,
  Laptop,
  Headphones,
} from 'lucide-react';

const NotFound = () => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-4xl w-full mx-auto text-center">
        {/* رسالة الخطأ الرئيسية */}
        <div className="mb-12">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            عذراً، الصفحة غير موجودة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            ربما قد تكون أخطأت في كتابة العنوان أو أن الصفحة التي تبحث عنها لم
            تعد متاحة.
          </p>
        </div>

        {/* الأزرار الأساسية */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => router.back()}
            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border border-gray-200"
          >
            <ArrowLeft size={20} />
            العودة للخلف
          </button>

          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            الذهاب للصفحة الرئيسية
          </Link>
        </div>

        {/* رسالة أسفل الصفحة */}
        <div className="mt-12">
          <p className="text-gray-600">
            إذا استمرت المشكلة، يرجى{' '}
            <button className="text-purple-600 font-bold hover:underline">
              الاتصال بالدعم الفني
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
