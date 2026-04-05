"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Lock,
  Package,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentProvider = "esewa" | "khalti";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, authenticated } = useAuth();
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePayment = async () => {
    if (!authenticated || !user) return;
    if (items.length === 0) return;

    setIsProcessing(true);
    setPaymentError("");

    try {
      // 1. Create order in DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ courseSlug: i.id })),
          provider: paymentMethod
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to create order");
      }

      const order = await orderRes.json();

      // 2. Mock payment confirmation (replace with real eSewa/Khalti redirect later)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Confirm order → creates enrollment in DB
      const confirmRes = await fetch(`/api/orders/${order.orderId}/confirm`, {
        method: "POST"
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.message || "Failed to confirm order");
      }

      const confirmed = await confirmRes.json();
      clearCart();
      router.push(`/payment-success?orderId=${order.orderId}${confirmed.courseSlug ? `&courseSlug=${confirmed.courseSlug}` : ""}`);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">

            {/* NOT LOGGED IN */}
            {!authenticated && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0F1C15] rounded-full flex items-center justify-center text-[#D4AF37]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F1C15]">Sign In to Continue</h2>
                </div>

                <p className="text-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#0F1C15] p-4 rounded-xl mb-8">
                  Register now and get <strong>10% off</strong> your first purchase. Already have an account? Sign in to apply your member price.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="w-full py-4 bg-[#D4AF37] text-[#0F1C15] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F4CA30] transition-all shadow-lg"
                  >
                    Create Account & Save 10%
                  </Link>
                  <Link
                    href="/login"
                    className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* LOGGED IN - PAYMENT OPTIONS */}
            {authenticated && user && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#0F1C15] flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#D4AF37]" /> Select Payment
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Logged In
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">Billed To</div>
                      <div className="text-sm font-bold text-gray-900">{user.email ?? "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Gateways */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("esewa")}
                    className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${
                      paymentMethod === "esewa"
                        ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500 ring-offset-2"
                        : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 bg-[#41A124] rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      eSewa
                    </div>
                    <span className="text-xs font-bold">eSewa Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${
                      paymentMethod === "khalti"
                        ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500 ring-offset-2"
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 bg-[#5C2D91] rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      Khalti
                    </div>
                    <span className="text-xs font-bold">Khalti Pay</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing || items.length === 0}
                  className="w-full py-5 bg-[#D4AF37] text-[#0F1C15] rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#F4CA30] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      Pay NPR {total.toLocaleString()}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {paymentError && (
                  <div className="mt-4 text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {paymentError}
                  </div>
                )}
                <div className="text-center mt-4 text-xs text-gray-400">
                  You will be redirected to the selected payment gateway.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-xs justify-center">
            <Lock className="w-3 h-3" />
            <span>Payments encrypted via 256-bit SSL</span>
          </div>
        </div>

        {/* RIGHT COLUMN - ORDER SUMMARY */}
        <div className="md:col-span-1">
          <div className="bg-[#0F1C15] text-white p-6 rounded-2xl sticky top-24 shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
              <h3 className="font-bold text-lg text-[#D4AF37]">Order Summary</h3>
              <span className="text-xs font-mono text-gray-500">
                {items.length} ITEM{items.length !== 1 ? "S" : ""}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Cart Items
              </div>

              {items.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                        <div className="text-[10px] text-gray-400">×{item.quantity}</div>
                      </div>
                      <div className="text-xs font-bold text-[#D4AF37]">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-800">
                <div className="text-gray-400">Subtotal</div>
                <div className="text-gray-200">NPR {total.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-700">
                <span className="font-bold text-sm text-gray-300">Total Due</span>
                <span className="font-bold text-3xl text-white">NPR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#1a2c24] rounded-lg p-3 text-xs text-gray-400 flex gap-2">
              <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
              Includes Lifetime Access, Mock Tests, and Certificate.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
