import { Footer } from "@/components/Footer";
import { getCourseBySlug, getInstructors } from "@/lib/api";
import { notFound } from "next/navigation";

import { StaffCollegeCourseDetails } from "./components/StaffCollegeCourseDetails";
import StaffCollegeHero from "./components/StaffCollegeHero";
import { StaffCollegeIntake } from "./components/StaffCollegeIntake";

export default async function StaffCollegePage() {
  // Fetch both the course and the faculty to feed into the course detail layout
  const [course, faculty] = await Promise.all([
    getCourseBySlug("staff-college-command"),
    getInstructors()
  ]);
  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-blue-100 selection:text-blue-900">
      <StaffCollegeHero />

      {/* Razor-thin background separator blending at the edges */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent relative -top-3 opacity-70" />

      <div className="max-w-[1400px] mx-auto px-4">
        <StaffCollegeIntake />
        <StaffCollegeCourseDetails course={course} faculty={faculty} />
      </div>

      <Footer />
    </div>
  );
}
