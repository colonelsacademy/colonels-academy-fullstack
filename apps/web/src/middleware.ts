import { type NextRequest, NextResponse } from "next/server";

// Protected routes — anyone without a session cookie gets bounced to /login.
// TODO: upgrade cookie validation to Firebase Admin SDK verifySessionCookie()
// once the server-side session minting endpoint (/api/auth/session) is wired up.
const PROTECTED: string[] = ["/admin", "/dashboard"];
const SESSION_COOKIE = "__session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE);
  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
