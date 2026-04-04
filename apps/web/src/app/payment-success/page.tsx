"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { motion } from "framer-motion";
import { CheckCircle, LayoutDashboard, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated } = useAuth();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-md w-full p-10 rounded-3xl shadow-2xl text-center border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
        <div className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#0F1C15] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
          Access Granted
        </div>

        <p className="text-gray-500 mb-8 leading-relaxed">
          {authenticated
            ? "Welcome to the Officer's Mess. Your transaction has been recorded and your curriculum access is now active."
            : "Payment received. Create an account with the same email to unlock your course access."}
        </p>

        {orderId && (
          <div className="text-[11px] text-gray-400 mb-6 font-mono">Order ID: {orderId}</div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="w-full py-4 bg-[#0F1C15] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
          >
            <LayoutDashboard className="w-5 h-5" /> Go to My Courses
          </button>

          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" /> Return to Course Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
