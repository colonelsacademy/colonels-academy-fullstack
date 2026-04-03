import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import {
  getFirebaseMobileAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "../lib/firebase";

interface AuthContextValue {
  accessToken: string | null;
  error: string | null;
  isConfigured: boolean;
  isReady: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const auth = getFirebaseMobileAuth();

  useEffect(() => {
    if (!auth) {
      setIsReady(true);
      setUser(null);
      setAccessToken(null);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAccessToken(nextUser ? await nextUser.getIdToken() : null);
      setIsReady(true);
    });

    return unsubscribe;
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      error,
      isConfigured: Boolean(auth),
      isReady,
      async signInWithEmail(email, password) {
        if (!auth) {
          setError("Firebase mobile auth is not configured.");
          return;
        }

        try {
          setError(null);
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (authError) {
          setError(authError instanceof Error ? authError.message : "Sign-in failed.");
        }
      },
      async signOutUser() {
        if (!auth) {
          return;
        }

        try {
          setError(null);
          await signOut(auth);
        } catch (authError) {
          setError(authError instanceof Error ? authError.message : "Sign-out failed.");
        }
      },
      user
    }),
    [accessToken, auth, error, isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
