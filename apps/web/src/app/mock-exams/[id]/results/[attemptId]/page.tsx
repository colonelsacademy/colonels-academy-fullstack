"use client";

import { ArrowLeft, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Result {
  questionId: string;
  questionText: string;
  options: string[];
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface AttemptResults {
  attemptId: string;
  mockTestId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
  results: Result[];
}

export default function MockTestResultsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const attemptId = params.attemptId as string;

  const [results, setResults] = useState<AttemptResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/mock-tests/${testId}/attempts/${attemptId}`);
        if (!response.ok) throw new Error("Failed to fetch results");
        const data = await response.json();
        setResults(data);
        toast.success("Result saved to your account.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md">
          <h2 className="text-xl font-bold text-[#0F1C15] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to load results"}</p>
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

  const correctCount = results.results.filter((r) => r.isCorrect).length;
  const minutes = Math.floor(results.timeTakenSeconds / 60);
  const seconds = results.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Header */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0F1C15] font-bold mb-8 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Score Card */}
        <div
          className={`rounded-2xl border-2 p-12 mb-8 text-center ${
            results.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="mb-6">
            {results.passed ? (
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            )}
          </div>

          <h1
            className={`text-4xl font-bold font-['Rajdhani'] mb-2 ${
              results.passed ? "text-green-700" : "text-red-700"
            }`}
          >
            {results.passed ? "PASSED" : "FAILED"}
          </h1>

          <p
            className={`text-lg font-medium mb-8 ${
              results.passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {results.testTitle}
          </p>

          {/* Score Details */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl font-bold text-[#0F1C15] font-['Rajdhani']">
                {results.score}/{results.totalMarks}
              </div>
              <div className="text-sm text-gray-600 mt-1">Score</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl font-bold text-[#0F1C15] font-['Rajdhani']">
                {results.percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Percentage</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600 font-['Rajdhani']">
                {correctCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Correct</div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl font-bold text-[#0F1C15] font-['Rajdhani']">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600 mt-1">Time Taken</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/mock-test/${testId}/attempt`)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Test
          </button>
        </div>

        {/* Question Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">
              Question Breakdown
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {results.results.map((result, idx) => (
              <div key={result.questionId} className="p-6">
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                  className="w-full text-left flex items-start justify-between hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${
                        result.isCorrect ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#0F1C15]">{result.questionText}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span
                          className={
                            result.isCorrect
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                        {!result.isCorrect && (
                          <span className="text-gray-600">
                            Your answer:{" "}
                            <span className="font-medium">
                              {result.userAnswer || "Not answered"}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 ml-4">{expandedQuestion === idx ? "−" : "+"}</div>
                </button>

                {expandedQuestion === idx && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Options:</p>
                      <div className="space-y-2">
                        {result.options.map((option, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isCorrectAnswer = letter === result.correctAnswer;
                          const isUserAnswer = letter === result.userAnswer;

                          return (
                            <div
                              key={`${result.questionId}-${letter}`}
                              className={`p-3 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? "bg-green-50 border border-green-200 text-green-700"
                                  : isUserAnswer
                                    ? "bg-red-50 border border-red-200 text-red-700"
                                    : "bg-gray-50 border border-gray-200 text-gray-700"
                              }`}
                            >
                              <span className="font-bold">{letter})</span> {option}
                              {isCorrectAnswer && <span className="ml-2">✓ Correct</span>}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="ml-2">✗ Your answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {result.explanation && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
