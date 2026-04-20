"use client";

import { useCart } from "@/contexts/CartContext";
import { CATEGORIES, type Category, type Course, ICON_MAP } from "@/data/gateway";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { BadgeCheck, BookOpen, Clock, Layers, Lock, Play, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// Wing badge colors matching old app exactly
// ─────────────────────────────────────────────
const WING_BADGE: Record<string, { badge: string; accent: string }> = {
  army: { badge: "bg-green-600", accent: "#16a34a" },
  police: { badge: "bg-blue-700", accent: "#1d4ed8" },
  apf: { badge: "bg-amber-600", accent: "#d97706" },
  staffcollege: { badge: "bg-violet-600", accent: "#7c3aed" }
};

const WING_LABEL: Record<string, string> = {
  army: "Nepal Army",
  police: "Nepal Police",
  apf: "Nepal APF",
  staffcollege: "Staff College"
};

const LEVEL_STYLE: Record<string, string> = {
  Beginner: "bg-teal-50 text-teal-700",
  Intermediate: "bg-orange-50 text-orange-700",
  Advanced: "bg-red-50 text-red-700"
};

// ─────────────────────────────────────────────
// Star Rating
// ─────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  const r = rating || 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[13px] font-bold text-[#b4690e]">{r.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= Math.floor(r) ? "fill-[#e59819] text-[#e59819]" : "text-gray-200 fill-gray-200"}`}
          />
        ))}
      </div>
      <span className="text-[11px] text-[#6a6f73]">({count?.toLocaleString() || 0})</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tilt Card
// ─────────────────────────────────────────────
const TiltCard = ({
  children,
  onClick,
  className
}: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
      className={`relative transform-gpu h-full ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Course Card — exact match to old app design
// ─────────────────────────────────────────────
function CourseCard({
  course,
  index = 0,
  isEnrolled = false
}: {
  course: Course;
  index?: number;
  isEnrolled?: boolean;
}) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inCart = mounted && items.some((i) => i.id === course.id);
  const wing = WING_BADGE[course.category] ?? { badge: "bg-gray-600", accent: "#4b5563" };
  const wingLabel = WING_LABEL[course.category] ?? course.category;
  const hasDiscount = course.originalPrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;
  const levelStyle = LEVEL_STYLE[course.level ?? ""] ?? "bg-gray-100 text-gray-600";

  // Redirect Army Command & Staff course to staff-college page
  const courseUrl =
    course.id === "army-command-staff-2083" ? "/staff-college" : `/courses/${course.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      <TiltCard onClick={() => router.push(courseUrl)}>
        <div className="group h-full cursor-pointer flex flex-col bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-gray-300 transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-gray-900 flex-shrink-0">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={75}
                loading={index < 4 ? "eager" : "lazy"}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${wing.accent}cc, ${wing.accent}66)`
                }}
              >
                <BookOpen className="w-10 h-10 text-white/70" />
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest px-4 text-center leading-tight">
                  {course.title}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Wing badge */}
            <div
              className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white shadow-md ${wing.badge}`}
            >
              {wingLabel}
            </div>

            {/* Discount / Lock */}
            {hasDiscount ? (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-black text-white bg-red-500 shadow-md">
                -{discountPct}%
              </span>
            ) : (
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            {/* Play hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 text-gray-900 fill-gray-900 ml-0.5" />
              </div>
            </div>

            {/* Bestseller / Premium badges */}
            {(course.isBestseller ?? course.isPremium) && (
              <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                {course.isBestseller && (
                  <span className="px-2 py-0.5 bg-[#eceb98] text-[#3d3c0a] text-[9px] font-black uppercase tracking-wide rounded-sm">
                    Bestseller
                  </span>
                )}
                {course.isPremium && (
                  <span className="px-2 py-0.5 bg-[#f3ca8c] text-[#593d00] text-[9px] font-black uppercase tracking-wide rounded-sm">
                    Premium
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-grow p-4 gap-2">
            <h3 className="text-[15px] font-bold text-[#1c1d1f] leading-snug line-clamp-2 min-h-[38px] group-hover:text-[#0F1C15]">
              {course.title}
            </h3>

            {/* Instructor */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#1c1d1f] flex items-center justify-center text-white text-[8px] font-black shrink-0">
                {course.instructor.charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] text-[#6a6f73] truncate">{course.instructor}</span>
              <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />
            </div>

            <StarRating rating={course.rating} count={course.ratingCount} />

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[#6a6f73]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {course.lessons} lessons
              </span>
              {course.level && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${levelStyle}`}>
                    {course.level}
                  </span>
                </>
              )}
            </div>

            <div className="flex-grow" />

            {/* Price + CTA */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {course.comingSoon ? (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[12px] font-bold rounded-full border border-amber-200">
                      Coming Soon
                    </span>
                  ) : isEnrolled ? (
                    <span className="text-[12px] font-bold text-emerald-600">Enrolled</span>
                  ) : (
                    <>
                      <span className="text-[17px] font-bold text-[#1c1d1f]">
                        NPR {course.price.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-[13px] text-[#6a6f73] line-through">
                          {course.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {!course.comingSoon && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEnrolled) {
                        router.push(`/courses/${course.id}/learn`);
                      } else if (course.id === "army-command-staff-2083") {
                        // For Army Command & Staff, go to chapter view
                        router.push("/staff-college");
                      } else if (!inCart) {
                        addItem({
                          id: course.id,
                          title: course.title,
                          price: course.price,
                          ...(course.thumbnail !== undefined && { image: course.thumbnail }),
                          category: course.category,
                          type: "course"
                        });
                      } else {
                        router.push("/checkout");
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all duration-200 shrink-0 active:scale-[0.97] shadow-sm ${
                      isEnrolled
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : course.id === "army-command-staff-2083"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : inCart
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#1c1d1f] hover:bg-black text-white"
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Continue
                      </>
                    ) : course.id === "army-command-staff-2083" ? (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        View Details
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {inCart ? "In Cart" : "Buy"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Accent bottom line on hover */}
          <div
            className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out flex-shrink-0"
            style={{ background: `linear-gradient(90deg, ${wing.accent}, #D4AF37)` }}
          />
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
        <div className="flex gap-1 items-center">
          <div className="h-3 w-8 bg-gray-100 rounded" />
          {["s1", "s2", "s3", "s4", "s5"].map((s) => (
            <div key={s} className="w-3 h-3 bg-gray-100 rounded" />
          ))}
          <div className="h-3 w-10 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="h-5 w-20 bg-gray-100 rounded" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CourseSection wrapper
// ─────────────────────────────────────────────
export const CourseSection = ({
  title,
  subtitle,
  children,
  className = ""
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`py-10 ${className}`}>
    <div className="mb-8 text-center max-w-3xl mx-auto">
      <h2 className="text-fluid-2xl font-bold text-gray-900 font-rajdhani uppercase tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-gray-500 mt-2 font-medium">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// CourseFilter
// ─────────────────────────────────────────────
interface CourseFilterProps {
  activeCategory: Category;
  /** Page hub for category query updates (defaults to home `/`). */
  basePath?: string;
}

export const CourseFilter = ({ activeCategory, basePath = "/" }: CourseFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (cat: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") params.delete("category");
    else params.set("category", cat);
    const queryString = params.toString();
    const href =
      basePath === "/"
        ? queryString
          ? `/?${queryString}`
          : "/"
        : queryString
          ? `${basePath}?${queryString}`
          : basePath;
    router.push(href, { scroll: false });
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4 gap-1">
      <div className="inline-flex flex-wrap justify-center bg-white p-2 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconId];
          const isActive = activeCategory === cat.id;
          let activeClass = "bg-gray-900 text-white";
          if (isActive) {
            if (cat.id === "army") activeClass = "bg-[#00693E] text-white shadow-[#00693E]/20";
            else if (cat.id === "police")
              activeClass = "bg-[#1E3A8A] text-white shadow-[#1E3A8A]/20";
            else if (cat.id === "apf") activeClass = "bg-[#D97706] text-white shadow-[#D97706]/20";
          }
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => handleFilter(cat.id as Category)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? `${activeClass} shadow-lg scale-105`
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CourseGrid
// ─────────────────────────────────────────────
interface CourseGridProps {
  courses: Course[];
  enrolledCourseIds?: Set<string>;
  eagerCount?: number;
  highPriorityCount?: number;
}

export const CourseGrid = ({ courses, enrolledCourseIds }: CourseGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fluid-md px-2 sm:px-4 perspective-1000">
      <AnimatePresence initial={false} mode="popLayout">
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-2 sm:mx-4"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
            <p className="text-gray-500 text-sm mt-1">
              No courses available for this category yet.
            </p>
          </motion.div>
        ) : (
          courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              isEnrolled={enrolledCourseIds?.has(course.id) ?? false}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export const CourseGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fluid-md px-2 sm:px-4">
    {["a", "b", "c", "d"].map((id) => (
      <SkeletonCard key={id} />
    ))}
  </div>
);
