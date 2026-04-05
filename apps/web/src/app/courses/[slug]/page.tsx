import { instructors as fallbackInstructors } from "@colonels-academy/contracts";
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Clock,
  Globe,
  Lock,
  PlayCircle,
  Plus,
  ShoppingBag,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import CourseAddToCart from "@/components/CourseAddToCart";
import { getCourseBySlug, getInstructors } from "@/lib/api";
import type { CourseDetail, InstructorProfile } from "@colonels-academy/contracts";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

const TRACK_LABEL: Record<string, string> = {
  army: "Nepal Army",
  police: "Nepal Police",
  apf: "APF Nepal",
  staff: "Staff College",
  mission: "Mission Prep"
};

const LEARNING_ITEMS = [
  "Complete Syllabus Coverage of 2081/82",
  "IQ & Numerical Reasoning Mastery",
  "Written Exam Writing Techniques",
  "Interview Handling & Personality Dev",
  "Physical Training Guidelines",
  "Past Paper Solutions (10 Years)"
];

const RELATED_COURSES = [
  {
    id: "iq-mastery",
    title: "IQ & Numerical Reasoning Mastery",
    rating: 4.8,
    students: 12500,
    price: 4500,
    dura: "12h",
    img: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "interview-prep",
    title: "Officer Interview Success Guide",
    rating: 4.9,
    students: 8200,
    price: 3500,
    dura: "5h",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "physical-training",
    title: "Military Physical Training (Likhit Analysis)",
    rating: 4.7,
    students: 5400,
    price: 2000,
    dura: "8h",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80"
  }
];

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const [course, faculty] = await Promise.all([getCourseBySlug(slug), getInstructors()]);

  if (!course) notFound();

  const courseFaculty = (faculty.length ? faculty : fallbackInstructors).filter((i) =>
    course.instructorSlugs.includes(i.slug)
  );
  const mainInstructor: InstructorProfile | undefined = courseFaculty[0];
  const discountPct = course.originalPriceNpr
    ? Math.round(((course.originalPriceNpr - course.priceNpr) / course.originalPriceNpr) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans relative">
      {/* White top background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-white border-b border-gray-200 z-0" />

      <div className="max-w-[1400px] mx-auto px-4 py-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-12">
            {/* Hero */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                  {TRACK_LABEL[course.track] ?? course.track}
                </span>
                <span className="text-gray-400 text-sm">/</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {course.track.toUpperCase()}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[#0F1C15] font-['Rajdhani'] leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {course.description} Comprehensive preparation module designed by serving and
                retired officers to ensure your success in the {TRACK_LABEL[course.track]} selection
                process.
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                  <span className="font-bold text-yellow-700">4.8</span>
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-yellow-700/60 text-xs ml-1">(1,200 ratings)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>1,500 Enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>Nepali & English</span>
                </div>
              </div>

              {mainInstructor && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F1C15] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                      {mainInstructor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F1C15]">
                        Created by {mainInstructor.name}
                      </div>
                      <div className="text-xs text-gray-500">{mainInstructor.specialization}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hybrid Commander Banner */}
            <div className="bg-[#0F1C15] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-[#D4AF37]/20">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Award className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-['Rajdhani'] font-bold text-[#D4AF37] mb-2 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live & Interactive
                </h3>
                <h2 className="text-3xl font-bold mb-4 font-['Rajdhani']">
                  Hybrid Commander System
                </h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  We combine elite mentorship with cutting-edge technology. This isn&apos;t just a
                  video course; it&apos;s a complete academy experience.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">Phase 1: Live Classes</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        30+ Hours of live Zoom mentorship. Real-time Q&A & strategy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">Phase 2: Digital Platform</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        24/7 Access to LMS: Reading materials, AI Mock Tests, and Quizzes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani'] uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                What you&apos;ll learn
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {(course.outcomeBullets.length > 0 ? course.outcomeBullets : LEARNING_ITEMS).map(
                  (item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <span className="text-sm text-gray-600 font-medium">{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">
                Course Content
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4 bg-gray-50 text-xs text-gray-500 font-medium">
                  <span>
                    {course.lessonCount} Lectures • {course.durationLabel} Total Length
                  </span>
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Expand all sections
                  </span>
                </div>
                {(course.syllabus.length > 0
                  ? course.syllabus
                  : ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"]
                ).map((section) => (
                  <div key={section} className="group">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        <span className="font-bold text-[#0F1C15] text-sm">{section}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">3 Lectures • 45m</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-2xl font-bold text-[#0F1C15] mb-4 font-['Rajdhani']">
                Requirements
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm pl-2 marker:text-[#D4AF37]">
                <li>Must be a Nepali Citizen.</li>
                <li>Minimum height of 5&apos;3&quot; (Male) / 5&apos;0&quot; (Female).</li>
                <li>Completion of +2 or equivalent for Cadet/Inspector levels.</li>
                <li>Dedication and willingness to serve the nation.</li>
              </ul>
            </div>

            {/* Students Also Bought */}
            <div className="py-6 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">
                Students also bought
              </h3>
              <div className="space-y-4">
                {RELATED_COURSES.map((rc) => (
                  <div
                    key={rc.id}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="w-full sm:w-32 h-20 bg-[#0F1C15] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {rc.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rc.img}
                          alt={rc.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-[#D4AF37]" />
                      )}
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h4 className="font-bold text-[#0F1C15] text-sm leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                        {rc.title}
                      </h4>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
                        <span className="font-bold text-green-700">{rc.dura} total hours</span>
                        <span className="text-gray-400">Updated 2025</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#0F1C15] text-sm">{rc.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-400 text-xs">
                          ({(rc.students / 10).toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-[#0F1C15]">
                          NPR {rc.price.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#0F1C15] group/btn transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-400 group-hover/btn:text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold text-[#0F1C15] mb-4 font-['Rajdhani']">
                Description
              </h3>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-sm text-gray-600 leading-relaxed font-medium space-y-4">
                <p>
                  This is the most comprehensive online preparation course for the{" "}
                  <strong>{course.title}</strong> examination. Built in strict accordance with the
                  latest Public Service Commission (Lok Sewa Aayog) syllabus, this course covers
                  every single aspect of the selection process.
                </p>
                <p>
                  From the initial written examination to the final interview Board Conference, our
                  expert instructors (former Selection Board members) guide you through the nuances
                  of what the force is looking for in a future leader.
                </p>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 font-bold text-center">
                  &quot;More than just a course, it&apos;s a transformation into an Officer.&quot;
                </div>
              </div>
            </div>

            {/* Instructor */}
            {courseFaculty.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">
                  Your Instructor
                </h3>
                {courseFaculty.map((instructor) => (
                  <div
                    key={instructor.slug}
                    className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-full bg-[#0F1C15] overflow-hidden flex items-center justify-center text-[#D4AF37] font-bold text-2xl shrink-0">
                        {instructor.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={instructor.avatarUrl} alt={instructor.name} className="w-full h-full object-cover" />
                        ) : (
                          instructor.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">
                          {instructor.name}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">{instructor.specialization}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.9 Rating
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> 1,200+ Students
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {instructor.experience}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: STICKY PRICING CARD ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Preview Image */}
                <div className="h-48 relative group cursor-pointer overflow-hidden bg-[#0F1C15]">
                  {course.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.heroImageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#D4AF37]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-[#0F1C15] fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                    <span className="text-white font-bold text-sm drop-shadow-md">
                      Preview this course
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* One-time purchase notice */}
                  <div className="text-[11px] font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#D4AF37]" />
                    One-time purchase with lifetime access
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl font-bold text-[#0F1C15] font-['Rajdhani']">
                      NPR {course.priceNpr.toLocaleString()}
                    </span>
                    {course.originalPriceNpr && course.originalPriceNpr > course.priceNpr && (
                      <>
                        <span className="text-lg text-gray-400 line-through font-medium">
                          NPR {course.originalPriceNpr.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-[#D4AF37] bg-black/5 px-2 py-0.5 rounded ml-auto">
                          {discountPct}% off
                        </span>
                      </>
                    )}
                  </div>

                  {/* Urgency */}
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs mb-6 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>23 hours left at this price!</span>
                  </div>

                  {/* CTA Buttons */}
                  <CourseAddToCart
                    courseId={course.slug}
                    courseTitle={course.title}
                    coursePrice={course.priceNpr}
                    {...(course.heroImageUrl ? { courseThumbnail: course.heroImageUrl } : {})}
                    courseCategory={course.track}
                  />

                  <div className="text-center text-[10px] text-gray-500 mb-6 font-medium">
                    30-Day Money-Back Guarantee
                  </div>

                  {/* Includes */}
                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <p className="font-bold text-[#0F1C15] text-xs">This course includes:</p>
                    <ul className="space-y-2 text-xs text-gray-600 font-medium">
                      <li className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#0F1C15]" />
                        <span className="font-bold text-[#0F1C15]">30 Hours Live Zoom Classes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#0F1C15]" />
                        <span className="font-bold text-[#0F1C15]">
                          Platform Access (Tests/Notes)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <PlayCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span>{course.durationLabel} on-demand video</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-gray-400" />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
