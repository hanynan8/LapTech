// middleware-debug.js (استبدل مؤقتًا middleware.js)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // طبع الـ cookies الخام اللي واصلة للـ Edge function
  console.log("MW DEBUG pathname:", pathname);
  console.log("MW DEBUG cookie header:", req.headers.get("cookie"));

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  console.log("MW DEBUG secret exists:", !!secret);

  try {
    const token = await getToken({ req, secret, secureCookie: process.env.NODE_ENV === "production" });
    console.log("MW DEBUG token present:", !!token, "token:", token ? { id: token?.sub || token?.id } : null);
  } catch (err) {
    console.error("MW DEBUG getToken error:", err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/profile", "/pay/:path*", "/pay"]
};
