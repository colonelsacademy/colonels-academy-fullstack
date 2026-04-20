import { API_BASE_URL } from "@/lib/apiClient";
import { cookies } from "next/headers";

interface SessionUser {
  uid: string;
  id?: string;
  email?: string;
  role?: string;
}

interface ServerSession {
  authenticated: boolean;
  user: SessionUser | null;
}

/**
 * Server-side session helper for Next.js API routes.
 * Reads the session cookie and validates it against the API.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ca_session")?.value;

    if (!sessionCookie) return null;

    const res = await fetch(`${API_BASE_URL}/v1/auth/session`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: `ca_session=${sessionCookie}`
      },
      signal: AbortSignal.timeout(3000)
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.authenticated || !data.user) return null;

    // Normalize: expose both uid and id for compatibility
    return {
      authenticated: true,
      user: {
        ...data.user,
        id: data.user.uid // our DB uses firebaseUid, map uid → id
      }
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication — throws 401 response if not authenticated.
 * Use in API route handlers.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return session.user;
}

/**
 * Require admin role — throws 401/403 if not authenticated or not admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (session.user.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  return session.user;
}
