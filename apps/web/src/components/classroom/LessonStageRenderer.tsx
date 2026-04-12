"use client";

import type { LessonSubmissionDetail } from "@colonels-academy/contracts";

import VideoPlayer from "../ui/VideoPlayer";
import TextLessonStage from "./TextLessonStage";
import { EmptyLessonStage } from "./stages/EmptyLessonStage";
import { LiveLessonStage } from "./stages/LiveLessonStage";
import { LockedLessonStage } from "./stages/LockedLessonStage";
import { QuizLessonStage } from "./stages/QuizLessonStage";
import { ResourceLessonStage } from "./stages/ResourceLessonStage";
import { StageShell } from "./stages/StageShell";
import { SubmissionLessonStage } from "./stages/SubmissionLessonStage";
import type { StageLesson } from "./stages/shared";

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
