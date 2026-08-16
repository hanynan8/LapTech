// app/api/auth/[...nextauth]/auth.js
//
// إعدادات NextAuth v5 (beta) نفسها + بناء { handlers, auth, signIn, signOut }.
// أي مكان في المشروع محتاج يتأكد من الـ session (زي app/api/data/route.js)
// بيستورد `auth` من هنا مباشرة، وملف route.js بيستورد `handlers` بس عشان
// يصدرهم كـ GET/POST.

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI;

if (!globalThis._mongoAuth) globalThis._mongoAuth = { conn: null, promise: null };

async function connectToMongo() {
  if (globalThis._mongoAuth.conn) return globalThis._mongoAuth.conn;
  if (!MONGO_URI) throw new Error('MONGO_URI not set');

  if (!globalThis._mongoAuth.promise) {
    globalThis._mongoAuth.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  globalThis._mongoAuth.conn = await globalThis._mongoAuth.promise;
  return globalThis._mongoAuth.conn;
}

const authSchema = new mongoose.Schema({}, { strict: false });
function getAuthModel() {
  return mongoose.models.Model_auth || mongoose.model('Model_auth', authSchema, 'auth');
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        // "loginType" بيحدد إيه نوع اللوجن: "admin" أو "customer"
        loginType:     { label: "Login Type",     type: "text" },
        password:      { label: "Password",       type: "password" },
        email:         { label: "Email",          type: "text" },
        name:          { label: "Name",           type: "text" },
        phone:         { label: "Phone",          type: "text" },
        address:       { label: "Address",        type: "text" },
        paymentMethod: { label: "Payment Method", type: "text" },
      },

      async authorize(credentials) {
        try {
          await connectToMongo();
          const AuthModel = getAuthModel();

          // ============================================================
          //  Admin login — loginType === "admin"
          //  الأدمن بيبعت password فقط
          // ============================================================
          if (credentials?.loginType === 'admin') {
            if (!credentials?.password) return null;

            const adminDoc = await AuthModel.findOne({ pass: credentials.password });
            if (!adminDoc) return null;

            return {
              id:            adminDoc._id?.toString(),
              name:          'Admin',
              isAdmin:       true,
              phone:         null,
              address:       null,
              paymentMethod: null,
            };
          }

          // ============================================================
          //  Customer login بالإيميل + الباسورد
          //  ده الفورم الأساسي المستخدم دلوقتي في app/(auth)/login/page.jsx
          //  ولازم يتوافق مع الحساب اللي بيتعمل في POST /api/auth/register
          // ============================================================
          if (credentials?.email) {
            if (!credentials?.password) return null;

            const escapedEmail = credentials.email
              .trim()
              .toLowerCase()
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const user = await AuthModel.findOne({
              email: { $regex: `^${escapedEmail}$`, $options: 'i' },
            });

            // مفيش حساب بالإيميل ده، أو الحساب ده أدمن (مالوش password مشفر)
            if (!user || !user.password) return null;

            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) return null;

            return {
              id:            user._id?.toString(),
              name:          user.name,
              email:         user.email,
              phone:         user.phone         || null,
              address:       user.address       || null,
              paymentMethod: user.paymentMethod || 'cash',
              isAdmin:       false,
            };
          }

          // ============================================================
          //  Customer login بالاسم بس (للتوافق مع أي حسابات قديمة اتسجلت
          //  قبل ما يتضاف الإيميل/الباسورد للفورم)
          // ============================================================
          if (!credentials?.name) return null;

          const escaped = credentials.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const user = await AuthModel.findOne({
            name: { $regex: `^${escaped}$`, $options: 'i' },
          });

          if (!user) return null;

          // لو الـ document ده عنده pass → ده أدمن، ممنوع يدخل من هنا
          if (user.pass) return null;

          return {
            id:            user._id?.toString(),
            name:          user.name,
            phone:         user.phone         || credentials.phone         || null,
            address:       user.address       || credentials.address       || null,
            paymentMethod: user.paymentMethod || credentials.paymentMethod || 'cash',
            isAdmin:       false,
          };

        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = user.id;
        token.name          = user.name;
        token.email         = user.email;
        token.phone         = user.phone;
        token.address       = user.address;
        token.paymentMethod = user.paymentMethod;
        token.isAdmin       = user.isAdmin;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id            = token.id;
        session.user.name          = token.name;
        session.user.email         = token.email;
        session.user.phone         = token.phone;
        session.user.address       = token.address;
        session.user.paymentMethod = token.paymentMethod;
        session.user.isAdmin       = token.isAdmin;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// ✅ NextAuth v5: النداء ده بيرجع { handlers, auth, signIn, signOut }
// مش handler function زي v4. لازم نستخدم الشكل ده عشان auth() تشتغل
// في أي مكان تاني في المشروع (زي app/api/data/route.js).
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);