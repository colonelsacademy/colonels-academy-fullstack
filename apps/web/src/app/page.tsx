'use client';

import { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { type Category, DEFAULT_COURSES } from '@/data/gateway';
import { scheduleWhenIdle } from '@/utils/schedule';

import GatewayHero from './gateway/components/GatewayHero';
import IntakeBanner from './gateway/components/IntakeBanner';
import { CourseFilter, CourseGrid, CourseSection } from './gateway/components/Courses';

const Instructors = lazy(() =>
  import('./gateway/components/Instructors').then((m) => ({ default: m.Instructors }))
);
const GatewayCTA = lazy(() =>
  import('./gateway/components/GatewayFooter').then((m) => ({ default: m.GatewayCTA }))
);
const ExpertiseSection = lazy(() =>
  import('./gateway/components/ExpertiseSection').then((m) => ({ default: m.ExpertiseSection }))
);

const SectionFallback = ({ className = '' }: { className?: string }) => (
  <div aria-hidden="true" className={`w-full rounded-[2.5rem] border border-gray-200/70 bg-white/70 animate-pulse ${className}`} />
);

function GatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  const activeCategory = (searchParams.get('category') as Category) ?? 'all';

  const setActiveCategory = (category: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const cancel = scheduleWhenIdle(() => {
      startTransition(() => setShowDeferredSections(true));
    }, { timeout: 1400, fallbackDelayMs: 180 });
    return cancel;
  }, []);

  const filteredCourses = activeCategory === 'all'
    ? DEFAULT_COURSES
    : DEFAULT_COURSES.filter(
        (c) => c.category === activeCategory || (activeCategory === 'army' && c.category === 'cadet')
      );

  const mainCourses = filteredCourses.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">

      {/* Hero */}
      <GatewayHero />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 space-y-2">

        <IntakeBanner />

        {/* Course catalog */}
        <CourseSection
          title="Elite Training Curriculum"
          subtitle="Command-level preparation. Select your target force to begin."
          className="pt-12"
        >
          <div className="mb-6">
            <CourseFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>
          <CourseGrid
            courses={mainCourses}
            onCourseClick={(course) => router.push(`/course/${course.id}`)}
            enrolledCourseIds={new Set()}
          />
        </CourseSection>

        {/* Deferred sections */}
        {showDeferredSections && (
          <>
            <Suspense fallback={<SectionFallback className="min-h-[640px]" />}>
              <ExpertiseSection />
            </Suspense>

            <Suspense fallback={<SectionFallback className="min-h-[720px]" />}>
              <Instructors />
            </Suspense>
          </>
        )}
      </div>

      {showDeferredSections && (
        <Suspense fallback={<SectionFallback className="min-h-[280px] mx-4 mb-10" />}>
          <GatewayCTA />
        </Suspense>
      )}
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F3F4F6]" />}>
      <GatewayPage />
    </Suspense>
  );
}
