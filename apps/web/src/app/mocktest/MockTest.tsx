"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { questions, TOTAL_QUESTIONS, TOTAL_TIME_SECONDS, FULL_MARKS } from "@/data/mockQuestions"
import {
  submitMockResult,
  getMyLatestMockResult,
  clearMyMockScore,
  type MockTestSavedResult,
} from "@/services/mockTestService"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import MockTestIntro from "./MockTestIntro"
import MockTestQuestion from "./MockTestQuestion"
import MockTestResult from "./MockTestResult"
import MockTestSavedView from "./MockTestSavedView"
import MockTestPrint from "./MockTestPrint"

type Phase =
  | "loading"
  | "intro"
  | "test"
  | "submitting"
  | "result"
  | "saved-result"
  | "print"

type ResultSaveStatus = "idle" | "saving" | "failed" | "saved"

// Phases where we must NOT interrupt with a server check or redirect
const STABLE_PHASES: Phase[] = ["test", "result", "submitting", "print"]

function calcScore(ans: Record<number, string>) {
  let s = 0
  for (const q of questions) { if (ans[q.id] === q.answer) s += 1 }
  return s
}

const PROGRESS_KEY = "mocktest_progress"
const PENDING_RESULT_KEY = "mocktest_pending_result_save"
const CLAIM_AFTER_AUTH_KEY = "mocktest_claim"

function parseClaimPayload(raw: string): PendingResultSave | null {
  try {
    const parsed = JSON.parse(raw) as {
      score?: unknown
      timeTaken?: unknown
      answers?: Record<string, unknown>
    }
    if (typeof parsed.score !== "number" || typeof parsed.timeTaken !== "number" || !parsed.answers || typeof parsed.answers !== "object") {
      return null
    }
    const answers = Object.fromEntries(
      Object.entries(parsed.answers)
        .filter(([key, value]) => Number.isFinite(Number(key)) && typeof value === "string")
        .map(([key, value]) => [Number(key), value])
    ) as Record<number, string>
    return { score: parsed.score, timeTaken: parsed.timeTaken, answers, userId: "" }
  } catch {
    return null
  }
}

interface PendingResultSave {
  score: number
  timeTaken: number
  answers: Record<number, string>
  userId: string
}

function saveProgress(data: { answers: Record<number, string>; questionIndex: number; timeLeft: number }) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)) } catch { /* quota exceeded — ignore */ }
}

function loadProgress(): { answers: Record<number, string>; questionIndex: number; timeLeft: number } | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.timeLeft === "number" && parsed.timeLeft > 0) return parsed
    return null
  } catch { return null }
}

function clearProgress() {
  try { localStorage.removeItem(PROGRESS_KEY) } catch { /* ignore */ }
}

function savePendingResult(data: PendingResultSave) {
  try { localStorage.setItem(PENDING_RESULT_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

function loadPendingResult(): PendingResultSave | null {
  try {
    const raw = localStorage.getItem(PENDING_RESULT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      score?: unknown
      timeTaken?: unknown
      answers?: Record<string, unknown>
      userId?: unknown
    }

    if (
      typeof parsed.score !== "number"
      || typeof parsed.timeTaken !== "number"
      || typeof parsed.userId !== "string"
      || !parsed.answers
      || typeof parsed.answers !== "object"
    ) {
      return null
    }

    const answers = Object.fromEntries(
      Object.entries(parsed.answers)
        .filter(([key, value]) => Number.isFinite(Number(key)) && typeof value === "string")
        .map(([key, value]) => [Number(key), value])
    ) as Record<number, string>

    return {
      score: parsed.score,
      timeTaken: parsed.timeTaken,
      answers,
      userId: parsed.userId,
    }
  } catch {
    return null
  }
}

function clearPendingResult() {
  try { localStorage.removeItem(PENDING_RESULT_KEY) } catch { /* ignore */ }
}

export default function MockTest() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [phase, setPhase] = useState<Phase>("loading")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS)
  const [score, setScore] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const [savedResult, setSavedResult] = useState<MockTestSavedResult | null>(null)
  const [saveStatus, setSaveStatus] = useState<ResultSaveStatus>("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [clearLoading, setClearLoading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const persistResult = useCallback(async (
    payload: PendingResultSave,
    options?: { showSuccessToast?: boolean }
  ) => {
    setSaveStatus("saving")
    setSaveError(null)
    savePendingResult(payload)

    try {
      const result = await submitMockResult({
        score: payload.score,
        totalMarks: FULL_MARKS,
        timeTaken: payload.timeTaken,
        answers: payload.answers,
        userId: payload.userId,
      })
      setSavedResult(result)
      setSaveStatus("saved")
      setSaveError(null)
      clearPendingResult()

      if (options?.showSuccessToast) {
        toast.success("Result saved to your account.")
      }

      return result
    } catch (err) {
      console.error("Failed to save mock result:", err)
      const message = "We couldn't save your result yet. Your answers are safe on this device."
      setSaveStatus("failed")
      setSaveError(message)
      toast.error(message, {
        duration: 8000,
        action: {
          label: "Retry",
          onClick: () => { void persistResult(payload, { showSuccessToast: true }) },
        },
      })
      return null
    }
  }, [])

  // ── useCallback so handleAutoSubmit is stable for useEffect dep array ────
  const handleAutoSubmit = useCallback(async () => {
    const latestAnswers = answersRef.current
    const s = calcScore(latestAnswers)
    setScore(s)
    setTimeTaken(TOTAL_TIME_SECONDS)

    if (user) {
      await persistResult({
        score: s,
        timeTaken: TOTAL_TIME_SECONDS,
        answers: latestAnswers,
        userId: user.uid,
      })
    } else {
      setSaveStatus("idle")
      setSaveError(null)
    }

    // Guest: result stays in React state only until they sign in (API requires a session).
    // They can authenticate from the result page; init() then saves via the API.
    clearProgress()
    setPhase("result")
  }, [persistResult, user])

  // ── Main init — runs whenever auth state or phase changes ─────────────────
  useEffect(() => {
    if (authLoading) return

    const init = async () => {
      // ── Guest ─────────────────────────────────────────────────────────────
      if (!user) {
        if (STABLE_PHASES.includes(phase)) return
        setPhase("intro")
        return
      }

      // ── Claim result after login/signup (guest finished test, then authenticated) ──
      try {
        const claimRaw = sessionStorage.getItem(CLAIM_AFTER_AUTH_KEY)
        if (claimRaw) {
          const claim = parseClaimPayload(claimRaw)
          sessionStorage.removeItem(CLAIM_AFTER_AUTH_KEY)
          if (claim) {
            setAnswers(claim.answers)
            setScore(claim.score)
            setTimeTaken(claim.timeTaken)
            setSavedResult(null)
            setSaveStatus("idle")
            setSaveError(null)
            setPhase("result")
            await persistResult(
              { score: claim.score, timeTaken: claim.timeTaken, answers: claim.answers, userId: user.uid },
              { showSuccessToast: true }
            )
            return
          }
        }
      } catch {
        try { sessionStorage.removeItem(CLAIM_AFTER_AUTH_KEY) } catch { /* ignore */ }
      }

      // ── Logged-in — don't interrupt active/stable phases ──────────────────
      if (STABLE_PHASES.includes(phase)) return

      const pending = loadPendingResult()
      if (pending && pending.userId === user.uid) {
        setAnswers(pending.answers)
        setScore(pending.score)
        setTimeTaken(pending.timeTaken)
        setSavedResult(null)
        setSaveStatus("failed")
        setSaveError("We still need to save this result to your account.")
        setPhase("result")
        return
      }

      // ── Check API / Postgres for saved result ─────────────────────────────
      try {
        const result = await getMyLatestMockResult(user.uid)
        if (result) {
          setSavedResult(result)
          setSaveStatus("saved")
          setSaveError(null)
          setPhase("saved-result")
        } else {
          setSaveStatus("idle")
          setSaveError(null)
          setPhase("intro")
        }
      } catch {
        setSaveStatus("idle")
        setSaveError(null)
        setPhase("intro")
      }
    }

    init()
  }, [user, authLoading, phase])

  // ── Hide navbar & warn before leaving during active test ─────────────────
  useEffect(() => {
    if (phase !== "test") return
    document.body.classList.add("mocktest-active")
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", handler)
    return () => {
      document.body.classList.remove("mocktest-active")
      window.removeEventListener("beforeunload", handler)
    }
  }, [phase])

  // ── Auto-save progress to localStorage every time answers/time change ──
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return
    saveProgress({ answers, questionIndex, timeLeft })
  }, [answers, questionIndex, timeLeft, phase])

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "test") return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, handleAutoSubmit])

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAnswer = (letter: string) => {
    const q = questions[questionIndex]
    if (!q) return
    setAnswers(prev => ({ ...prev, [q.id]: letter }))
  }
  const handleNext = () => {
    if (questionIndex < TOTAL_QUESTIONS - 1) setQuestionIndex(i => i + 1)
  }
  const handlePrev = () => {
    if (questionIndex > 0) setQuestionIndex(i => i - 1)
  }
  const handleJump = (index: number) => setQuestionIndex(index)

  const handleRequestSubmit = () => {
    const unanswered = TOTAL_QUESTIONS - Object.keys(answers).length
    if (unanswered > 0) {
      const ok = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""} out of ${TOTAL_QUESTIONS}.\n\nSubmit anyway?`
      )
      if (!ok) return
    }
    stopTimer()
    const elapsed = TOTAL_TIME_SECONDS - timeLeft
    setTimeTaken(elapsed)
    handleDirectSubmit(elapsed)
  }

  // Submit — persists via API only for authenticated users.
  // Guests see their result from React state; after sign-in, handleSaveAndLogin + init() persist.
  const handleDirectSubmit = async (elapsed: number) => {
    setPhase("submitting")
    const s = calcScore(answers)
    setScore(s)

    if (user) {
      await persistResult({
        score: s,
        timeTaken: elapsed,
        answers,
        userId: user.uid,
      })
    } else {
      setSaveStatus("idle")
      setSaveError(null)
    }
    clearProgress()
    setPhase("result")
  }

  // Guest: persist claim in sessionStorage, then send them to auth; init() saves after session exists.
  const handleSaveAndLogin = () => {
    try {
      sessionStorage.setItem(
        CLAIM_AFTER_AUTH_KEY,
        JSON.stringify({ score, timeTaken, answers })
      )
    } catch { /* ignore */ }
    router.push(`/login?next=${encodeURIComponent("/mocktest")}`)
  }

  const handleRetrySave = () => {
    if (!user) {
      handleSaveAndLogin()
      return
    }

    const pending = loadPendingResult()
    const payload = pending && pending.userId === user.uid
      ? pending
      : { score, timeTaken, answers, userId: user.uid }

    void persistResult(payload, { showSuccessToast: true })
  }

  const handleExitToHome = () => {
    const shouldLeave = window.confirm(
      "Leave the assessment and return to the home page? Your current progress will stay saved on this device."
    )
    if (!shouldLeave) return
    stopTimer()
    router.push("/")
  }

  const handleRetake = () => {
    clearProgress()
    clearPendingResult()
    setAnswers({}); setTimeLeft(TOTAL_TIME_SECONDS); setScore(0)
    setTimeTaken(0); setQuestionIndex(0); setSavedResult(null)
    setSaveStatus("idle"); setSaveError(null)
    setPhase("intro")
  }

  const handleClearScore = async () => {
    if (!savedResult?._id) return
    setClearLoading(true)
    try {
      await clearMyMockScore(savedResult._id)
      clearPendingResult()
      setSavedResult(null)
      setAnswers({}); setTimeLeft(TOTAL_TIME_SECONDS); setScore(0)
      setTimeTaken(0); setQuestionIndex(0)
      setSaveStatus("idle"); setSaveError(null)
      setPhase("intro")
    } catch (err) {
      console.error("Failed to clear score:", err)
      toast.error("Could not clear score. Please try again.")
    } finally { setClearLoading(false) }
  }

  // ── Spinner ───────────────────────────────────────────────────────────────
  const Spinner = ({ msg }: { msg: string }) => (
    <div style={{
      minHeight: "100vh", background: "#F3F4F6",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <style>{`@keyframes sp { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid rgba(212,175,55,0.15)",
        borderTopColor: "#D4AF37",
        animation: "sp 0.8s linear infinite",
      }} />
      <p style={{
        fontSize: 11, color: "#9ca3af", fontFamily: "monospace",
        fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
      }}>{msg}</p>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === "loading" || authLoading) return <Spinner msg="Loading…" />

  if (phase === "print") return (
    <MockTestPrint onClose={() => setPhase("intro")} />
  )

  if (phase === "saved-result" && savedResult) return (
    <MockTestSavedView
      savedResult={savedResult}
      clearLoading={clearLoading}
      onGoHome={() => router.push("/")}
      onClearAndRetake={handleClearScore}
    />
  )

  if (phase === "intro") return (
    <MockTestIntro
      isLoggedIn={!!user}
      onGoHome={() => router.push("/")}
      onStart={() => {
        const saved = loadProgress()
        if (saved) {
          setAnswers(saved.answers)
          setQuestionIndex(saved.questionIndex)
          setTimeLeft(saved.timeLeft)
        } else {
          setAnswers({})
          setQuestionIndex(0)
          setTimeLeft(TOTAL_TIME_SECONDS)
        }
        setSaveStatus("idle")
        setSaveError(null)
        setPhase("test")
      }}
      onPrint={() => setPhase("print")}
    />
  )

  if (phase === "test") {
    const current = questions[questionIndex]
    if (!current) return <Spinner msg="Loading question…" />
    return (
    <MockTestQuestion
      key={current.id}
      question={current}
      questionIndex={questionIndex}
      totalQuestions={TOTAL_QUESTIONS}
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
      answers={answers}
    />
    )
  }

  if (phase === "submitting") return <Spinner msg="Saving your result…" />

  if (phase === "result") return (
    <MockTestResult
      score={score}
      timeTaken={timeTaken}
      answers={answers}
      isLoggedIn={!!user}
      saveStatus={saveStatus}
      saveError={saveError}
      onGoHome={() => router.push("/")}
      onRetake={handleRetake}
      onSaveAndLogin={handleSaveAndLogin}
      onRetrySave={handleRetrySave}
    />
  )

  return null
}
