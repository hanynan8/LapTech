// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && (pathname === "/api/auth/signin" || pathname === "/api/auth/AuthButtons/signin")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (!token && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (!token && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (token && pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }
  
  if (!token && pathname.startsWith("/pay")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/api/auth/signin", "/api/auth/AuthButtons/signin", '/profile', '/register', '/login', '/pay'],
};


//###############################################
//###############################################
//###############################################
//###############################################
////////////////////////////////
//###############################################
//###############################################
//###############################################
//###############################################
////////////////////////////////
//###############################################
//###############################################
//###############################################
//###############################################


// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(req) {
//   console.log("Pathname:", req.nextUrl.pathname);
//   console.log("Cookies:", req.cookies);
//   console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "Set" : "Not Set");
//   const token = await getToken({ req, secret: process.env.AUTH_SECRET });
//   console.log("Token:", token);
  
//   const { pathname } = req.nextUrl;

//   // لو المستخدم مسجل دخول، امنعه من صفحات تسجيل الدخول/التسجيل
//   if (token) {
//     if (
//       pathname === "/api/auth/signin" ||
//       pathname === "/api/auth/AuthButtons/signin" ||
//       pathname.startsWith("/login") ||
//       pathname.startsWith("/register")
//     ) {
//       return NextResponse.redirect(new URL("/profile", req.url));
//     }
//   }

//   // لو المستخدم مش مسجل دخول، احمي الصفحات الخاصة
//   if (!token) {
//     if (pathname.startsWith("/profile") || pathname.startsWith("/pay")) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/profile/:path*",
//     "/api/auth/signin",
//     "/api/auth/AuthButtons/signin",
//     "/profile",
//     "/register",
//     "/login",
//     "/pay/:path*",
//   ],
// };