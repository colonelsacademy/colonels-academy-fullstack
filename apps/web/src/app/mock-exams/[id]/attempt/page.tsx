"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Question {
  id: string;
  position: number;
  questionText: string;
  options: string[];
  difficulty?: number;
  isImageBased?: boolean;
  imageUrl?: string;
}

interface MockTest {
  id: string;
  title: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  questions: Question[];
}

interface Attempt {
  id: string;
  mockTestId: string;
  startedAt: string;
}

export default function MockTestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<MockTest | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setError(null); // Clear any previous errors
        const response = await fetch(`/api/mock-tests/${testId}`);
        if (!response.ok) throw new Error("Failed to fetch test");
        const data = await response.json();
        setTest(data);
        setTimeLeft(data.timeLimitMinutes * 60);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Start attempt
  useEffect(() => {
    if (!test || attempt) return;

    const startAttempt = async () => {
      try {
        setError(null); // Clear any previous errors
        const response = await fetch(`/api/mock-tests/${testId}/start`, {
          method: "POST"
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to start attempt (${response.status})`);
        }
        const data = await response.json();
        setAttempt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start attempt");
      }
    };

    startAttempt();
  }, [test, attempt, testId]);

  // Timer
  useEffect(() => {
    if (!attempt || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt, timeLeft]);

  const handleAnswer = (letter: string) => {
    if (!test) return;
    const question = test.questions[currentQuestionIndex];
    if (!question) return;

    // Convert letter (A, B, C, D) to full option text
    const letterIndex = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
    const fullAnswer = question.options[letterIndex] || "";

    setAnswers((prev) => ({
      ...prev,
      [question.id]: fullAnswer
    }));
  };

  const handleNext = () => {
    if (!test || currentQuestionIndex >= test.questions.length - 1) return;
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = useCallback(async () => {
    if (!test || !attempt || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/mock-tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers,
          timeTakenSeconds: test.timeLimitMinutes * 60 - timeLeft
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit (${response.status})`);
      }

      router.push(`/mock-exams/${testId}/results/${attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  }, [test, attempt, answers, timeLeft, testId, submitting, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-[#0F1C15] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to load test"}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 300; // 5 minutes

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">{test.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {test.totalQuestions}
            </p>
          </div>

          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-bold ${
              isTimeWarning ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0F1C15] mb-6">
                  {currentQuestion.questionText}
                </h2>

                {/* Image if present */}
                {currentQuestion.isImageBased && currentQuestion.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
                    const isSelected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        type="button"
                        key={`${currentQuestion.id}-${letter}`}
                        onClick={() => handleAnswer(letter)}
                        className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                          isSelected
                            ? "border-[#D4AF37] bg-[#FEFCE8] text-[#0F1C15]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span className="font-bold">{letter})</span> {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === test.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-[#0F1C15] mb-4 uppercase tracking-wider text-sm">
                Progress
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Answered</span>
                  <span className="font-bold">
                    {answeredCount}/{test.totalQuestions}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] transition-all"
                    style={{ width: `${(answeredCount / test.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-[#0F1C15] mb-4 uppercase tracking-wider text-sm">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((q, idx) => (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => handleJump(idx)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                      idx === currentQuestionIndex
                        ? "bg-[#0F1C15] text-white border-2 border-[#D4AF37]"
                        : answers[q.id]
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
