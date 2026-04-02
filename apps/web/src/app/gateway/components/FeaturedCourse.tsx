'use client';

import { motion } from 'framer-motion';
import { Star, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { type Course } from '@/data/gateway';
import ImageWithSkeleton from '@/components/ui/ImageWithSkeleton';

interface FeaturedCourseProps {
    course: Course;
    onClick: (course: Course) => void;
    isEnrolled?: boolean;
}

export const FeaturedCourse = ({ course, onClick, isEnrolled = false }: FeaturedCourseProps) => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-12">
                    <h2 className="text-fluid-3xl font-bold text-gray-900 font-['Rajdhani'] uppercase tracking-tight">Our Top Pick for You</h2>
                    <p className="text-gray-500 mt-2 font-medium">Specially selected based on current service recruitment trends.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => !course.comingSoon && onClick(course)}
                    className={`group relative bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm transition-all duration-500 flex flex-col lg:flex-row ${course.comingSoon ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'}`}
                >
                    {/* Image Column */}
                    <div className="lg:w-1/2 relative aspect-video lg:aspect-auto overflow-hidden">
                        <ImageWithSkeleton
                            src={course.thumbnail || ''}
                            alt={course.title}
                            quality={82}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            widths={[640, 828, 1024, 1280]}
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-1000 ${course.comingSoon ? '' : 'group-hover:scale-105'}`}
                            skeletonClassName="rounded-none"
                        />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <span className="bg-[#1c1d1f] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded shadow-xl border border-white/10 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Expert Selection</span>
                            </span>
                            {course.comingSoon && (
                                <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded shadow-xl flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Coming Soon</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="lg:w-1/2 p-fluid-xl flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{course.rating}</span>
                            <span className="text-sm text-gray-400">({course.ratingCount.toLocaleString()} reviews)</span>
                        </div>

                        <h3 className="text-fluid-4xl font-bold text-gray-900 font-['Rajdhani'] leading-[1.1] mb-6 uppercase tracking-tight">
                            {course.title}
                        </h3>

                        <p className="text-gray-500 text-fluid-lg leading-relaxed mb-8 font-medium line-clamp-3">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap gap-6 items-center mb-10">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Duration</div>
                                <div className="text-lg font-bold text-gray-900">{course.duration}</div>
                            </div>
                            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lectures</div>
                                <div className="text-lg font-bold text-gray-900">{course.lessons} Modules</div>
                            </div>
                            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Level</div>
                                <div className="text-lg font-bold text-gray-900">{course.level}</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {course.comingSoon ? (
                                <button
                                    disabled
                                    className="w-full sm:w-auto px-10 py-5 bg-gray-300 text-gray-500 text-base font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <Clock className="w-5 h-5" />
                                    <span>Coming Soon</span>
                                </button>
                            ) : isEnrolled ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClick(course); }}
                                    className="w-full sm:w-auto px-10 py-5 bg-[#00693E] hover:bg-[#005a34] text-white text-base font-bold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <span>Go to Course</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClick(course); }}
                                    className="w-full sm:w-auto px-10 py-5 bg-[#1c1d1f] hover:bg-black text-white text-base font-bold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <span>View Details</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                            <div className="flex items-baseline gap-2">
                                {course.comingSoon ? (
                                    <span className="px-4 py-2 bg-amber-100 text-amber-800 text-xl font-bold rounded-full border border-amber-200">
                                        Coming Soon
                                    </span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold text-gray-900">NPR {course.price.toLocaleString()}</span>
                                        <span className="text-lg text-gray-400 line-through">NPR {course.originalPrice.toLocaleString()}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
