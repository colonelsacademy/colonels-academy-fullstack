'use client';

import { useMemo } from 'react';
import { DEFAULT_COURSES, type Course, type Category } from '@/data/gateway';

export function useCourses(category?: Category) {
  const courses = useMemo<Course[]>(() => {
    if (!category || category === 'all') return DEFAULT_COURSES;
    return DEFAULT_COURSES.filter(
      (c) => c.category === category || (category === 'army' && c.category === 'cadet')
    );
  }, [category]);

  return { courses: DEFAULT_COURSES, filteredCourses: courses, isLoading: false };
}

export function useCourse(id: string) {
  const course = useMemo(() => DEFAULT_COURSES.find((c) => c.id === id) ?? null, [id]);
  return { course, isLoading: false };
}
