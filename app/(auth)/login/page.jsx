'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ logoGradient = 'from-purple-600 to-blue-600' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // بسيط client-side validation
    if (!email.trim() || !password) {
      setError('من فضلك أكمل البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('بيانات غير صحيحة، تحقق من البريد وكلمة المرور.');
        setLoading(false);
        return;
      }

      // نجاح
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('حصل خطأ، حاول مرة أخرى لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="font-arabic min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border`}>
        {/* Gradient top accent (brand) */}
        <div className={`h-1 w-full bg-gradient-to-r ${logoGradient}`} />

        <div className="bg-white p-8 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              تسجيل الدخول
            </h2>
            <p className="text-sm text-gray-500">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-describedby="form-error">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">البريد الإلكتروني</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="example@domain.com"
                className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="البريد الإلكتروني"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="كلمة المرور"
                  className="border border-gray-200 rounded-lg px-4 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label="كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    // Eye off icon (hide password) - simpler design
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.88 9.88a3 3 0 104.24 4.24" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.73 5.08A10.43 10.43 0 0112 5c4.74 0 9 2.61 9 7 0 1.19-.22 2.34-.6 3.41m-3.64 3.64a9.88 9.88 0 01-4.76 1.55c-4.74 0-9-2.61-9-7 0-1.47.35-2.87.93-4.09" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    // Eye icon (show password)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-start text-xs text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                تذكرني
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              تسجيل الدخول
            </button>

            {/* Error message */}
            <div id="form-error" aria-live="assertive" className="min-h-[1.25rem]">
              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <p className="text-sm text-center text-gray-600 mt-3">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-purple-600 font-medium hover:underline">
                سجل الآن
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}