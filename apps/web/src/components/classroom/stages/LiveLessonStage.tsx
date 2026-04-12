"use client";

import { CheckCircle2, Loader2, PlayCircle, Radio } from "lucide-react";

import { StageShell } from "./StageShell";
import { type StageLesson, extractLessonContentLines, formatSubject } from "./shared";

export function LiveLessonStage({
  courseTitle,
  lesson,
  onMarkComplete,
  progressBusy
}: {
  courseTitle: string;
  lesson: StageLesson;
  onMarkComplete: () => void;
  progressBusy: boolean;
}) {
  const contentLines = extractLessonContentLines(lesson.lessonContent).slice(0, 3);

  return (
    <StageShell
      title={lesson.title}
      eyebrow="Instructor-led live session"
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="grid h-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] bg-[#0e1726] p-8 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-3 text-sky-300">
            <Radio className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.28em]">
              Live cadence enabled
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-100">{lesson.synopsis}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100">
              {lesson.durationLabel}
            </span>
            {lesson.phaseNumber ? (
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100">
                Phase {lesson.phaseNumber}
              </span>
            ) : null}
            {formatSubject(lesson.subjectArea) ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100">
                {formatSubject(lesson.subjectArea)}
              </span>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={lesson.meetingUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                lesson.meetingUrl
                  ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                  : "cursor-not-allowed bg-white/10 text-white/50"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              {lesson.meetingUrl ? "Join Session" : "Session Link Pending"}
            </a>
            <button
              type="button"
              onClick={onMarkComplete}
              disabled={progressBusy || lesson.progressStatus === "COMPLETED"}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {progressBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {lesson.progressStatus === "COMPLETED" ? "Completed" : "Mark Complete"}
            </button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
            Session focus
          </p>
          <div className="mt-4 space-y-4">
            {(contentLines.length > 0 ? contentLines : [lesson.synopsis]).map((line) => (
              <p key={line} className="text-lg leading-8 text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </StageShell>
  );
}
