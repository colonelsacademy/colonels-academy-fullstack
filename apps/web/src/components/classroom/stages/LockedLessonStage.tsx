"use client";

import { ShieldCheck } from "lucide-react";

import { StageShell } from "./StageShell";
import type { StageLesson } from "./shared";

export function LockedLessonStage({
  courseTitle,
  lesson
}: {
  courseTitle: string;
  lesson: StageLesson;
}) {
  return (
    <StageShell
      title={lesson.title}
      eyebrow="Locked lesson"
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="flex h-full items-center justify-center">
        <div className="max-w-2xl rounded-[1.75rem] border border-amber-200 bg-white/80 p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 font-['Rajdhani'] text-3xl font-bold text-slate-950">
            Complete the previous milestone first
          </h3>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            {lesson.unlockRequirement ??
              "This lesson will unlock once your previous phase is cleared."}
          </p>
        </div>
      </div>
    </StageShell>
  );
}
