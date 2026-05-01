'use client';

import React from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, ICON_MAP, type Category, type Course } from '@/data/gateway';
import ImageWithSkeleton from '@/components/ui/ImageWithSkeleton';

export const CourseSection = ({ title, subtitle, children, className = '' }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`py-10 ${className}`}>
    <div className="mb-8 text-center max-w-3xl mx-auto">
      <h2 className="text-fluid-2xl font-bold text-gray-900 font-rajdhani uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-2 font-medium">{subtitle}</p>}
    </div>
    {children}
  </div>
);

interface CourseFilterProps {
  activeCategory: Category;
}

export const CourseFilter = ({ activeCategory }: CourseFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (cat: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') params.delete('category');
    else params.set('category', cat);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4 gap-1">
      <div className="inline-flex flex-wrap justify-center bg-white p-2 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconId];
          const isActive = activeCategory === cat.id;
          let activeClass = 'bg-gray-900 text-white';
          if (isActive) {
            if (cat.id === 'army') activeClass = 'bg-[#00693E] text-white shadow-[#00693E]/20';
            else if (cat.id === 'police') activeClass = 'bg-[#1E3A8A] text-white shadow-[#1E3A8A]/20';
            else if (cat.id === 'apf') activeClass = 'bg-[#D97706] text-white shadow-[#D97706]/20';
          }
          return (
            <button
              key={cat.id}
              onClick={() => handleFilter(cat.id as Category)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive ? `${activeClass} shadow-lg scale-105` : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TiltCard = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['3deg', '-3deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-3deg', '3deg']);

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
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={`relative transform-gpu transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface CourseGridProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
  enrolledCourseIds?: Set<string>;
  eagerCount?: number;
  highPriorityCount?: number;
}

export const CourseGrid = ({ courses, onCourseClick, enrolledCourseIds, eagerCount = 0, highPriorityCount = 0 }: CourseGridProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fluid-md px-2 sm:px-4 perspective-1000">
      <AnimatePresence initial={false}>
        {courses.map((course, index) => {
          const isEnrolled = enrolledCourseIds?.has(course.id) ?? false;
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <TiltCard
                onClick={() => isEnrolled ? router.push(`/classroom/${course.id}`) : onCourseClick?.(course)}
                className="group h-full cursor-pointer flex flex-col bg-white border border-gray-200/80 rounded-xl p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-gray-300 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-gray-100 mb-2">
                  <ImageWithSkeleton
                    src={course.thumbnail ?? ''}
                    alt={course.title}
                    quality={78}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    widths={[390, 640, 828]}
                    loading={index < eagerCount ? 'eager' : 'lazy'}
                    fetchPriority={index < highPriorityCount ? 'high' : 'auto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    skeletonClassName="rounded-sm"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-[1]" />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-grow text-left p-1">
                  <h4 className="text-[16px] font-bold text-[#1c1d1f] leading-[1.2] mb-1.5 line-clamp-2 min-h-[40px] font-rajdhani">{course.title}</h4>
                  <p className="text-[12px] text-[#6a6f73] mb-1.5 truncate">{course.instructor}</p>

                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[14px] font-bold text-[#b4690e]">{(course.rating).toFixed(1)}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.floor(course.rating) ? 'fill-[#e59819] text-[#e59819]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-[#6a6f73]">({course.ratingCount.toLocaleString()})</span>
                  </div>

                  <div className="text-[12px] text-[#6a6f73] mb-2 flex flex-wrap items-center gap-x-1">
                    <span>{course.duration}</span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span>{course.lessons} lectures</span>
                    {course.level && (
                      <>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span>{course.level}</span>
                      </>
                    )}
                  </div>

                  <div className="flex-grow min-h-[8px]" />

                  {/* Price */}
                  <div className="flex flex-col mb-3">
                    {course.comingSoon ? (
                      <div className="flex items-center justify-center py-2">
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-[14px] font-bold rounded-full border border-amber-200">Coming Soon</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#1c1d1f]">NPR {course.price.toLocaleString()}</span>
                        <span className="text-[14px] text-[#6a6f73] line-through decoration-gray-400">NPR {course.originalPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges + CTA */}
                  <div className="mt-auto space-y-3">
                    {(course.isBestseller ?? course.isPremium) && !course.comingSoon && (
                      <div className="flex flex-wrap gap-2">
                        {course.isBestseller && (
                          <span className="px-2 py-0.5 bg-[#eceb98] text-[#3d3c0a] text-[10px] font-bold uppercase tracking-wide">Bestseller</span>
                        )}
                        {course.isPremium && (
                          <span className="px-2 py-0.5 bg-[#f3ca8c] text-[#593d00] text-[10px] font-bold uppercase tracking-wide">Premium</span>
                        )}
                      </div>
                    )}

                    {course.comingSoon ? (
                      <button className="w-full px-4 py-2.5 bg-gray-300 text-gray-600 text-[14px] font-bold rounded cursor-not-allowed" disabled>
                        Coming Soon
                      </button>
                    ) : isEnrolled ? (
                      <button
                        className="w-full px-4 py-2.5 bg-[#00693E] hover:bg-[#005a34] text-white text-[14px] font-bold rounded transition-all duration-200 active:scale-[0.98] shadow-sm"
                        onClick={(e) => { e.stopPropagation(); router.push(`/classroom/${course.id}`); }}
                      >
                        Go to Course
                      </button>
                    ) : (
                      <button
                        className="w-full px-4 py-2.5 bg-[#1c1d1f] hover:bg-black text-white text-[14px] font-bold rounded transition-all duration-200 active:scale-[0.98] shadow-sm"
                        onClick={(e) => { e.stopPropagation(); onCourseClick?.(course); }}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
