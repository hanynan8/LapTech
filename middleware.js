// middleware.js (put in project root or /src)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { nextUrl: url } = req;
  const pathname = url.pathname;

  // skip next/static files, public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") || // ignore api routes (don't try to redirect APIs)
    pathname.includes(".") // static files like .png .js .css
  ) {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    // If secret missing, log so you can see it in Vercel logs.
    console.error("NEXTAUTH_SECRET (or AUTH_SECRET) is not defined in environment.");
    return NextResponse.next();
  }

  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch (err) {
    console.error("getToken error:", err);
    // allow request to continue (so site doesn't fully break); logs will show the problem
    token = null;
  }

  const isLoginPage = pathname === "/login" || pathname === "/signin";
  const isRegisterPage = pathname === "/register";
  const isProtected =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/pay") ||
    pathname.startsWith("/checkout");

  // If logged in → prevent visiting login/register
  if (token && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/profile", url));
  }

  // If NOT logged in and visiting protected page → redirect to login (preserve callback)
  if (!token && isProtected) {
    const loginUrl = new URL("/login", url);
    // preserve where user wanted to go
    loginUrl.searchParams.set("callbackUrl", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/profile",
    "/pay/:path*",
    "/pay",
    "/checkout/:path*",
    "/checkout",
    "/login",
    "/register",
  ],
};
