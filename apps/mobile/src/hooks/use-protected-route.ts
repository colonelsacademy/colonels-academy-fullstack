import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../providers/auth-provider";

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute() {
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !user) {
      // User is not logged in, redirect to login
      router.replace("/login");
    }
  }, [user, isReady]);

  return { user, isReady };
}
