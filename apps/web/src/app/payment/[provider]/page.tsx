"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { CheckCircle, Clock, Lock, Shield, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { use } from "react";

type PaymentStatus = "pending" | "processing" | "success" | "failed";

function PaymentContent({ provider }: { provider: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, loading: authLoading } = useAuth();

  const purchaseId = searchParams.get("purchaseId");
  const type = searchParams.get("type") ?? "chapter"; // "chapter" | "bundle"

  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [paymentMethod, setPaymentMethod] = useState<"ESEWA" | "KHALTI">(
    provider === "khalti" ? "KHALTI" : "ESEWA"
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerName = provider === "khalti" ? "Khalti" : "eSewa";
  const providerColor = provider === "khalti" ? "#5C2D91" : "#41A124";
  const providerBg = provider === "khalti" ? "bg-purple-600" : "bg-green-600";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push(`/login?next=/payment/${provider}?purchaseId=${purchaseId}&type=${type}`);
    }
  }, [authenticated, authLoading, router, provider, purchaseId, type]);

  const handleConfirmPayment = async () => {
    if (!purchaseId) return;
    setProcessing(true);
    setStatus("processing");
    setError(null);

    try {
      // Simulate payment gateway processing (replace with real eSewa/Khalti SDK)
      await new Promise((r) => setTimeout(r, 2000));

      // Confirm payment with backend
      const res = await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId,
          type,
          transactionId: `TXN-${Date.now()}`, // Real: from payment gateway callback
          paymentStatus: "COMPLETED"
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setTimeout(() => {
          router.push(data.redirectUrl || "/my-learning");
        }, 2000);
      } else {
        throw new Error(data.error || "Payment confirmation failed");
      }
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!purchaseId) { router.back(); return; }
    // Mark as failed
    await fetch("/api/orders/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchaseId,
        type,
        transactionId: `CANCELLED-${Date.now()}`,
        paymentStatus: "FAILED"
      })
    }).catch(() => {});
    router.back();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#0B1120] mb-2 font-['Rajdhani'] uppercase">
            Payment Successful
          </h2>
          <p className="text-gray-500 mb-6">
            Your {type === "bundle" ? "bundle" : "chapter"} has been unlocked. Redirecting...
          </p>
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ── Failed state ───────────────────────────────────────────────────────────
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#0B1120] mb-2 font-['Rajdhani'] uppercase">
            Payment Failed
          </h2>
          <p className="text-red-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#0B1120] text-white font-bold rounded-xl hover:bg-black transition-colors font-['Rajdhani'] uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main payment UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      {/* Header */}
      <div className="bg-[#0B1120] border-b border-[#D4AF37]/20">
        <div className="max-w-[600px] mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#0B1120]" />
          </div>
          <h1 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-widest">
            Secure Payment
          </h1>
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Provider header */}
          <div
            className="px-8 py-6 text-white"
            style={{ backgroundColor: providerColor }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg font-['Rajdhani']">
                  {providerName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-white/70 text-sm uppercase tracking-widest font-bold">
                  Payment via
                </p>
                <h2 className="text-2xl font-bold font-['Rajdhani']">{providerName}</h2>
              </div>
              <div className="ml-auto">
                <Shield className="w-8 h-8 text-white/40" />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Purchase ID */}
            {purchaseId && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                  Purchase Reference
                </p>
                <p className="font-mono text-sm text-[#0B1120] font-bold truncate">{purchaseId}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Payment Instructions
              </p>
              <div className="space-y-2">
                {[
                  `Open your ${providerName} app or wallet`,
                  "Scan the QR code or enter the merchant ID",
                  "Confirm the payment amount",
                  `Click "I've Completed Payment" below`
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0B1120] text-[#D4AF37] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <p className="text-xs text-gray-400 font-bold">QR CODE</p>
              </div>
              <p className="text-xs text-gray-400">
                Scan with {providerName} app
              </p>
            </div>

            {/* Note */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                This payment session expires in <strong>15 minutes</strong>. Complete your payment before it expires.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="w-full py-4 font-bold font-['Rajdhani'] uppercase tracking-widest rounded-xl text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                style={{ backgroundColor: processing ? "#999" : providerColor }}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>I've Completed Payment</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-3 bg-gray-100 text-gray-600 font-bold font-['Rajdhani'] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent provider={provider} />
    </Suspense>
  );
}
