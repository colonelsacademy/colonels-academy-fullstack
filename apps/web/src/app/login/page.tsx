"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getFirebaseClientAuth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile
} from "firebase/auth";
import { ArrowRight, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/my-learning";
  const { login } = useAuth();

  const [view, setView] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function finalizeRedirectSignIn() {
      const auth = getFirebaseClientAuth();
      if (!auth) {
        return;
      }

      try {
        const result = await getRedirectResult(auth);
        if (!result?.user || cancelled) {
          return;
        }

        const token = await result.user.getIdToken();
        if (cancelled) {
          return;
        }
        await login(token);
        if (!cancelled) {
          router.push(next);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const firebaseErr = err as { code?: string; message?: string };
          setError(firebaseErr.message || "Google sign-in failed. Please try again.");
        }
      }
    }

    void finalizeRedirectSignIn();

    return () => {
      cancelled = true;
    };
  }, [login, next, router]);

  const resetForm = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseClientAuth();
      if (!auth) throw new Error("Firebase is not configured.");
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const token = await user.getIdToken();
      await login(token);
      
      // Check if trying to access admin route
      if (next.startsWith("/admin")) {
        // Fetch user role to verify admin access
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.user?.role !== "admin") {
            // Not an admin, redirect to my-learning instead
            router.push("/my-learning");
            return;
          }
        }
      }
      
      router.push(next);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/popup-blocked") {
        const auth = getFirebaseClientAuth();
        if (!auth) {
          setError("Firebase is not configured.");
          return;
        }
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
        return;
      }
      setError(firebaseErr.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseClientAuth();
      if (!auth) throw new Error("Firebase is not configured.");

      if (view === "signup") {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(res.user, { displayName: name });
        const token = await res.user.getIdToken();
        await login(token);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const token = await res.user.getIdToken();
        await login(token);
      }
      
      // Check if trying to access admin route
      if (next.startsWith("/admin")) {
        // Fetch user role to verify admin access
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.user?.role !== "admin") {
            // Not an admin, redirect to my-learning instead
            router.push("/my-learning");
            return;
          }
        }
      }
      
      router.push(next);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("Email already registered. Please sign in.");
        setView("signin");
      } else if (
        firebaseErr.code === "auth/wrong-password" ||
        firebaseErr.code === "auth/invalid-credential" ||
        firebaseErr.code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (firebaseErr.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(firebaseErr.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#f6f7f8] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Mobile Brand Header */}
        <div className="md:hidden bg-[#0F1C15] px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#0F1C15]" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-[#D4AF37]">
              THE COLONEL&apos;S <span className="text-white">ACADEMY</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {view === "signin" ? "Welcome Back, Cadet" : "Join the Ranks"}
            </div>
          </div>
        </div>

        {/* Left Panel — desktop only */}
        <div className="hidden md:flex md:w-5/12 bg-[#0F1C15] p-12 text-white flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#0F1C15]" />
              </div>
              <div className="font-bold text-lg leading-tight text-[#D4AF37]">
                THE COLONEL&apos;S
                <br />
                <span className="text-white">ACADEMY</span>
              </div>
            </div>
            <h2 className="text-3xl font-['Rajdhani'] font-bold uppercase mb-4">
              {view === "signin" ? "Welcome Back" : "Join the Ranks"}
            </h2>
            <p className="text-gray-400 text-sm">
              Secure access for Officer Cadets and Staff College candidates.
            </p>
          </div>
          <div className="text-xs text-gray-600">Nepal&apos;s #1 Ranked Instructor Team</div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-bold text-[#0F1C15] mb-6">
              {view === "signin" ? "HQ Access" : "New Account"}
            </h2>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all mb-6 disabled:opacity-60 shadow-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative mb-6 text-center">
              <span className="bg-[#f6f7f8] px-3 text-gray-400 text-xs font-bold uppercase relative z-10">
                Or via Email
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              {view === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F1C15]"
                  placeholder="Full Name"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F1C15]"
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F1C15]"
                placeholder="Password"
                required
              />

              {error && (
                <div className="text-red-500 text-xs text-center font-bold bg-red-50 border border-red-100 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0F1C15] text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Processing..." : view === "signin" ? "Login" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-500">
              {view === "signin" ? "New here?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setView(view === "signin" ? "signup" : "signin");
                  resetForm();
                }}
                className="ml-2 font-bold text-[#0F1C15] hover:underline"
              >
                {view === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
