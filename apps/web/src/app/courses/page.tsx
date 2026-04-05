import { CourseFilter, CourseGrid, CourseGridSkeleton } from "@/app/gateway/components/Courses";
import type { Category, Course } from "@/data/gateway";
import { getCourses } from "@/lib/api";
import { Suspense } from "react";

type CoursesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolved = await searchParams;
  const activeCategory = (resolved.category as Category) ?? "all";

  const apiCourses = await getCourses();

  const allCourses: Course[] = apiCourses.map((c) => ({
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
  }));

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
          <Suspense fallback={<div className="h-12 bg-white rounded-2xl animate-pulse" />}>
            <CourseFilter activeCategory={activeCategory} />
          </Suspense>
        </div>

        {/* Grid */}
        <Suspense fallback={<CourseGridSkeleton />}>
          <CourseGrid courses={filtered} />
        </Suspense>
      </div>
    </div>
  );
}
