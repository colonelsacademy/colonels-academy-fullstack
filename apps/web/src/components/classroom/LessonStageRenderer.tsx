"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { attemptClassroomQuizQuestion } from "@/services/classroomService";
import type {
  LessonDetail,
  LessonSubmissionDetail,
  SubmissionType
} from "@colonels-academy/contracts";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Headphones,
  Link2,
  Loader2,
  Mic,
  PenSquare,
  PlayCircle,
  Radio,
  ShieldCheck
} from "lucide-react";

import VideoPlayer from "../ui/VideoPlayer";
import TextLessonStage from "./TextLessonStage";

type StageLesson = {
  id: string;
  title: string;
  synopsis: string;
  durationLabel: string;
  contentType: LessonDetail["contentType"];
  learningMode?: LessonDetail["learningMode"];
  progressStatus: LessonDetail["progressStatus"];
  isLocked: boolean;
  unlockRequirement?: string;
  phaseNumber?: number;
  subjectArea?: LessonDetail["subjectArea"];
  videoId?: string;
  meetingUrl?: string;
  pdfUrl?: string;
  lessonContent?: LessonDetail["lessonContent"];
  quizQuestions?: LessonDetail["quizQuestions"];
};

type LessonStageRendererProps = {
  courseTitle: string;
  poster?: string;
  lesson: StageLesson | null;
  latestSubmission?: LessonSubmissionDetail | null | undefined;
  submissionNotes: string;
  submissionFile: File | null;
  submissionBusy: boolean;
  submissionError?: string | null | undefined;
  submissionMessage?: string | null | undefined;
  progressBusy: boolean;
  onSubmissionNotesChange: (value: string) => void;
  onSubmissionFileChange: (file: File | null) => void;
  onSubmitSubmission: () => void;
  onMarkComplete: () => void;
};

function extractLessonContentLines(content?: LessonDetail["lessonContent"]) {
  if (!content) {
    return [];
  }

  if (content.mode === "cue") {
    return content.segments.map((segment) => segment.text);
  }

  return content.blocks.flatMap((block) => {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return [block.text];
      case "bulletList":
        return block.items;
      default:
        return [];
    }
  });
}

function getSubmissionBlueprint(lesson: StageLesson): {
  submissionType: SubmissionType;
  title: string;
  description: string;
  accept: string;
  ctaLabel: string;
} | null {
  if (lesson.learningMode !== "PRACTICE" && lesson.learningMode !== "FEEDBACK") {
    return null;
  }

  if (lesson.subjectArea === "LECTURETTE") {
    return {
      submissionType: "LECTURETTE",
      title: "Recorded Presentation",
      description:
        "Upload your lecturette recording and notes so the instructor can review structure, confidence, and delivery.",
      accept: "video/*,audio/*,.pdf,.doc,.docx",
      ctaLabel: "Submit Presentation"
    };
  }

  if (lesson.subjectArea === "APPRECIATION_PLANS") {
    return {
      submissionType: "APPRECIATION_PLAN",
      title: "Appreciation / Plan Submission",
      description:
        "Write your appreciation, plan, or map-based answer here and attach any supporting file for faculty review.",
      accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
      ctaLabel: "Submit Plan"
    };
  }

  return {
    submissionType: "ESSAY",
    title: "Written Response",
    description:
      "Draft your answer, analysis, or notes here so instructors can review written clarity, argument flow, and exam structure.",
    accept: ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg",
    ctaLabel: "Submit Response"
  };
}

function formatSubject(subjectArea?: LessonDetail["subjectArea"]) {
  if (!subjectArea) {
    return null;
  }

  return subjectArea
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function StageShell({
  title,
  eyebrow,
  courseTitle,
  footerTitle,
  children
}: {
  title: string;
  eyebrow: string;
  courseTitle: string;
  footerTitle: string;
  children: ReactNode;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f6f8fa_58%,_#eaf0f5_100%)]">
      <div className="flex h-full flex-col">
        <div className="border-b-4 border-sky-400 px-8 pb-4 pt-7 md:px-14 md:pb-5 md:pt-9">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="font-['Rajdhani'] text-[clamp(2rem,1.35rem+2.2vw,4.4rem)] font-bold leading-none tracking-[0.03em] text-slate-950">
            {title}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-8 py-6 md:px-14 md:py-8">{children}</div>

        <div className="border-t-4 border-sky-400 bg-white/85 px-6 py-3 backdrop-blur-sm md:px-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 md:text-xs">
              {courseTitle}
            </p>
            <p className="font-['Rajdhani'] text-lg font-bold text-slate-950 md:text-2xl">
              {footerTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedLessonStage({
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

function LiveLessonStage({
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

function ResourceLessonStage({
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

function SubmissionLessonStage({
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

function QuizLessonStage({
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
  const questions = lesson.quizQuestions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string | null;
  } | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const questionStartedAtRef = useRef(Date.now());

  // biome-ignore lint/correctness/useExhaustiveDependencies: lesson.id is a trigger — resets quiz state when lesson changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitting(false);
    setFeedback(null);
    setAnsweredCount(0);
    setSessionId(null);
    questionStartedAtRef.current = Date.now();
  }, [lesson.id]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isFinished = totalQuestions > 0 && currentIndex >= totalQuestions;

  const submitAnswer = async () => {
    if (!currentQuestion || selectedOption === null) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await attemptClassroomQuizQuestion({
        questionId: currentQuestion.id,
        selectedOptionIndex: selectedOption,
        timeTakenMs: Date.now() - questionStartedAtRef.current,
        ...(sessionId ? { sessionId } : {})
      });

      if (response.quizSessionId) {
        setSessionId(response.quizSessionId);
      }

      setFeedback({
        isCorrect: response.isCorrect,
        explanation: response.explanation
      });
      setAnsweredCount((count) => count + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setCurrentIndex((index) => index + 1);
    questionStartedAtRef.current = Date.now();
  };

  if (totalQuestions === 0) {
    return (
      <StageShell
        title={lesson.title}
        eyebrow="Quiz lesson"
        courseTitle={courseTitle}
        footerTitle={lesson.title}
      >
        <div className="flex h-full items-center justify-center">
          <div className="max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/82 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <PlayCircle className="mx-auto h-12 w-12 text-sky-500" />
            <h3 className="mt-4 font-['Rajdhani'] text-3xl font-bold text-slate-950">
              Quiz shell is wired
            </h3>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              This lesson is ready for in-player quiz questions and answer submission. Add question
              content in admin or seed data and they will render here automatically.
            </p>
          </div>
        </div>
      </StageShell>
    );
  }

  if (isFinished) {
    return (
      <StageShell
        title={lesson.title}
        eyebrow="Quiz complete"
        courseTitle={courseTitle}
        footerTitle={lesson.title}
      >
        <div className="flex h-full items-center justify-center">
          <div className="max-w-3xl rounded-[1.75rem] border border-emerald-200 bg-white/82 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 font-['Rajdhani'] text-3xl font-bold text-slate-950">
              Practice set completed
            </h3>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              You answered {answeredCount} question{answeredCount === 1 ? "" : "s"} in this lesson.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onMarkComplete}
                disabled={progressBusy || lesson.progressStatus === "COMPLETED"}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {progressBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {lesson.progressStatus === "COMPLETED" ? "Completed" : "Mark Quiz Complete"}
              </button>
            </div>
          </div>
        </div>
      </StageShell>
    );
  }

  return (
    <StageShell
      title={lesson.title}
      eyebrow="Interactive quiz"
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="grid h-full gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(14,23,38,0.98),rgba(30,41,59,0.98))] p-7 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">
            Question progress
          </p>
          <p className="mt-4 font-['Rajdhani'] text-5xl font-bold">
            {currentIndex + 1}/{totalQuestions}
          </p>
          <p className="mt-4 text-base leading-7 text-slate-200">{lesson.synopsis}</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-400 transition-[width]"
              style={{ width: `${((currentIndex + (feedback ? 1 : 0)) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
            Question {currentIndex + 1}
          </p>
          <h3 className="mt-4 text-[clamp(1.15rem,1rem+0.5vw,1.5rem)] font-semibold leading-8 text-slate-950">
            {currentQuestion?.question}
          </h3>
          <div className="mt-6 space-y-3">
            {currentQuestion?.options.map((option, optionIndex) => (
              <button
                key={`${currentQuestion.id}-${optionIndex}`}
                type="button"
                disabled={Boolean(feedback)}
                onClick={() => setSelectedOption(optionIndex)}
                className={`w-full rounded-2xl border px-4 py-4 text-left text-sm leading-6 transition ${
                  selectedOption === optionIndex
                    ? "border-sky-400 bg-sky-50 text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                } ${feedback ? "cursor-default" : ""}`}
              >
                {option.text}
              </button>
            ))}
          </div>
          {feedback ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-4 text-sm leading-7 ${
                feedback.isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <p className="font-bold">
                {feedback.isCorrect ? "Correct." : "Review this explanation."}
              </p>
              {feedback.explanation ? <p className="mt-2">{feedback.explanation}</p> : null}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {!feedback ? (
              <button
                type="button"
                onClick={() => void submitAnswer()}
                disabled={selectedOption === null || isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {isSubmitting ? "Checking..." : "Submit Answer"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400"
              >
                <PlayCircle className="h-4 w-4" />
                {currentIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
              </button>
            )}
          </div>
        </div>
      </div>
    </StageShell>
  );
}

function EmptyLessonStage({ courseTitle }: { courseTitle: string }) {
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

export default function LessonStageRenderer({
  courseTitle,
  poster,
  lesson,
  latestSubmission,
  submissionNotes,
  submissionFile,
  submissionBusy,
  submissionError,
  submissionMessage,
  progressBusy,
  onSubmissionNotesChange,
  onSubmissionFileChange,
  onSubmitSubmission,
  onMarkComplete
}: LessonStageRendererProps) {
  const shouldUseSubmissionStage = lesson
    ? lesson.learningMode === "PRACTICE" || lesson.learningMode === "FEEDBACK"
    : false;

  const shouldUseResourceStage =
    lesson?.contentType === "PDF" || lesson?.learningMode === "RESOURCE";

  const shouldUseLiveStage = lesson?.contentType === "LIVE" || lesson?.learningMode === "LIVE";

  const hasQuizQuestions = (lesson?.quizQuestions?.length ?? 0) > 0;
  const shouldUseQuizStage =
    lesson?.contentType === "QUIZ" || lesson?.learningMode === "QUIZ" || hasQuizQuestions;

  if (!lesson) {
    return <EmptyLessonStage courseTitle={courseTitle} />;
  }

  if (lesson.isLocked) {
    return <LockedLessonStage courseTitle={courseTitle} lesson={lesson} />;
  }

  if (shouldUseLiveStage) {
    return (
      <LiveLessonStage
        courseTitle={courseTitle}
        lesson={lesson}
        onMarkComplete={onMarkComplete}
        progressBusy={progressBusy}
      />
    );
  }

  if (shouldUseResourceStage) {
    return (
      <ResourceLessonStage
        courseTitle={courseTitle}
        lesson={lesson}
        onMarkComplete={onMarkComplete}
        progressBusy={progressBusy}
      />
    );
  }

  if (shouldUseQuizStage) {
    return (
      <QuizLessonStage
        courseTitle={courseTitle}
        lesson={lesson}
        onMarkComplete={onMarkComplete}
        progressBusy={progressBusy}
      />
    );
  }

  if (shouldUseSubmissionStage) {
    return (
      <SubmissionLessonStage
        courseTitle={courseTitle}
        lesson={lesson}
        latestSubmission={latestSubmission}
        submissionNotes={submissionNotes}
        submissionFile={submissionFile}
        submissionBusy={submissionBusy}
        submissionError={submissionError}
        submissionMessage={submissionMessage}
        onSubmissionNotesChange={onSubmissionNotesChange}
        onSubmissionFileChange={onSubmissionFileChange}
        onSubmitSubmission={onSubmitSubmission}
      />
    );
  }

  if (lesson.lessonContent) {
    return (
      <TextLessonStage
        title={lesson.title}
        courseTitle={courseTitle}
        content={lesson.lessonContent}
      />
    );
  }

  if (lesson.contentType === "VIDEO") {
    return (
      <VideoPlayer
        {...(lesson.videoId ? { videoId: lesson.videoId } : {})}
        {...(poster ? { poster } : {})}
        autoplay={false}
        className="rounded-none shadow-none"
      />
    );
  }

  return (
    <StageShell
      title={lesson.title}
      eyebrow="Lesson stage"
      courseTitle={courseTitle}
      footerTitle={lesson.title}
    >
      <div className="flex h-full items-center justify-center">
        <div className="max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/82 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-lg leading-8 text-slate-700">{lesson.synopsis}</p>
        </div>
      </div>
    </StageShell>
  );
}
