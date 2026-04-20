"use client";

import { useEffect, useRef, useState } from "react";

import { attemptClassroomQuizQuestion } from "@/services/classroomService";
import { CheckCircle2, Loader2, PlayCircle } from "lucide-react";

import { StageShell } from "./StageShell";
import type { StageLesson } from "./shared";

export function QuizLessonStage({
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
