"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import type { Course } from "@/data/gateway";
import { ArrowRight, Clock, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FeaturedCourseProps {
  course: Course;
  isEnrolled?: boolean;
}

export const FeaturedCourse = ({ course, isEnrolled = false }: FeaturedCourseProps) => {
  const router = useRouter();
  const { authenticated } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [iqBundleId, setIqBundleId] = useState<string | null>(null);

  // For the IQ test card, check purchase status just like ElitePracticalTests does
  useEffect(() => {
    if (course.id !== "cadet-iq-test" || !authenticated) return;

    const checkPurchase = async () => {
      try {
        // Check for justPurchased param (immediate post-purchase redirect)
        const params = new URLSearchParams(window.location.search);
        const justPurchased = params.get("justPurchased");

        // Fetch bundles to get the IQ bundle ID
        const bundlesRes = await fetch("/api/mock-test-bundles");
        if (!bundlesRes.ok) return;
        const bundles = await bundlesRes.json();
        const iqBundle = bundles.find((b: { position: string; id: string }) => b.position === "IQ");
        if (!iqBundle) return;

        setIqBundleId(iqBundle.id);

        // If just purchased this bundle, show continue immediately
        if (justPurchased === iqBundle.id) {
          setHasPurchased(true);
          return;
        }

        // Otherwise check from API
        const purchasesRes = await fetch("/api/mock-test-bundles/purchases");
        if (!purchasesRes.ok) return;
        const purchases = await purchasesRes.json();
        const purchased = purchases.some(
          (p: { bundleId: string; paymentStatus: string }) =>
            p.bundleId === iqBundle.id && p.paymentStatus === "COMPLETED"
        );
        setHasPurchased(purchased);
      } catch {
        // silently fail — default to not purchased
      }
    };

    checkPurchase();
  }, [course.id, authenticated]);

  const handleContinue = () => {
    router.push("/mock-exams?iq=true");
  };

  const handleBuy = () => {
    if (!authenticated) {
      router.push(
        `/login?next=${encodeURIComponent(iqBundleId ? `/mock-test-purchase/${iqBundleId}` : "/cadet-iq")}`
      );
      return;
    }
    router.push(iqBundleId ? `/mock-test-purchase/${iqBundleId}` : "/cadet-iq");
  };

  const isIqTest = course.id === "cadet-iq-test";

  return (
    <section className="py-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h2 className="text-fluid-3xl font-bold text-gray-900 font-rajdhani uppercase tracking-tight">
            Our Top Pick for You
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Specially selected based on current service recruitment trends.
          </p>
        </div>

        <div className="group relative bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm transition-all duration-500 flex flex-col lg:flex-row fade-in-up">
          {/* Image Column — fills edge-to-edge, card overflow-hidden clips the corners */}
          <div className="lg:w-1/2 relative bg-[#0d1b2a] flex-shrink-0">
            {course.thumbnail && (
              <div className="relative w-full h-full">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center block"
                  style={{ minHeight: "260px", maxHeight: "420px" }}
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-[#1c1d1f] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded shadow-xl border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Expert Selection</span>
                  </span>
                  {course.comingSoon && (
                    <span className="bg-amber-400 text-amber-900 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded shadow-xl flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Coming Soon</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="lg:w-1/2 p-fluid-xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">{course.rating}</span>
              <span className="text-sm text-gray-400">
                ({course.ratingCount.toLocaleString()} reviews)
              </span>
            </div>

            <h3 className="text-fluid-4xl font-bold text-gray-900 font-['Rajdhani'] leading-[1.1] mb-6 uppercase tracking-tight">
              {course.title}
            </h3>

            <p className="text-gray-500 text-fluid-lg leading-relaxed mb-8 font-medium line-clamp-3">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-6 items-center mb-10">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Duration
                </div>
                <div className="text-lg font-bold text-gray-900">{course.duration}</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  {isIqTest ? "Questions" : "Lectures"}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {course.lessons} {isIqTest ? "Questions" : "Modules"}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Level
                </div>
                <div className="text-lg font-bold text-gray-900">{course.level}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Price — shown only when not purchased */}
              {!(isIqTest && hasPurchased) && (
                <div className="flex items-baseline gap-2">
                  {course.comingSoon ? (
                    <span className="px-4 py-2 bg-amber-100 text-amber-800 text-xl font-bold rounded-full border border-amber-200">
                      Coming Soon
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        {course.price === 0 ? "FREE" : `NPR ${course.price.toLocaleString()}`}
                      </span>
                      {course.originalPrice > course.price && (
                        <span className="text-lg text-gray-400 line-through">
                          NPR {course.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {course.comingSoon ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-10 py-4 bg-gray-300 text-gray-500 text-base font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Clock className="w-5 h-5" />
                  <span>Coming Soon</span>
                </button>
              ) : isIqTest ? (
                hasPurchased ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full sm:w-auto px-10 py-4 bg-green-600 hover:bg-green-700 text-white text-base font-bold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/cadet-iq"
                      className="w-full sm:w-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-[#1c1d1f] text-base font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                    >
                      5 Free Questions
                    </Link>
                    <button
                      type="button"
                      onClick={handleBuy}
                      className="w-full sm:w-auto px-8 py-4 bg-[#1c1d1f] hover:bg-black text-white text-base font-bold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )
              ) : (
                <Link
                  href={
                    isEnrolled
                      ? `/classroom/${course.id}`
                      : course.id === "army-command-staff-2083"
                        ? "/staff-college"
                        : `/courses/${course.id}`
                  }
                  className={`w-full sm:w-auto px-10 py-4 ${isEnrolled ? "bg-[#00693E] hover:bg-[#005a34]" : "bg-[#1c1d1f] hover:bg-black"} text-white text-base font-bold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95`}
                >
                  <span>{isEnrolled ? "Go to Course" : "View Details"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
