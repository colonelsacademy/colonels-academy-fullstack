import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Standard routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/courses/enroll"];

// Routes that are only for unauthenticated users
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const sessionToken = cookies.get("ca_session")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // 1. If trying to access a protected route without a session
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access an auth route (like /login) with an active session
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/courses/enroll/:path*", "/login"],
};
