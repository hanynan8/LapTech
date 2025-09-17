import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectMongoDB } from '../../../../lib/mongoAuth';
import User from '../../../../models/user';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          await connectMongoDB();
          console.log("MongoDB Connected");
          const user = await User.findOne({ email });
          if (!user) {
            console.log("No user found for email:", email);
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            console.log("Password mismatch for email:", email);
            return null;
          }
          console.log("User authenticated:", user.email);
          return user;
        } catch (error) {
          console.log("Authorize Error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/profile',
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // لازم true لـ Vercel (HTTPS)
      },
    },
  },
});