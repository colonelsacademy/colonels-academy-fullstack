"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ArrowRight, CreditCard, History, Settings as SettingsIcon, ShieldAlert, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, authenticated } = useAuth();
  const router = useRouter();

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <SettingsIcon className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-6">You must be logged in to view your settings.</p>
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

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wider">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2 font-['Rajdhani'] uppercase tracking-widest text-xs">
            Manage your profile, subscriptions, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <User className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wider">
                Profile Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Full Name
                </label>
                <div className="font-['Rajdhani'] text-lg text-gray-900 font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {user?.displayName || "Cadet"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Email Address
                </label>
                <div className="font-['Rajdhani'] text-lg text-gray-900 font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {user?.email}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Account Role
                </label>
                <div className="font-['Rajdhani'] text-lg text-gray-900 font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100 capitalize">
                  {user?.role ?? "Student"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Active Status
                </label>
                <div className="font-['Rajdhani'] text-lg text-emerald-600 font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Operational
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Payment Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-[#D4AF37]/50 transition-all">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-lg font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wider">
                    Subscription
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-900 uppercase tracking-widest">
                  Student
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6 font-medium">
                  Elevate your status to access elite officer programs and staff college prep materials.
                </p>
                <Link
                  href="/courses"
                  className="w-full py-3 bg-white border border-gray-200 text-gray-900 hover:border-[#D4AF37] hover:text-[#D4AF37] font-['Rajdhani'] font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Browse Courses <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <History className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wider">
                  Payment Records
                </h2>
              </div>
              <div className="p-6 flex flex-col items-center justify-center h-[160px]">
                <History className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  No Transactions Found
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-wider">
                Administrative Actions
              </h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-widest text-sm">
                  Account Deletion
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  This operation is irreversible. All records, certifications, and course progress will be permanently expunged.
                </p>
              </div>
              <Link
                href="/delete-account"
                className="px-6 py-3 bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-['Rajdhani'] font-bold text-xs uppercase tracking-widest rounded-xl transition-all whitespace-nowrap"
              >
                Decommission Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
