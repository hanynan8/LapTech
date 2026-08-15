// app/api/auth/[...nextauth]/route.js
//
// إعدادات NextAuth والـ authorize logic كلها موجودة في ./auth.js.
// الملف ده بس بيصدّر الـ GET/POST handlers اللي next.js محتاجهم
// كـ route handler لمسار /api/auth/[...nextauth].

import { handlers } from './auth';

export const { GET, POST } = handlers;
