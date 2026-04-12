"use client";

import { StageShell } from "./StageShell";

export function EmptyLessonStage({ courseTitle }: { courseTitle: string }) {
  return (
    <StageShell
      title="Classroom content is loading"
      eyebrow="Course player"
      courseTitle={courseTitle}
      footerTitle="Awaiting lesson selection"
    >
      <div className="flex h-full items-center justify-center">
        <div className="max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/82 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-lg leading-8 text-slate-700">
            The classroom is using live curriculum data. Once a lesson is available, the correct
            player experience will appear here automatically.
          </p>
        </div>
      </div>
    </StageShell>
  );
}
