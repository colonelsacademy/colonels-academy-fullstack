"use client";

import type { Category, Course } from "@/data/gateway";
import { useEffect, useState } from "react";
import { CourseFilter, CourseGrid, CourseGridSkeleton, CourseSection } from "./Courses";

interface EliteTrainingCurriculumToggleProps {
  courses: Course[];
  enrolledCourseIds: Set<string>;
  activeCategory: Category;
}

export function EliteTrainingCurriculumToggle({
  courses,
  enrolledCourseIds,
  activeCategory
}: EliteTrainingCurriculumToggleProps) {
  const [showCurriculum, setShowCurriculum] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("showEliteTrainingCurriculum");
    if (saved !== null) {
      setShowCurriculum(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!showCurriculum) {
    return null;
  }

  return (
    <CourseSection
      title="Elite Training Curriculum"
      subtitle="Command-level preparation. Select your target force to begin."
      className="pt-12"
    >
      <div className="mb-6">
        <CourseFilter activeCategory={activeCategory} />
      </div>

      <CourseGrid courses={courses} enrolledCourseIds={enrolledCourseIds} />
    </CourseSection>
  );
}
