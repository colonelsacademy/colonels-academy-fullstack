"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getFirebaseClientAuth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
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

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/my-learning";
  }
  return next;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const _useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseClientAuth();
      if (!auth) throw new Error("Firebase is not configured.");
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const token = await user.getIdToken();
      await login(token);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

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
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="font-['Rajdhani'] font-bold text-gray-900 text-xl uppercase tracking-wider">
            The Colonel&apos;s Academy
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Create your account</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-400 text-xs uppercase tracking-widest">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                placeholder="cadet@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-confirm"
              className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2D6A4F] text-white font-semibold text-sm rounded-xl hover:bg-[#1B4332] active:bg-[#081C15] transition-all disabled:opacity-50 shadow-sm mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-[#D4AF37] font-semibold hover:text-[#B8860B] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md animate-pulse">
            <div className="h-16 w-48 bg-gray-200 rounded-lg mx-auto mb-8" />
            <div className="h-[500px] bg-white rounded-2xl shadow border border-gray-100" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
