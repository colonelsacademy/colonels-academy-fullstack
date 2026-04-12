"use client";

import type { LessonSubmissionDetail } from "@colonels-academy/contracts";
import { Headphones, Link2, Loader2, Mic, PenSquare } from "lucide-react";

import { StageShell } from "./StageShell";
import { type StageLesson, extractLessonContentLines, getSubmissionBlueprint } from "./shared";

export function SubmissionLessonStage({
  courseTitle,
  lesson,
  latestSubmission,
  submissionNotes,
  submissionFile,
  submissionBusy,
  submissionError,
  submissionMessage,
  onSubmissionNotesChange,
  onSubmissionFileChange,
  onSubmitSubmission
}: {
  courseTitle: string;
  lesson: StageLesson;
  latestSubmission?: LessonSubmissionDetail | null | undefined;
  submissionNotes: string;
  submissionFile: File | null;
  submissionBusy: boolean;
  submissionError?: string | null | undefined;
  submissionMessage?: string | null | undefined;
  onSubmissionNotesChange: (value: string) => void;
  onSubmissionFileChange: (file: File | null) => void;
  onSubmitSubmission: () => void;
}) {
  const blueprint = getSubmissionBlueprint(lesson);
  const contentLines = extractLessonContentLines(lesson.lessonContent).slice(0, 2);

  if (!blueprint) {
    return (
      <StageShell
        title={lesson.title}
        eyebrow="Guided exercise"
        courseTitle={courseTitle}
        footerTitle={lesson.title}
      >
        <div className="flex h-full items-center justify-center">
          <div className="max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xl leading-8 text-slate-700">{contentLines[0] ?? lesson.synopsis}</p>
          </div>
        </div>
      </StageShell>
    );
  }

  return (
    <StageShell
      title={lesson.title}
      eyebrow={lesson.learningMode === "FEEDBACK" ? "Feedback workspace" : "Practice workspace"}
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="grid h-full gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(14,23,38,0.98),rgba(30,41,59,0.98))] p-7 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-3 text-sky-300">
            {blueprint.submissionType === "LECTURETTE" ? (
              <Mic className="h-5 w-5" />
            ) : blueprint.submissionType === "APPRECIATION_PLAN" ? (
              <Link2 className="h-5 w-5" />
            ) : (
              <PenSquare className="h-5 w-5" />
            )}
            <span className="text-xs font-bold uppercase tracking-[0.28em]">{blueprint.title}</span>
          </div>
          <p className="mt-5 text-lg leading-8 text-slate-100">{blueprint.description}</p>
          <div className="mt-6 space-y-3">
            {(contentLines.length > 0 ? contentLines : [lesson.synopsis]).map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200"
              >
                {line}
              </div>
            ))}
          </div>
          {latestSubmission ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">
                Latest review state
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {latestSubmission.status.replaceAll("_", " ")}
              </p>
              {latestSubmission.reviewNotes ? (
                <p className="mt-3 text-sm leading-6 text-emerald-50">
                  {latestSubmission.reviewNotes}
                </p>
              ) : null}
              {latestSubmission.score !== undefined && latestSubmission.maxScore !== undefined ? (
                <p className="mt-3 text-sm font-semibold text-white">
                  Score: {latestSubmission.score}/{latestSubmission.maxScore}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
            Write or upload your response
          </p>
          <div className="mt-5 space-y-4">
            <textarea
              value={submissionNotes}
              onChange={(event) => onSubmissionNotesChange(event.target.value)}
              rows={7}
              placeholder="Write your answer, plan, reflection, or presentation notes here."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
            <input
              type="file"
              accept={blueprint.accept}
              onChange={(event) => onSubmissionFileChange(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
            />
            {submissionFile ? (
              <p className="text-sm text-slate-500">Attached: {submissionFile.name}</p>
            ) : null}
            {submissionError ? <p className="text-sm text-red-700">{submissionError}</p> : null}
            {submissionMessage ? (
              <p className="text-sm text-emerald-700">{submissionMessage}</p>
            ) : null}
            <button
              type="button"
              onClick={onSubmitSubmission}
              disabled={submissionBusy || (!submissionFile && !submissionNotes.trim())}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submissionBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Headphones className="h-4 w-4" />
              )}
              {submissionBusy ? "Submitting..." : blueprint.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </StageShell>
  );
}
