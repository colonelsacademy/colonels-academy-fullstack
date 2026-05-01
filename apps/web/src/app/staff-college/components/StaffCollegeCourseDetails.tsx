import CourseAddToCart from "@/components/CourseAddToCart";
import type { CourseDetail, InstructorProfile } from "@colonels-academy/contracts";
import { instructors as fallbackInstructors } from "@colonels-academy/contracts";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  PlayCircle,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { CourseContentAccordion } from "./CourseContentAccordion";

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

interface StaffCollegeCourseDetailsProps {
  course: CourseDetail;
  faculty: InstructorProfile[];
}

export const StaffCollegeCourseDetails = ({ course, faculty }: StaffCollegeCourseDetailsProps) => {
  const courseFaculty = (faculty.length ? faculty : fallbackInstructors).filter((i) =>
    course.instructorSlugs.includes(i.slug)
  );
  const mainInstructor: InstructorProfile | undefined = courseFaculty[0];
  const discountPct = course.originalPriceNpr
    ? Math.round(((course.originalPriceNpr - course.priceNpr) / course.originalPriceNpr) * 100)
    : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-12 mt-12 mb-20 bg-white rounded-3xl p-6 lg:p-12 shadow-sm border border-gray-100 relative">
      {/* ── LEFT COLUMN ── */}
      <div className="lg:col-span-2 space-y-12">
        {/* Title & Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
              {TRACK_LABEL[course.track] ?? course.track}
            </span>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              STAFF COLLEGE
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#0F1C15] font-['Rajdhani'] leading-tight">
            {course.title}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            {course.description} Comprehensive preparation module designed by serving and retired
            officers to ensure your success in the {TRACK_LABEL[course.track]} selection process.
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
                  {mainInstructor.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mainInstructor.avatarUrl}
                      alt={mainInstructor.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    mainInstructor.name.charAt(0)
                  )}
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
            <h2 className="text-3xl font-bold mb-4 font-['Rajdhani']">Hybrid Commander System</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              We combine elite mentorship with cutting-edge technology. This isn&apos;t just a video
              course; it&apos;s a complete academy experience.
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
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
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
        <CourseContentAccordion course={course} />

        {/* Requirements */}
        <div>
          <h3 className="text-2xl font-bold text-[#0F1C15] mb-4 font-['Rajdhani']">Requirements</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm pl-2 marker:text-[#D4AF37]">
            <li>Must be a Nepali Citizen.</li>
            <li>Dedication and willingness to serve the nation.</li>
            <li>Completion of officer qualification criteria.</li>
          </ul>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-2xl font-bold text-[#0F1C15] mb-4 font-['Rajdhani']">Description</h3>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-sm text-gray-600 leading-relaxed font-medium space-y-4">
            <p>
              This is the most comprehensive online preparation course for the{" "}
              <strong>{course.title}</strong> examination. Built in strict accordance with the
              latest Public Service Commission (Lok Sewa Aayog) syllabus, this course covers every
              single aspect of the selection process.
            </p>
            <p>
              From the initial written examination to the final interview Board Conference, our
              expert instructors (former Selection Board members) guide you through the nuances of
              what the force is looking for in a future leader.
            </p>
            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 font-bold text-center">
              &quot;More than just a course, it&apos;s a transformation into an Officer.&quot;
            </div>
          </div>
        </div>

        {/* Instructor */}
        {mainInstructor && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-[#0F1C15] mb-6 font-['Rajdhani']">
              Instructor Bio
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-[#0F1C15] border border-gray-200 overflow-hidden flex items-center justify-center text-[#D4AF37] font-bold text-2xl shrink-0">
                {mainInstructor.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainInstructor.avatarUrl}
                    alt={mainInstructor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  mainInstructor.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">
                  Directing Staff
                </p>
                <h4 className="text-2xl font-bold text-[#0B1120] font-['Rajdhani'] leading-tight">
                  {mainInstructor.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4 font-bold tracking-wide uppercase">
                  {mainInstructor.specialization}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-[#0B1120]">4.9 Rating</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[#0B1120]">1,200+ Students</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                    <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[#0B1120]">{mainInstructor.experience}</span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{mainInstructor.bio}</p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/instructors"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1120] text-white font-bold text-xs uppercase tracking-wider rounded-full border border-[#0B1120] shadow-sm hover:bg-black transition-colors"
                  >
                    View Complete Bio
                  </Link>
                  <Link
                    href="/instructors"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold text-xs uppercase tracking-wider rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    View All Directing Staff
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: STICKY PRICING CARD ── */}
      <div className="lg:col-span-1">
        <div id="enroll" className="sticky top-24">
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
                    <span className="font-bold text-[#0F1C15]">Platform Access (Tests/Notes)</span>
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
  );
};
