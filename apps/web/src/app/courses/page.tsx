"use client";

import { CourseFilter, CourseGrid, CourseGridSkeleton } from "@/app/gateway/components/Courses";
import type { Category, Course } from "@/data/gateway";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get("category") as Category) ?? "all";

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          fetch("/api/catalog/courses", { cache: "no-store" }),
          fetch("/api/learning/enrollments", { credentials: "include", cache: "no-store" })
        ]);

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          const items = data.items ?? [];
          setAllCourses(
            items.map(
              (c: {
                slug: string;
                title: string;
                track: string;
                summary: string;
                durationLabel: string;
                lessonCount: number;
                heroImageUrl?: string;
                priceNpr: number;
                originalPriceNpr?: number;
                accentColor?: string;
                level?: string;
                featured?: boolean;
                isComingSoon?: boolean;
              }) => ({
                id: c.slug,
                title: c.title,
                category: c.track,
                description: c.summary,
                instructor: "Expert Faculty",
                rating: 4.8,
                ratingCount: 1200,
                students: 1500,
                duration: c.durationLabel,
                lessons: c.lessonCount,
                iconId: "Target" as const,
                thumbnail: c.heroImageUrl ?? "",
                price: c.priceNpr,
                originalPrice: c.originalPriceNpr ?? c.priceNpr,
                color: c.accentColor ?? "#D4AF37",
                lightColor: "#FEFCE8",
                tag: c.track.toUpperCase(),
                level: c.level,
                isBestseller: c.featured,
                comingSoon: c.isComingSoon ?? false
              })
            )
          );
        }

        const enrollmentData = await enrollmentsRes.json();
        if (enrollmentsRes.ok) {
          const ids = new Set<string>(
            (enrollmentData.items ?? []).map((e: { courseSlug: string }) => e.courseSlug)
          );
          setEnrolledCourseIds(ids);
        }
      } catch (err) {
        console.error("Failed to load courses page data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered =
    activeCategory === "all" ? allCourses : allCourses.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[#D4AF37] font-black text-[11px] uppercase tracking-[0.25em] mb-2">
            Course Catalog
          </p>
          <h1 className="text-4xl font-bold text-[#0F1C15] font-['Rajdhani'] uppercase tracking-tight mb-2">
            Training Modules
          </h1>
          <p className="text-gray-500 font-medium">
            {allCourses.length} courses across Army, Police, APF, Staff College and Mission Prep.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-6">
          <CourseFilter activeCategory={activeCategory} />
        </div>

        {/* Grid */}
        {loading ? (
          <CourseGridSkeleton />
        ) : (
          <CourseGrid courses={filtered} enrolledCourseIds={enrolledCourseIds} />
        )}
      </div>
    </div>
  );
}
