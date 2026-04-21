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
  User
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentProvider = "esewa" | "khalti";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authenticated } = useAuth();
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const provider = searchParams.get("provider");
    if (provider === "esewa" || provider === "khalti") {
      setPaymentMethod(provider);
    }

    const incomingEmail = searchParams.get("email");
    if (incomingEmail) {
      setGuestEmail(incomingEmail);
    }
  }, [searchParams]);

  const handleGuestCheckout = () => {
    const normalizedEmail = guestEmail.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      setPaymentError("Please enter a valid email address to continue as guest.");
      return;
    }

    const next = encodeURIComponent(`/checkout?provider=${paymentMethod}&email=${normalizedEmail}`);
    const email = encodeURIComponent(normalizedEmail);

    // Guest path still requires account auth in current backend. We prefill email to keep flow fast.
    router.push(`/signup?next=${next}&email=${email}`);
  };

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
      router.push(
        `/payment-success?orderId=${order.orderId}${confirmed.courseSlug ? `&courseSlug=${confirmed.courseSlug}` : ""}`
      );
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const normalizedGuestEmail = guestEmail.trim().toLowerCase();
  const guestEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedGuestEmail);
  const guestLoginHref = guestEmailValid
    ? `/login?next=${encodeURIComponent(`/checkout?provider=${paymentMethod}&email=${normalizedGuestEmail}`)}&email=${encodeURIComponent(normalizedGuestEmail)}`
    : `/login?next=${encodeURIComponent(`/checkout?provider=${paymentMethod}`)}`;

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
                  Register now and get <strong>10% off</strong> your first purchase. Already have an
                  account? Sign in to apply your member price.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/signup?next=/checkout"
                    className="w-full py-4 bg-[#D4AF37] text-[#0F1C15] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F4CA30] transition-all shadow-lg"
                  >
                    Create Account & Save 10%
                  </Link>
                  <Link
                    href="/login?next=/checkout"
                    className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>

                <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-400 font-bold">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span>Or checkout as guest</span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="guest-email"
                      className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2"
                    >
                      Guest Email
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        if (paymentError) setPaymentError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                    />
                    <p className="mt-2 text-[11px] text-gray-500">
                      We&apos;ll use this email for your receipt and course access after payment.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    onClick={handleGuestCheckout}
                    className="w-full py-4 bg-[#0F1C15] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                  >
                    Continue as Guest
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    href={guestLoginHref}
                    className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Have an account already? Sign In
                    {guestEmailValid ? " with this email" : ""}
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
                      Pay NPR {mounted ? total.toLocaleString() : 0}
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
                {mounted ? items.length : 0} ITEM{mounted && items.length !== 1 ? "S" : ""}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Cart Items
              </div>

              {!mounted || items.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  {mounted ? "Your cart is empty" : "Loading..."}
                </p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
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
                <div className="text-gray-200">NPR {mounted ? total.toLocaleString() : 0}</div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-700">
                <span className="font-bold text-sm text-gray-300">Total Due</span>
                <span className="font-bold text-3xl text-white">
                  NPR {mounted ? total.toLocaleString() : 0}
                </span>
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
