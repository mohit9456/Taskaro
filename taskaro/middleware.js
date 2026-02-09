import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // ⛔ Never touch next-auth routes
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // 🔒 Protect secure APIs
  if (path.startsWith("/api/secure")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-email", token.email || "");
    headers.set("x-user-role", token.role || "");

    return NextResponse.next({
      request: { headers },
    });
  }

  // 🔒 Protect frontend routes
  if (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/join")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login", req.url)
      );
    }

    // optional: admin-only
    if (path.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/join/:path*",
    "/admin/:path*",
    "/api/secure/:path*",
  ],
};
