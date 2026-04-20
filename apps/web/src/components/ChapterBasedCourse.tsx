"use client";

import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  PlayCircle,
  ShoppingBag,
  Star,
  Users,
  Unlock,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  contentType: string;
  durationMinutes: number | null;
  isRequired: boolean;
}

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  position: number;
  price: number;
  isFreeIntro: boolean;
  isLocked: boolean;
  lessonCount: number;
  totalDuration: number;
  lessons: Lesson[];
}

interface BundleOffer {
  id: string;
  type: string;
  title: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  discount: number;
  features: {
    includesMentorAccess: boolean;
    includesMockExams: boolean;
    includesCertificate: boolean;
    includesLiveClasses: boolean;
    mockExamCount: number | null;
    liveClassCount: number | null;
  };
  includedChapters: number[];
}

interface CourseData {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    heroImageUrl: string | null;
    durationLabel: string;
    totalPrice: number;
  };
  chapters: Chapter[];
  bundles: BundleOffer[];
}

interface PurchaseStatus {
  hasBundlePurchase: boolean;
  bundleType: string | null;
  purchasedChapters: number[];
  chapterProgress: Array<{
    chapterNumber: number;
    completionPercentage: number;
    isCompleted: boolean;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
}

// ─── Content type icon helper ─────────────────────────────────────────────────

function contentTypeLabel(type: string) {
  switch (type) {
    case "VIDEO": return "▶";
    case "QUIZ": return "✓";
    case "PDF": return "📄";
    case "LIVE": return "●";
    default: return "◆";
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChapterBasedCourse({ courseSlug }: { courseSlug: string }) {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, statusRes] = await Promise.all([
          fetch(`/api/catalog/courses/${courseSlug}/chapters`),
          fetch(`/api/learning/chapters/purchase-status?courseSlug=${courseSlug}`)
        ]);

        if (courseRes.ok) setCourseData(await courseRes.json());

        if (statusRes.ok) {
          setPurchaseStatus(await statusRes.json());
          setIsAuthenticated(true);
        } else if (statusRes.status === 401) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseSlug]);

  const redirectToLogin = () => {
    window.location.href = `/login?next=/courses/${courseSlug}`;
  };

  const handleChapterPurchase = async (moduleId: string) => {
    if (!isAuthenticated) { redirectToLogin(); return; }
    setPurchasing(moduleId);
    try {
      const res = await fetch("/api/orders/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, paymentMethod: "ESEWA" })
      });
      const data = await res.json();
      if (res.ok) window.location.href = data.paymentUrl;
      else alert(data.error || "Failed to initiate purchase");
    } catch {
      alert("Failed to initiate purchase. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleBundlePurchase = async (bundleOfferId: string) => {
    if (!isAuthenticated) { redirectToLogin(); return; }
    setPurchasing(bundleOfferId);
    try {
      const res = await fetch("/api/orders/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleOfferId, paymentMethod: "ESEWA" })
      });
      const data = await res.json();
      if (res.ok) window.location.href = data.paymentUrl;
      else alert(data.error || "Failed to initiate purchase");
    } catch {
      alert("Failed to initiate purchase. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Course not found</p>
      </div>
    );
  }

  const { course, chapters, bundles } = courseData;
  const freeChapter = chapters.find(ch => ch.isFreeIntro);
  const paidChapters = chapters.filter(ch => !ch.isFreeIntro);
  const standardBundle = bundles.find(b => b.type === "STANDARD");
  const premiumBundle = bundles.find(b => b.type === "PREMIUM");
  const totalIndividualPrice = paidChapters.reduce((s, ch) => s + ch.price, 0);
  const totalLessons = chapters.reduce((s, ch) => s + ch.lessonCount, 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">

      {/* ── Free Intro Banner ─────────────────────────────────────────────── */}
      {freeChapter && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-b-4 border-emerald-700">
          <div className="max-w-[1400px] mx-auto px-4 py-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Unlock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg font-['Rajdhani']">
                    Free Introduction Module — Always Accessible
                  </p>
                  <p className="text-emerald-100 text-sm">
                    Learn the vision, mission, and objectives before you buy anything.
                  </p>
                </div>
              </div>
              <Link
                href={`/classroom/${course.slug}`}
                className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-md shrink-0"
              >
                Start Free Introduction →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 py-14 space-y-16">

        {/* ── Bundle Comparison ─────────────────────────────────────────── */}
        <div id="pricing">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0B1120] mb-3 font-['Rajdhani']">
              Choose Your Study Path
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Select the package that fits your preparation goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            {/* Individual */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0B1120] mb-1 font-['Rajdhani']">Single Chapter</h3>
                <p className="text-sm text-gray-400">Pay as you learn</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#0B1120]">NPR 3,000 - 5,000</div>
                <div className="text-sm text-gray-400 mt-1">Per chapter</div>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {["Free Overview Modules (2)", "One Paid Chapter Access", "Video Lessons & Quizzes", "Study Materials"].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
                {["Mock Exams", "Certificate"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-gray-400">
                    <span className="text-red-400 shrink-0">✗</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById("chapters-list")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Browse Chapters ↓
              </button>
            </div>

            {/* Complete Bundle */}
            {standardBundle && (
              <div className="bg-gradient-to-br from-[#0B1120] to-[#1a3d2e] rounded-2xl border-4 border-[#D4AF37] p-8 text-white relative shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0B1120] px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap">
                  BEST VALUE
                </div>
                <div className="text-center mb-6 mt-2">
                  <h3 className="text-2xl font-bold mb-1 font-['Rajdhani']">Complete Bundle</h3>
                  <p className="text-sm text-gray-300">All 5 Chapters + Extras</p>
                </div>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-[#D4AF37]">NPR {standardBundle.bundlePrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 line-through mt-1">NPR {standardBundle.originalPrice.toLocaleString()}</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-[#D4AF37] text-[#0B1120] rounded-full text-sm font-bold">
                    Save NPR {standardBundle.discount.toLocaleString()}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  {["Free Overview Modules (2)", "All 5 Paid Chapters Unlocked", "Video Lessons & Quizzes", "Study Materials",
                    `${standardBundle.features.mockExamCount} Mock Exams`, "Certificate of Completion", "Study Schedule"].map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className={f.includes("All 5") || f.includes("Mock") || f.includes("Certificate") ? "font-bold" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBundlePurchase(standardBundle.id)}
                  disabled={purchasing === standardBundle.id}
                  className="w-full py-4 bg-[#D4AF37] text-[#0B1120] font-bold rounded-xl hover:bg-[#c49d2f] transition-colors text-lg shadow-xl disabled:opacity-60"
                >
                  {purchasing === standardBundle.id ? "Processing..." : "Get Bundle"}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── Chapters List ─────────────────────────────────────────────── */}
        <div id="chapters-list">
          <h2 className="text-3xl font-bold text-[#0B1120] mb-8 font-['Rajdhani']">
            Course Chapters
          </h2>

          <div className="space-y-4">
            {chapters.map((chapter) => {
              const isPurchased = chapter.isFreeIntro ||
                (purchaseStatus?.purchasedChapters.includes(chapter.chapterNumber) ?? false);
              const progress = purchaseStatus?.chapterProgress.find(
                p => p.chapterNumber === chapter.chapterNumber
              );
              const isExpanded = expandedChapter === chapter.id;

              return (
                <div
                  key={chapter.id}
                  className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                    isPurchased ? "border-emerald-400 shadow-md" : "border-gray-200"
                  }`}
                >
                  {/* Chapter Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left: number + info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                          isPurchased ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {chapter.isFreeIntro ? <Unlock className="w-5 h-5" /> : (chapter.chapterNumber ?? "?")}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-[#0B1120] font-['Rajdhani'] leading-tight">
                            {chapter.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {chapter.lessonCount} Lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.floor(chapter.totalDuration / 60)}h {chapter.totalDuration % 60}m
                            </span>
                            {chapter.isFreeIntro && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                FREE
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {progress && (
                            <div className="mt-3 max-w-xs">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span className="font-bold text-emerald-600">
                                  {progress.lessonsCompleted}/{progress.totalLessons} lessons
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all"
                                  style={{ width: `${progress.completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: CTA */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Expand lessons toggle */}
                        <button
                          onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="hidden sm:inline">Lessons</span>
                        </button>

                        {chapter.isFreeIntro ? (
                          <Link
                            href={`/classroom/${course.slug}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Start Free
                          </Link>
                        ) : isPurchased ? (
                          <Link
                            href={`/classroom/${course.slug}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Continue
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xl font-bold text-[#0B1120]">
                                NPR {chapter.price.toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleChapterPurchase(chapter.id)}
                              disabled={purchasing === chapter.id}
                              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0B1120] font-bold rounded-xl hover:bg-[#c49d2f] transition-colors text-sm disabled:opacity-60"
                            >
                              {purchasing === chapter.id ? (
                                <div className="w-4 h-4 border-2 border-[#0B1120] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ShoppingBag className="w-4 h-4" />
                              )}
                              {purchasing === chapter.id ? "..." : "Buy Chapter"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lessons */}
                  {isExpanded && chapter.lessons.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {chapter.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}</span>
                          <span className="text-sm">{contentTypeLabel(lesson.contentType)}</span>
                          <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span className="text-xs text-gray-400 shrink-0">{lesson.durationMinutes}m</span>
                          )}
                          {!isPurchased && !chapter.isFreeIntro && (
                            <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
