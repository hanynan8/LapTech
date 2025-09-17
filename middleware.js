import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log("Token:", token);  // هيطبع الـ token أو null لو مش موجود

  // لو المستخدم مسجل دخول، امنعه من صفحات تسجيل الدخول/التسجيل
  if (token) {
    if (
      pathname === "/api/auth/signin" ||
      pathname === "/api/auth/AuthButtons/signin" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // لو المستخدم مش مسجل دخول، احمي الصفحات الخاصة
  if (!token) {
    if (pathname.startsWith("/profile") || pathname.startsWith("/pay")) {
      return NextResponse.redirect(new URL("/login", req.url)); // أو "/api/auth/signin" لو عايز
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/auth/signin",
    "/api/auth/AuthButtons/signin",
    "/profile",
    "/register",
    "/login",
    "/pay/:path*",
  ], // ضفت /pay/:path* عشان المسارات الفرعية
};