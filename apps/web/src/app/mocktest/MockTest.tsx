"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  type MockTestSavedResult,
  clearMyMockScore,
  getMyLatestMockResult,
  submitMockResult
} from "@/services/mockTestService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MockTestIntro from "./MockTestIntro";
import MockTestPrint from "./MockTestPrint";
import MockTestQuestion from "./MockTestQuestion";
import MockTestResult from "./MockTestResult";
import MockTestSavedView from "./MockTestSavedView";
import PurchaseGateModal from "./PurchaseGateModal";

type Phase = "loading" | "intro" | "test" | "submitting" | "result" | "saved-result" | "print";

type ResultSaveStatus = "idle" | "saving" | "failed" | "saved";

interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty?: number;
}

interface BundleQuestionsResponse {
  bundleId: string;
  position: string;
  totalQuestions: number;
  freePreviewCount: number;
  questions: Question[];
}

// Phases where we must NOT interrupt with a server check or redirect
const STABLE_PHASES: Phase[] = ["test", "result", "submitting", "print"];

function calcScore(ans: Record<number, string>, questions: Question[]) {
  let s = 0;
  for (const q of questions) {
    if (ans[q.id] === q.answer) s += 1;
  }
  return s;
}

const PROGRESS_KEY = "mocktest_progress";
const PENDING_RESULT_KEY = "mocktest_pending_result_save";
const CLAIM_AFTER_AUTH_KEY = "mocktest_claim";

function parseClaimPayload(raw: string): PendingResultSave | null {
  try {
    const parsed = JSON.parse(raw) as {
      score?: unknown;
      timeTaken?: unknown;
      answers?: Record<string, unknown>;
    };
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.timeTaken !== "number" ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return null;
    }
    const answers = Object.fromEntries(
      Object.entries(parsed.answers)
        .filter(([key, value]) => Number.isFinite(Number(key)) && typeof value === "string")
        .map(([key, value]) => [Number(key), value])
    ) as Record<number, string>;
    return { score: parsed.score, timeTaken: parsed.timeTaken, answers, userId: "" };
  } catch {
    return null;
  }
}

interface PendingResultSave {
  score: number;
  timeTaken: number;
  answers: Record<number, string>;
  userId: string;
}

function saveProgress(data: {
  answers: Record<number, string>;
  questionIndex: number;
  timeLeft: number;
}) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
}

function loadProgress(): {
  answers: Record<number, string>;
  questionIndex: number;
  timeLeft: number;
} | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.timeLeft === "number" && parsed.timeLeft > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

function savePendingResult(data: PendingResultSave) {
  try {
    localStorage.setItem(PENDING_RESULT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function loadPendingResult(): PendingResultSave | null {
  try {
    const raw = localStorage.getItem(PENDING_RESULT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      score?: unknown;
      timeTaken?: unknown;
      answers?: Record<string, unknown>;
      userId?: unknown;
    };

    if (
      typeof parsed.score !== "number" ||
      typeof parsed.timeTaken !== "number" ||
      typeof parsed.userId !== "string" ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return null;
    }

    const answers = Object.fromEntries(
      Object.entries(parsed.answers)
        .filter(([key, value]) => Number.isFinite(Number(key)) && typeof value === "string")
        .map(([key, value]) => [Number(key), value])
    ) as Record<number, string>;

    return {
      score: parsed.score,
      timeTaken: parsed.timeTaken,
      answers,
      userId: parsed.userId
    };
  } catch {
    return null;
  }
}

function clearPendingResult() {
  try {
    localStorage.removeItem(PENDING_RESULT_KEY);
  } catch {
    /* ignore */
  }
}

export default function MockTest() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [savedResult, setSavedResult] = useState<MockTestSavedResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<ResultSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showPurchaseGate, setShowPurchaseGate] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<{ id: string; title: string; price: number } | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [freePreviewCount, setFreePreviewCount] = useState(5);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [allQuestionsUnlocked, setAllQuestionsUnlocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(answers);
  const justClearedRef = useRef(false);
  answersRef.current = answers;

  // ── Initialize preview mode from URL ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview");
    const purchased = params.get("purchased") === "true";

    // Reset all state when preview changes
    setPhase("loading");
    setQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setTimeTaken(0);
    setSavedResult(null);
    setSaveStatus("idle");
    setSaveError(null);
    setAllQuestionsUnlocked(purchased); // Set to true if purchased
    clearProgress();
    clearPendingResult();

    if (preview) {
      setIsPreview(true);

      // Fetch bundle info and questions from API for all bundles (including IQ)
      const fetchBundleData = async () => {
        setQuestionsLoading(true);
        try {
          console.log("[MockTest] Fetching bundle data for preview:", preview);

          // Fetch bundle info first
          const bundleResponse = await fetch(`/api/mock-test-bundles/${preview}`);
          console.log("[MockTest] Bundle response status:", bundleResponse.status);

          let bundle = null;
          if (bundleResponse.ok) {
            bundle = await bundleResponse.json();
            console.log("[MockTest] Bundle data:", bundle);
            setBundleInfo({
              id: bundle.id,
              title: bundle.title,
              price: bundle.priceNpr
            });
          } else {
            const errorText = await bundleResponse.text();
            console.error("[MockTest] Bundle fetch error:", errorText);
          }

          // Fetch questions for this bundle
          console.log("[MockTest] Fetching questions for bundle:", preview);
          const questionsResponse = await fetch(`/api/mock-test-bundles/${preview}/questions`);
          console.log("[MockTest] Questions response status:", questionsResponse.status);

          if (questionsResponse.ok) {
            const data: BundleQuestionsResponse = await questionsResponse.json();
            console.log("[MockTest] Questions data:", data);
            setQuestions(data.questions);
            setTotalQuestions(data.totalQuestions);
            setFreePreviewCount(data.freePreviewCount);
            setTimeLeft(Math.ceil((data.totalQuestions / 100) * 3600)); // Estimate time
            // Transition to intro phase after questions are loaded
            setPhase("intro");
          } else {
            const errorText = await questionsResponse.text();
            console.error("[MockTest] Questions fetch error:", errorText);
            toast.error("Failed to load test questions");
            setPhase("intro"); // Still go to intro even if questions fail to load
          }
        } catch (err) {
          console.error("[MockTest] Failed to fetch bundle data:", err);
          toast.error("Failed to load test questions");
          setPhase("intro"); // Still go to intro even if questions fail to load
        } finally {
          setQuestionsLoading(false);
        }
      };

      fetchBundleData();
    }
  }, []);

  const persistResult = useCallback(
    async (payload: PendingResultSave, options?: { showSuccessToast?: boolean }) => {
      setSaveStatus("saving");
      setSaveError(null);
      savePendingResult(payload);

      try {
        const result = await submitMockResult({
          score: payload.score,
          totalMarks: totalQuestions,
          timeTaken: payload.timeTaken,
          answers: payload.answers,
          userId: payload.userId
        });
        setSavedResult(result);
        setSaveStatus("saved");
        setSaveError(null);
        clearPendingResult();

        if (options?.showSuccessToast) {
          toast.success("Result saved to your account.");
        }

        return result;
      } catch (err) {
        console.error("Failed to save mock result:", err);
        const message = "We couldn't save your result yet. Your answers are safe on this device.";
        setSaveStatus("failed");
        setSaveError(message);
        toast.error(message, {
          duration: 8000,
          action: {
            label: "Retry",
            onClick: () => {
              void persistResult(payload, { showSuccessToast: true });
            }
          }
        });
        return null;
      }
    },
    [totalQuestions]
  );

  // ── useCallback so handleAutoSubmit is stable for useEffect dep array ────
  const handleAutoSubmit = useCallback(async () => {
    const latestAnswers = answersRef.current;
    const s = calcScore(latestAnswers, questions);
    setScore(s);
    setTimeTaken(totalQuestions > 0 ? Math.ceil((totalQuestions / 100) * 3600) : 0);

    // User is always authenticated at this point
    if (user) {
      await persistResult({
        score: s,
        timeTaken: totalQuestions > 0 ? Math.ceil((totalQuestions / 100) * 3600) : 0,
        answers: latestAnswers,
        userId: user.uid
      });
    }

    clearProgress();
    setPhase("result");
  }, [persistResult, user, questions, totalQuestions]);

  // ── Main init — runs whenever auth state or phase changes ─────────────────
  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      // ── Allow preview mode without login ──────────────────────────────────
      if (!user && !isPreview) {
        if (STABLE_PHASES.includes(phase)) return;
        // Redirect to login if not authenticated and not in preview mode
        router.push(`/login?next=${encodeURIComponent("/mocktest")}`);
        return;
      }

      // ── Skip API check if we just cleared the score ──────────────────────
      if (justClearedRef.current) {
        justClearedRef.current = false;
        return;
      }

      // ── Don't interrupt stable phases ──────────────────────────────────────
      if (STABLE_PHASES.includes(phase)) return;

      // ── Only run init once when phase is loading ──────────────────────────
      if (phase !== "loading") return;

      // ── If in preview mode, skip this init (preview fetch handles it) ─────
      if (isPreview) {
        return;
      }

      // ── If not authenticated and not in preview, redirect to login ────────
      if (!user) {
        router.push(`/login?next=${encodeURIComponent("/mocktest")}`);
        return;
      }

      // ── Claim result after login/signup (guest finished test, then authenticated) ──
      if (user) {
        try {
          const claimRaw = sessionStorage.getItem(CLAIM_AFTER_AUTH_KEY);
          if (claimRaw) {
            const claim = parseClaimPayload(claimRaw);
            sessionStorage.removeItem(CLAIM_AFTER_AUTH_KEY);
            if (claim) {
              setAnswers(claim.answers);
              setScore(claim.score);
              setTimeTaken(claim.timeTaken);
              setSavedResult(null);
              setSaveStatus("idle");
              setSaveError(null);
              setPhase("result");
              // Don't show toast here - let the result page handle it
              await persistResult(
                {
                  score: claim.score,
                  timeTaken: claim.timeTaken,
                  answers: claim.answers,
                  userId: user.uid
                },
                { showSuccessToast: false }
              );
              return;
            }
          }
        } catch {
          try {
            sessionStorage.removeItem(CLAIM_AFTER_AUTH_KEY);
          } catch {
            /* ignore */
          }
        }
      }

      const pending = loadPendingResult();
      if (user && pending && pending.userId === user.uid) {
        setAnswers(pending.answers);
        setScore(pending.score);
        setTimeTaken(pending.timeTaken);
        setSavedResult(null);
        setSaveStatus("failed");
        setSaveError("We still need to save this result to your account.");
        setPhase("result");
        return;
      }

      // ── Check API / Postgres for saved result ─────────────────────────────
      if (user) {
        try {
          const result = await getMyLatestMockResult(user.uid);
          if (result) {
            setSavedResult(result);
            setSaveStatus("saved");
            setSaveError(null);
            setPhase("saved-result");
          } else {
            setSaveStatus("idle");
            setSaveError(null);
            setPhase("intro");
          }
        } catch {
          setSaveStatus("idle");
          setSaveError(null);
          setPhase("intro");
        }
      } else {
        // Guest/preview mode - go to intro
        setSaveStatus("idle");
        setSaveError(null);
        setPhase("intro");
      }
    };

    init();
  }, [user, authLoading, phase, persistResult, router, isPreview]);

  // ── Hide navbar & warn before leaving during active test ─────────────────
  useEffect(() => {
    if (phase !== "test") return;
    document.body.classList.add("mocktest-active");
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      document.body.classList.remove("mocktest-active");
      window.removeEventListener("beforeunload", handler);
    };
  }, [phase]);

  // ── Auto-save progress to localStorage every time answers/time change ──
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;
    saveProgress({ answers, questionIndex, timeLeft });
  }, [answers, questionIndex, timeLeft, phase]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, handleAutoSubmit]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAnswer = (letter: string) => {
    const q = questions[questionIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: letter }));
  };
  const handleNext = () => {
    // In preview mode, limit to freePreviewCount questions unless unlocked
    const maxQuestionIndex =
      isPreview && !allQuestionsUnlocked ? freePreviewCount - 1 : totalQuestions - 1;

    if (questionIndex < maxQuestionIndex) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
    } else if (
      isPreview &&
      !allQuestionsUnlocked &&
      questionIndex === freePreviewCount - 1 &&
      bundleInfo
    ) {
      // Show purchase gate when trying to go beyond free preview in preview mode
      setShowPurchaseGate(true);
    }
  };
  const handlePrev = () => {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
  };
  const handleJump = (index: number) => setQuestionIndex(index);

  const handleRequestSubmit = () => {
    // In preview mode, require all questions to be unlocked before submitting
    if (isPreview && !allQuestionsUnlocked) {
      setShowPurchaseGate(true);
      return;
    }

    const unanswered = totalQuestions - Object.keys(answers).length;
    if (unanswered > 0) {
      const ok = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""} out of ${totalQuestions}.\n\nSubmit anyway?`
      );
      if (!ok) return;
    }
    stopTimer();
    const elapsed = timeLeft > 0 ? Math.ceil((totalQuestions / 100) * 3600) - timeLeft : 0;
    setTimeTaken(elapsed);
    handleDirectSubmit(elapsed);
  };

  // Submit — persists via API for authenticated users only
  const handleDirectSubmit = async (elapsed: number) => {
    setPhase("submitting");
    const s = calcScore(answers, questions);
    setScore(s);

    // User is always authenticated at this point
    if (user) {
      await persistResult({
        score: s,
        timeTaken: elapsed,
        answers,
        userId: user.uid
      });
    }
    clearProgress();
    setPhase("result");
  };

  const handleRetrySave = () => {
    if (!user) {
      // This should never happen since login is required
      router.push(`/login?next=${encodeURIComponent("/mocktest")}`);
      return;
    }

    const pending = loadPendingResult();
    const payload =
      pending && pending.userId === user.uid
        ? pending
        : { score, timeTaken, answers, userId: user.uid };

    void persistResult(payload, { showSuccessToast: true });
  };

  const handleExitToHome = () => {
    const shouldLeave = window.confirm(
      "Leave the assessment and return to the home page? Your current progress will stay saved on this device."
    );
    if (!shouldLeave) return;
    stopTimer();
    router.push("/");
  };

  const handleRetake = () => {
    clearProgress();
    clearPendingResult();
    setAnswers({});
    setTimeLeft(totalQuestions > 0 ? Math.ceil((totalQuestions / 100) * 3600) : 3600);
    setScore(0);
    setTimeTaken(0);
    setQuestionIndex(0);
    setSavedResult(null);
    setSaveStatus("idle");
    setSaveError(null);
    setPhase("intro");
  };

  const handleClearScore = async () => {
    if (!savedResult?._id) return;
    setClearLoading(true);
    try {
      await clearMyMockScore(savedResult._id);
      clearPendingResult();
      setSavedResult(null);
      setAnswers({});
      setTimeLeft(totalQuestions > 0 ? Math.ceil((totalQuestions / 100) * 3600) : 3600);
      setScore(0);
      setTimeTaken(0);
      setQuestionIndex(0);
      setSaveStatus("idle");
      setSaveError(null);
      justClearedRef.current = true;
      setPhase("intro");
    } catch (err) {
      console.error("Failed to clear score:", err);
      toast.error("Could not clear score. Please try again.");
    } finally {
      setClearLoading(false);
    }
  };

  // ── Spinner ───────────────────────────────────────────────────────────────
  const Spinner = ({ msg }: { msg: string }) => (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16
      }}
    >
      <style>{"@keyframes sp { to { transform: rotate(360deg); } }"}</style>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(212,175,55,0.15)",
          borderTopColor: "#D4AF37",
          animation: "sp 0.8s linear infinite"
        }}
      />
      <p
        style={{
          fontSize: 11,
          color: "#9ca3af",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase"
        }}
      >
        {msg}
      </p>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === "loading" || authLoading) return <Spinner msg="Loading…" />;

  if (phase === "print") return <MockTestPrint onClose={() => setPhase("intro")} />;

  if (phase === "saved-result" && savedResult)
    return (
      <MockTestSavedView
        savedResult={savedResult}
        clearLoading={clearLoading}
        testTitle={bundleInfo?.title || "Mock Test"}
        onGoHome={() => router.push("/")}
        onClearAndRetake={handleClearScore}
      />
    );

  if (phase === "intro")
    return (
      <MockTestIntro
        isLoggedIn={true}
        onGoHome={() => {
          // Always go to home page when clicking back from intro
          // This is the safest approach to avoid page reload issues
          router.push("/");
        }}
        onStart={() => {
          const saved = loadProgress();
          if (saved) {
            setAnswers(saved.answers);
            setQuestionIndex(saved.questionIndex);
            setTimeLeft(saved.timeLeft);
          } else {
            setAnswers({});
            setQuestionIndex(0);
            setTimeLeft(totalQuestions > 0 ? Math.ceil((totalQuestions / 100) * 3600) : 3600);
          }
          setSaveStatus("idle");
          setSaveError(null);
          setPhase("test");
        }}
        onPrint={() => setPhase("print")}
        testTitle={bundleInfo?.title || "Cadet IQ Test"}
        totalQuestions={totalQuestions}
        timeLimitMinutes={Math.ceil((totalQuestions / 100) * 60) || 30}
        fullMarks={totalQuestions}
        passMarks={Math.ceil(totalQuestions * 0.4)}
      />
    );

  if (phase === "test") {
    if (questionsLoading) return <Spinner msg="Loading questions…" />;
    if (questions.length === 0) return <Spinner msg="No questions available…" />;

    const current = questions[questionIndex];
    if (!current) return <Spinner msg="Loading question…" />;

    const isLocked = !allQuestionsUnlocked && questionIndex >= freePreviewCount;

    return (
      <>
        {showPurchaseGate && bundleInfo && (
          <PurchaseGateModal
            bundleId={bundleInfo.id}
            bundleTitle={bundleInfo.title}
            price={bundleInfo.price}
            onClose={() => setShowPurchaseGate(false)}
            onUnlockMock={() => setAllQuestionsUnlocked(true)}
          />
        )}
        {!isLocked && (
          <MockTestQuestion
            key={current.id}
            question={current}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            freePreviewCount={freePreviewCount}
            allQuestionsUnlocked={allQuestionsUnlocked}
            selectedAnswer={answers[current.id]}
            answeredCount={Object.keys(answers).length}
            timeLeft={timeLeft}
            timerUrgent={timeLeft <= 300}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            onJump={handleJump}
            onSubmit={handleRequestSubmit}
            onExit={handleExitToHome}
            onLockedQuestionClick={() => setShowPurchaseGate(true)}
            answers={answers}
          />
        )}
        {isLocked && (
          <div
            style={{
              minHeight: "100vh",
              background: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 24,
              padding: 20
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40
              }}
            >
              🔒
            </div>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0F1C15",
                  marginBottom: 12,
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                Question {questionIndex + 1} is Locked
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  lineHeight: 1.6,
                  marginBottom: 24
                }}
              >
                You've completed the free preview ({freePreviewCount} questions). Purchase this test
                to unlock all {totalQuestions} questions.
              </p>
              <button
                type="button"
                onClick={() => setShowPurchaseGate(true)}
                style={{
                  background: "#D4AF37",
                  color: "#0F1C15",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                Unlock Full Test
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (phase === "submitting") return <Spinner msg="Saving your result…" />;

  if (phase === "result")
    return (
      <MockTestResult
        score={score}
        timeTaken={timeTaken}
        answers={answers}
        questions={questions}
        isLoggedIn={!!user}
        saveStatus={saveStatus}
        saveError={saveError}
        onGoHome={() => router.push("/")}
        onRetake={handleRetake}
        onSaveAndLogin={handleRetrySave}
        onRetrySave={handleRetrySave}
      />
    );

  return null;
}
