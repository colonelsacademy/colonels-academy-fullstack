"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
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
  priceNpr?: number;
  accessType?: string;
}

interface Attempt {
  id: string;
  mockTestId: string;
  startedAt: string;
}

interface PurchaseStatus {
  hasPurchased: boolean;
  freePreviewCount: number;
}

export default function MockTestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const { loading: authLoading, authenticated } = useAuth();

  const [test, setTest] = useState<MockTest | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>({
    hasPurchased: false,
    freePreviewCount: 5
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !authenticated) {
      setLoading(false);
    }
  }, [authLoading, authenticated]);

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setError(null); // Clear any previous errors

        const response = await fetch(`/api/mock-tests/${testId}`);
        if (!response.ok) throw new Error("Failed to fetch test");
        const data = await response.json();

        setTest(data);
        setTimeLeft((data.timeLimitMinutes || 30) * 60);

        // Check access status
        const accessResponse = await fetch(`/api/mock-tests/${testId}/check-access`);
        if (accessResponse.ok) {
          const accessData = await accessResponse.json();
          setPurchaseStatus({
            hasPurchased: accessData.canViewAllQuestions,
            freePreviewCount: accessData.freePreviewCount || 5
          });
        }
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

    const nextIndex = currentQuestionIndex + 1;

    // Check if next question is locked
    if (!purchaseStatus.hasPurchased && nextIndex >= purchaseStatus.freePreviewCount) {
      setShowPurchaseModal(true);
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const handlePrev = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleJump = (index: number) => {
    // Check if question is locked
    if (!purchaseStatus.hasPurchased && index >= purchaseStatus.freePreviewCount) {
      setShowPurchaseModal(true);
      return;
    }

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

      router.push(`/mock-test/${testId}/results/${attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  }, [test, attempt, answers, timeLeft, testId, submitting, router]);

  if (loading && !isNavigatingAway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-[#E5E7EB] flex items-center justify-center p-4">
        <style>{`
          @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
          .loading-container { animation: slide-in 0.6s ease-out; }
          .pulse-ring { animation: pulse-ring 2s infinite; }
        `}</style>
        <div className="loading-container text-center max-w-md">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full opacity-20 blur-xl" />
              <div className="relative w-full h-full rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center pulse-ring">
                <svg
                  className="w-10 h-10 text-[#D4AF37]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
            Preparing Your Test
          </h2>
          <p className="text-gray-600 text-sm mb-8">Loading assessment details and questions...</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full"
                style={{
                  animation: "width 2s ease-in-out infinite",
                  width: "30%"
                }}
              />
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-[#D4AF37] border-r-[#D4AF37] rounded-full animate-spin" />
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Secure connection</p>
            <p>✓ Your progress is saved</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading && !isNavigatingAway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-[#E5E7EB] flex items-center justify-center p-4">
        <style>{`
          @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
          .loading-container { animation: slide-in 0.6s ease-out; }
          .pulse-ring { animation: pulse-ring 2s infinite; }
        `}</style>
        <div className="loading-container text-center max-w-md">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full opacity-20 blur-xl" />
              <div className="relative w-full h-full rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center pulse-ring">
                <svg
                  className="w-10 h-10 text-[#D4AF37]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
            Verifying Access
          </h2>
          <p className="text-gray-600 text-sm mb-8">Checking your authentication...</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full"
                style={{
                  animation: "width 2s ease-in-out infinite",
                  width: "30%"
                }}
              />
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-[#D4AF37] border-r-[#D4AF37] rounded-full animate-spin" />
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Secure connection</p>
            <p>✓ Your progress is saved</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in required message
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#0F1C15]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Lock icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0F1C15] mb-3 font-['Rajdhani']">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-8">
            You must be signed in to perform this test. Please sign in with your account to
            continue.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() =>
                router.push(`/login?next=${encodeURIComponent(`/mock-test/${testId}/attempt`)}`)
              }
              className="w-full px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider text-sm"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gray-100 text-[#0F1C15] font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-[#0F1C15] mb-2">Error</h2>
          <p className="text-gray-600 mb-2">{error || "Failed to load test"}</p>
          {error && <p className="text-xs text-gray-500 mb-6 font-mono">{error}</p>}
          <button
            type="button"
            onClick={() => router.push("/")}
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
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Preparing your test...</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
              <p className="text-xs text-red-700 font-mono">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-[#0F1C15] mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-6">
            This test doesn't have any questions yet. Please try another test or contact support.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 300; // 5 minutes
  const isCurrentQuestionLocked =
    !purchaseStatus.hasPurchased && currentQuestionIndex >= purchaseStatus.freePreviewCount;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Intro Screen */}
      {showIntro && test && (
        <>
          <style>{`
            .intro-outer { max-width: 560px; margin: 0 auto; padding: 60px 20px 80px; position: relative; z-index: 1; text-align: center; }
            .intro-headline { font-family: 'Rajdhani', sans-serif; font-size: clamp(32px, 7vw, 52px); font-weight: 700; color: #0F1C15; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1.05; margin: 0 0 8px; }
            .intro-headline span { background: linear-gradient(90deg, #D4AF37, #B8860B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .intro-sub { font-size: 14px; color: #6b7280; margin: 0 0 36px; line-height: 1.6; font-weight: 500; }
            .intro-card { padding: 40px 36px 36px; }
            .intro-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 1px solid rgba(212,175,55,0.2); border-radius: 14px; overflow: hidden; margin-bottom: 28px; background: rgba(15,28,21,0.03); }
            .intro-cell { padding: 18px 10px; text-align: center; }
            .intro-cell:not(:last-child) { border-right: 1px solid rgba(212,175,55,0.15); }
            .intro-cell-icon { font-size: 12px; font-weight: 700; color: #D4AF37; letter-spacing: 0.2em; text-transform: uppercase; font-family: monospace; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px; }
            .intro-cell-val { font-size: 28px; font-weight: 700; color: #0F1C15; letter-spacing: -0.02em; font-family: 'Rajdhani', sans-serif; }
            .intro-cell-lbl { font-size: 11px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; font-family: monospace; }
            .intro-rules { text-align: left; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
            .intro-rule { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #374151; line-height: 1.5; font-weight: 500; }
            .intro-rule-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
            .intro-rule-dot.g { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
            .intro-rule-dot.r { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }
            .intro-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #0F1C15; border: none; border-radius: 14px; padding: 13px 24px; font-size: 11px; font-weight: 700; color: #fff; cursor: pointer; transition: all 0.15s; font-family: 'Rajdhani', sans-serif; letter-spacing: 0.2em; text-transform: uppercase; box-shadow: 0 4px 16px rgba(15,28,21,0.25); }
            .intro-btn:hover { background: #D4AF37; color: #0F1C15; }
            .intro-secondary-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: transparent; border: 1.5px solid rgba(15,28,21,0.15); border-radius: 14px; padding: 13px 24px; font-size: 11px; font-weight: 700; color: #6b7280; cursor: pointer; transition: all 0.15s; font-family: 'Rajdhani', sans-serif; margin-top: 10px; letter-spacing: 0.2em; text-transform: uppercase; }
            .intro-secondary-btn:hover { background: rgba(15,28,21,0.04); border-color: rgba(15,28,21,0.3); color: #0F1C15; }
            .intro-status-bar { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(212,175,55,0.15); display: flex; align-items: center; justify-content: center; gap: 6px; }
            .intro-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: mt-dot-pulse 1.2s ease-in-out infinite; }
            .intro-status-text { font-size: 9px; font-weight: 700; color: #9ca3af; letter-spacing: 0.2em; text-transform: uppercase; font-family: monospace; }
            @keyframes mt-dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            @media (max-width: 480px) { .intro-card { padding: 26px 18px 22px; } .intro-grid { grid-template-columns: 1fr 1fr; } .intro-cell:nth-child(2) { border-right: none; } .intro-cell:nth-child(3), .intro-cell:nth-child(4) { border-top: 1px solid rgba(212,175,55,0.15); } .intro-cell:nth-child(3) { border-right: 1px solid rgba(212,175,55,0.15); } .intro-outer { padding: 40px 14px 60px; } }
          `}</style>

          <div style={{ background: "#F3F4F6", minHeight: "100vh" }}>
            <div className="intro-outer">
              <div
                style={{
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#D4AF37",
                    display: "inline-block"
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "monospace"
                  }}
                >
                  Assessment Test
                </span>
              </div>

              <h1 className="intro-headline">
                {test.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span>{test.title.split(" ").pop()}</span>
              </h1>
              <p className="intro-sub">Read all instructions carefully before you begin.</p>

              <div
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  border: "1px solid rgba(212,175,55,0.15)"
                }}
                className="intro-card"
              >
                <div className="intro-grid">
                  <div className="intro-cell">
                    <div className="intro-cell-icon">
                      <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <rect
                          x="1"
                          y="1"
                          width="12"
                          height="12"
                          rx="1"
                          stroke="#D4AF37"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M4 7h6M7 4v6"
                          stroke="#D4AF37"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Modules
                    </div>
                    <div className="intro-cell-val">
                      {test.totalQuestions || test.questions?.length || 0}
                    </div>
                    <div className="intro-cell-lbl">Questions</div>
                  </div>
                  <div className="intro-cell">
                    <div className="intro-cell-icon">
                      <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="5.5" stroke="#D4AF37" strokeWidth="1.3" />
                        <path
                          d="M7 4v3l2 2"
                          stroke="#D4AF37"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Timer
                    </div>
                    <div className="intro-cell-val">{test.timeLimitMinutes}</div>
                    <div className="intro-cell-lbl">Minutes</div>
                  </div>
                  <div className="intro-cell">
                    <div className="intro-cell-icon">
                      <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.2l-3.7 2.1.7-4.1-3-2.9 4.2-.7z"
                          stroke="#D4AF37"
                          strokeWidth="1.3"
                        />
                      </svg>
                      Marks
                    </div>
                    <div className="intro-cell-val">
                      {test.totalQuestions || test.questions?.length || 0}
                    </div>
                    <div className="intro-cell-lbl">Full Marks</div>
                  </div>
                  <div className="intro-cell">
                    <div className="intro-cell-icon">
                      <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M2 7l4 4 6-6"
                          stroke="#D4AF37"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Pass
                    </div>
                    <div className="intro-cell-val">{Math.ceil(test.totalQuestions * 0.6)}</div>
                    <div className="intro-cell-lbl">Pass Mark</div>
                  </div>
                </div>

                <div className="intro-rules">
                  <div className="intro-rule">
                    <span className="intro-rule-dot g" />
                    Each correct answer carries <strong>&nbsp;1 mark</strong>
                  </div>
                  <div className="intro-rule">
                    <span className="intro-rule-dot g" />
                    No negative marking for wrong answers
                  </div>
                  <div className="intro-rule">
                    <span className="intro-rule-dot g" />
                    You may submit before {test.timeLimitMinutes} minutes
                  </div>
                  <div className="intro-rule">
                    <span className="intro-rule-dot g" />
                    Navigate freely, change answers anytime
                  </div>
                  <div className="intro-rule">
                    <span className="intro-rule-dot r" />
                    Timer cannot be paused once started
                  </div>
                  <div className="intro-rule">
                    <span className="intro-rule-dot r" />
                    Test auto-submits when time expires
                  </div>
                  {!purchaseStatus.hasPurchased && (
                    <div className="intro-rule">
                      <span className="intro-rule-dot r" />
                      First {purchaseStatus.freePreviewCount} questions are free preview only
                    </div>
                  )}
                </div>

                <button type="button" className="intro-btn" onClick={() => setShowIntro(false)}>
                  Begin Assessment
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="intro-secondary-btn"
                  onClick={() => {
                    setIsNavigatingAway(true);
                    router.push("/");
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2 6.5L7 2l5 4.5V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 13V8.5h3V13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Return to Home
                </button>

                <div className="intro-status-bar">
                  <div className="intro-status-dot" />
                  <span className="intro-status-text">
                    Secured Academy Connection · Free for all
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "11px",
                  color: "#9ca3af",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "monospace"
                }}
              >
                <span>No Negative Marking</span>
                <span
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "#D4AF37"
                  }}
                />
                <span>Colonel's Academy</span>
                <span
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "#D4AF37"
                  }}
                />
                <span>NP_KTM_85.3</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Test Interface */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <h2 className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani'] text-center mb-3">
              Unlock Full Access
            </h2>

            <p className="text-gray-600 text-center mb-6">
              You've completed the free preview ({purchaseStatus.freePreviewCount} questions).
              Purchase this test to continue with all {test.totalQuestions} questions.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-600 text-sm mb-1">Test Price</p>
              <p className="text-3xl font-bold text-[#0F1C15] font-['Rajdhani']">
                Rs. {test.priceNpr?.toLocaleString() || "N/A"}
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setPurchaseStatus({ hasPurchased: true, freePreviewCount: 5 });
                  setShowPurchaseModal(false);
                }}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors uppercase tracking-wider text-sm"
              >
                Unlock All (Mock)
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/mock-test-purchase/${testId}`);
                }}
                className="w-full px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider text-sm"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="w-full px-6 py-3 bg-gray-100 text-[#0F1C15] font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
              >
                Continue Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Question Screen */}
      {isCurrentQuestionLocked && (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md text-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F1C15] mb-3 font-['Rajdhani']">
              Question {currentQuestionIndex + 1} is Locked
            </h2>
            <p className="text-gray-600 mb-8">
              You've completed the free preview ({purchaseStatus.freePreviewCount} questions).
              Purchase this test to unlock all {test.totalQuestions} questions.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setPurchaseStatus({ hasPurchased: true, freePreviewCount: 5 });
                }}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors uppercase tracking-wider text-sm"
              >
                Unlock All (Mock)
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/mock-test-purchase/${testId}`);
                }}
                className="w-full px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider text-sm"
              >
                Unlock Full Test
              </button>
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(purchaseStatus.freePreviewCount - 1)}
                className="w-full px-6 py-3 bg-gray-100 text-[#0F1C15] font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Test Interface */}
      {!showIntro && (
        <>
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
                    {currentQuestion.isImageBased &&
                      currentQuestion.imageUrl && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={currentQuestion.imageUrl}
                            alt={`Question ${currentQuestionIndex + 1} diagram`}
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
                      disabled={
                        submitting ||
                        (!purchaseStatus.hasPurchased && answeredCount < test.totalQuestions)
                      }
                      title={
                        !purchaseStatus.hasPurchased && answeredCount < test.totalQuestions
                          ? "Purchase to submit"
                          : ""
                      }
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
                    {test.questions.map((q, idx) => {
                      const isLocked =
                        !purchaseStatus.hasPurchased && idx >= purchaseStatus.freePreviewCount;
                      const isAnswered = !!answers[q.id];
                      const isCurrent = idx === currentQuestionIndex;

                      return (
                        <button
                          type="button"
                          key={q.id}
                          onClick={() => handleJump(idx)}
                          disabled={isLocked}
                          className={`aspect-square rounded-lg font-bold text-sm transition-all flex items-center justify-center ${
                            isCurrent
                              ? "bg-[#0F1C15] text-white border-2 border-[#D4AF37]"
                              : isLocked
                                ? "bg-red-100 text-red-600 border border-red-300 cursor-not-allowed opacity-70 hover:opacity-85"
                                : isAnswered
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                          title={
                            isLocked
                              ? `Q${idx + 1} - Locked (Purchase to unlock)`
                              : `Q${idx + 1}${isAnswered ? " ✓" : ""}`
                          }
                        >
                          {isLocked ? <Lock className="w-4 h-4" /> : idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#0F1C15]" />
                      Current
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                      Answered
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                      Pending
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                      Locked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Question Screen */}
          {isCurrentQuestionLocked && (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md text-center shadow-lg">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#0F1C15] mb-3 font-['Rajdhani']">
                  Question {currentQuestionIndex + 1} is Locked
                </h2>
                <p className="text-gray-600 mb-8">
                  You've completed the free preview ({purchaseStatus.freePreviewCount} questions).
                  Purchase this test to unlock all {test.totalQuestions} questions.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/mock-test-purchase/${testId}`);
                    }}
                    className="w-full px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors uppercase tracking-wider text-sm"
                  >
                    Unlock Full Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(purchaseStatus.freePreviewCount - 1)}
                    className="w-full px-6 py-3 bg-gray-100 text-[#0F1C15] font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
