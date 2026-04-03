"use client";

import type { AuthSessionUser } from "@colonels-academy/contracts";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: AuthSessionUser | null;
  loading: boolean;
  authenticated: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [csrfData, setCsrfData] = useState<{ token: string; headerName: string } | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthenticated(data.authenticated);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const getCsrfToken = async (forceRefresh = false) => {
    if (csrfData && !forceRefresh) {
      return csrfData;
    }

    const res = await fetch("/api/auth/csrf");
    if (!res.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    const data = await res.json();
    setCsrfData({ token: data.csrfToken, headerName: data.headerName });
    return { token: data.csrfToken, headerName: data.headerName };
  };

  const login = async (idToken: string) => {
    setLoading(true);
    try {
      // 1. Get CSRF token (from cache or fetch)
      let { token, headerName } = await getCsrfToken();

      // 2. Exchange ID token for session cookie
      let res = await fetch("/api/auth/session-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [headerName]: token
        },
        body: JSON.stringify({ idToken })
      });

      // Retry once if 403 (possibly stale CSRF token)
      if (res.status === 403) {
        const refreshed = await getCsrfToken(true);
        token = refreshed.token;
        headerName = refreshed.headerName;

        res = await fetch("/api/auth/session-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [headerName]: token
          },
          body: JSON.stringify({ idToken })
        });
      }

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || "Login failed");
      }

      const data = await res.json();
      setUser(data.user);
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // 1. Get CSRF token
      let { token, headerName } = await getCsrfToken();

      // 2. Logout
      let res = await fetch("/api/auth/session-logout", {
        method: "POST",
        headers: {
          [headerName]: token
        }
      });

      // Retry once if 403
      if (res.status === 403) {
        const refreshed = await getCsrfToken(true);
        token = refreshed.token;
        headerName = refreshed.headerName;

        res = await fetch("/api/auth/session-logout", {
          method: "POST",
          headers: {
            [headerName]: token
          }
        });
      }

      if (res.ok) {
        setUser(null);
        setAuthenticated(false);
      } else {
        const error = await res.json().catch(() => ({ message: "Logout failed" }));
        console.error("Logout failed:", error);
        throw new Error(error.message || "Logout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated,
        login,
        logout,
        refresh: fetchSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
