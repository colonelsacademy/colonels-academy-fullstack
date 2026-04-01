'use client';

import { useMemo } from 'react';
import { MENTORS, type Mentor, type Category } from '@/data/gateway';

export function useMentors(category?: Category) {
  const mentors = useMemo<Mentor[]>(() => {
    if (!category || category === 'all') return MENTORS;
    return MENTORS.filter((m) => m.category === category);
  }, [category]);

  return { mentors, isLoading: false };
}
