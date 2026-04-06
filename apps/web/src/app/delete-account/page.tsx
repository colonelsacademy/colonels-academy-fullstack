"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ArrowLeft, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAccountPage() {
  const { authenticated, logout } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-6">You must be logged in to delete your account.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full bg-[#0F1C15] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    setError("");
    try {
      // Call API to delete account
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await logout();
      router.push("/");
    } catch {
      setError("Unable to delete account right now. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-6 sm:p-8 bg-red-50/50 border-b border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h1>
            <p className="text-gray-600 text-sm">This action is permanent and cannot be undone.</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Warning
              </h3>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>All your profile data will be erased.</li>
                <li>You will lose access to all purchased courses.</li>
                <li>Your progress and certificates will be deleted.</li>
                <li>Active subscriptions will be cancelled without refund.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Please type{" "}
                <span className="text-red-600 font-mono font-bold select-all">DELETE</span> to
                confirm.
              </p>
              <input
                type="text"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-mono uppercase"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== "DELETE"}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  "Processing..."
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Permanently Delete My Account
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="w-full flex justify-center items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Just log out instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
