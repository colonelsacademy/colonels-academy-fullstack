"use client";

import { CheckCircle2, ExternalLink, FileText, Loader2 } from "lucide-react";

import { StageShell } from "./StageShell";
import { type StageLesson, extractLessonContentLines } from "./shared";

export function ResourceLessonStage({
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
      eyebrow="Resource lesson"
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="grid h-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mt-5 font-['Rajdhani'] text-3xl font-bold text-slate-950">
            Resource Pack
          </h3>
          <p className="mt-4 text-lg leading-8 text-slate-700">{lesson.synopsis}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={lesson.pdfUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                lesson.pdfUrl
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              {lesson.pdfUrl ? "Open Resource" : "Resource Pending"}
            </a>
            <button
              type="button"
              onClick={onMarkComplete}
              disabled={progressBusy || lesson.progressStatus === "COMPLETED"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(14,23,38,0.96),rgba(30,41,59,0.96))] p-7 text-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">
            Included in this resource
          </p>
          <div className="mt-5 space-y-4">
            {(contentLines.length > 0 ? contentLines : [lesson.synopsis]).map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg leading-8 text-slate-100"
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StageShell>
  );
}
