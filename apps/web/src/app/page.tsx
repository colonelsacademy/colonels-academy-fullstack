import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

import type { Category, Course } from "@/data/gateway";
import { getCourses, getEnrollments, getInstructors } from "@/lib/api";

import { Footer } from "@/components/Footer";
import {
  CourseFilter,
  CourseGrid,
  CourseGridSkeleton,
  CourseSection
} from "./gateway/components/Courses";
import { FeaturedCourse } from "./gateway/components/FeaturedCourse";
import { GatewayCTA } from "./gateway/components/GatewayFooter";
import GatewayHero from "./gateway/components/GatewayHero";
import { Instructors } from "./gateway/components/Instructors";
import IntakeBanner from "./gateway/components/IntakeBanner";
import { MobilePlatform } from "./gateway/components/MobilePlatform";

import { ArrowRight } from "lucide-react";

const SectionFallback = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`w-full rounded-[2.5rem] border border-gray-200/70 bg-white/70 animate-pulse ${className}`}
  />
);

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Await searchParams for Next.js 15+ compatibility
  const resolvedParams = await searchParams;
  const activeCategory = (resolvedParams.category as Category) ?? "all";
  const mentorCategory = (resolvedParams.mentorCategory as Category) ?? "all";

  // 1. Fetch from the API (single source of truth across all pages)
  const [apiCourses, apiInstructors, enrollments] = await Promise.all([
    getCourses(),
    getInstructors(),
    getEnrollments()
  ]);

  const instructorNameBySlug = new Map(apiInstructors.map((i) => [i.slug, i.name]));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.slug));

  // 2. Map to UI shape and apply category filter
  const allMappedCourses: Course[] = apiCourses.map((course) => ({
    id: course.slug,
    title: course.title,
    category: course.track as Category,
    description: course.summary,
    instructor: course.instructorSlugs[0]
      ? (instructorNameBySlug.get(course.instructorSlugs[0]) ?? "Expert Faculty")
      : "Expert Faculty",
    rating: 4.8,
    ratingCount: 1200,
    students: 1500,
    duration: course.durationLabel,
    lessons: course.lessonCount,
    iconId: "Target",
    thumbnail: course.heroImageUrl ?? "",
    price: course.priceNpr,
    originalPrice: course.originalPriceNpr ?? course.priceNpr,
    color: course.accentColor ?? "#D4AF37",
    lightColor: "#FEFCE8",
    tag: course.track.toUpperCase(),
    level: course.level,
    isBestseller: course.featured,
    comingSoon: course.isComingSoon ?? false
  }));

  const mappedCourses =
    activeCategory !== "all"
      ? allMappedCourses.filter((c) => c.category === activeCategory)
      : allMappedCourses;

  // 3. Selection for UI components
  const mainCourses = mappedCourses.slice(0, 8);
  const topPick = mappedCourses.find((c) => c.isBestseller) ?? mappedCourses[0];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Hero: Renders instantly (Client Component Leaf) */}
      <GatewayHero />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 space-y-2">
        {/* Intake Banner: Renders instantly (Client Component Leaf) */}
        <IntakeBanner />

        {/* Course catalog */}
        <CourseSection
          title="Elite Training Curriculum"
          subtitle="Command-level preparation. Select your target force to begin."
          className="pt-12"
        >
          <div className="mb-6">
            <Suspense
              fallback={
                <div className="h-12 bg-white rounded-2xl animate-pulse w-full max-w-2xl mx-auto" />
              }
            >
              <CourseFilter activeCategory={activeCategory} />
            </Suspense>
          </div>

          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseGrid courses={mainCourses} enrolledCourseIds={enrolledCourseIds} />
          </Suspense>
        </CourseSection>

        {/* Top Pick (Featured Course): Now an RSC */}
        {topPick && (
          <Suspense fallback={<SectionFallback className="min-h-[640px]" />}>
            <FeaturedCourse course={topPick} isEnrolled={false} />
          </Suspense>
        )}

        <div className="flex justify-center pt-8 pb-12">
          {/* Using Link for SPA-like navigation */}
          <Link
            href="/courses"
            className="group flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all font-bold text-gray-900 uppercase tracking-widest text-xs"
          >
            <span>Explore All Training Modules</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Mobile Platform Section: Now an RSC */}
        <Suspense fallback={<SectionFallback className="min-h-[640px]" />}>
          <MobilePlatform />
        </Suspense>

        {/* Instructors Section: Now an RSC with URL-based tabs */}
        <Suspense fallback={<SectionFallback className="min-h-[720px]" />}>
          <Instructors activeTab={mentorCategory} />
        </Suspense>
      </div>

      {/* Footer sections: Now RSCs */}
      <Suspense fallback={<SectionFallback className="min-h-[280px] mx-4 mb-10" />}>
        <GatewayCTA />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-[#F3F4F6]" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
