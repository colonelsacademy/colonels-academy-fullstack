import { FULL_MARKS, PASS_MARK_SCORE, optionLetters, questions } from "@/data/mockQuestions";
import { mockTestBaseCSS } from "@/data/mockTestTheme";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  score: number;
  timeTaken: number;
  answers: Record<number, string>;
  isLoggedIn: boolean;
  saveStatus: "idle" | "saving" | "failed" | "saved";
  saveError: string | null;
  onGoHome: () => void;
  onRetake: () => void;
  onSaveAndLogin: () => void;
  onRetrySave: () => void;
}

export default function MockTestResult({
  score,
  timeTaken,
  answers,
  isLoggedIn,
  saveStatus,
  saveError,
  onGoHome,
  onRetake,
  onSaveAndLogin,
  onRetrySave
}: Props) {
  const router = useRouter();
  const [showReport, setShowReport] = useState(false);
  const iqReportEnabled = process.env.NEXT_PUBLIC_IQ_REPORT_ENABLED !== "false";

  const passed = score >= PASS_MARK_SCORE;
  const pct = Math.round((score / FULL_MARKS) * 100);
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const wrong = Object.values(answers).length - correct;
  const unanswered = questions.length - Object.values(answers).length;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const showSaveRecovery = isLoggedIn && (saveStatus === "saving" || saveStatus === "failed");

  return (
    <>
      <style>{`
        ${mockTestBaseCSS}

        .res-outer { max-width: 760px; margin: 0 auto; padding: 48px 16px 80px; position: relative; z-index: 1; }

        .res-hero { padding: 48px 40px 40px; text-align: center; margin-bottom: 14px; position: relative; overflow: hidden; }

        /* Gold glow decoration */
        .res-glow {
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(212,175,55,0.06); filter: blur(40px);
          pointer-events: none;
        }

        /* Animated score ring */
        .res-ring-wrap { position: relative; width: 160px; height: 160px; margin: 0 auto 24px; }
        .res-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .res-ring-track { stroke: rgba(212,175,55,0.1); stroke-width: 6; fill: none; }
        .res-ring-fill {
          fill: none; stroke-width: 8; stroke-linecap: round;
          stroke: ${passed ? "#D4AF37" : "#ef4444"};
          stroke-dasharray: ${pct * 4.4} 440;
          animation: res-draw 1.8s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes res-draw { from { stroke-dasharray: 0 440; } }
        .res-ring-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .res-pct {
          font-size: 44px; font-weight: 700; line-height: 1;
          color: #0F1C15; font-family: 'Rajdhani', sans-serif;
        }
        .res-pct-label {
          font-size: 8px; font-weight: 700; color: #D4AF37;
          letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace;
          margin-top: 2px;
        }

        .res-headline {
          font-size: clamp(22px, 5vw, 34px); font-weight: 700;
          color: #0F1C15; font-family: 'Rajdhani', sans-serif;
          text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;
        }
        .res-msg { font-size: 13px; color: #6b7280; line-height: 1.7; margin: 0 0 28px; max-width: 440px; margin-left: auto; margin-right: auto; }

        /* Candidate ID */
        .res-candidate-id {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(15,28,21,0.05); border: 1px solid rgba(15,28,21,0.1);
          border-radius: 6px; padding: 4px 12px; margin-bottom: 22px;
          font-size: 11px; font-weight: 700; color: #374151; font-family: monospace; letter-spacing: 0.1em;
        }

        /* Stats row */
        .res-stats { display: flex; border: 1px solid rgba(212,175,55,0.15); border-radius: 16px; overflow: hidden; margin-bottom: 28px; background: rgba(243,244,246,0.5); }
        .res-stat { flex: 1; padding: 18px 8px; text-align: center; }
        .res-stat + .res-stat { border-left: 1px solid rgba(212,175,55,0.12); }
        .res-stat-val { font-size: 22px; font-weight: 700; color: #0F1C15; letter-spacing: -0.02em; font-family: 'Rajdhani', sans-serif; }
        .res-stat-val.g { color: #16a34a; }
        .res-stat-val.r { color: #ef4444; }
        .res-stat-val.a { color: #D4AF37; }
        .res-stat-val.b { color: ${passed ? "#D4AF37" : "#ef4444"}; }
        .res-stat-lbl { font-size: 8px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 4px; font-family: monospace; }

        /* Verdict cards — 2 col layout */
        .res-verdict-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
        .res-verdict-card { padding: 22px; background: rgba(243,244,246,0.7); border-radius: 20px; text-align: left; border: 1px solid rgba(212,175,55,0.15); }
        .res-verdict-card-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .res-verdict-icon { color: #D4AF37; }
        .res-verdict-label { font-size: 8px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.2em; font-family: monospace; }
        .res-verdict-text { font-size: 13px; color: #374151; font-weight: 600; line-height: 1.6; font-style: italic; }

        /* Guest save banner */
        .res-save-banner {
          background: rgba(212,175,55,0.06);
          border: 1.5px solid rgba(212,175,55,0.25);
          border-radius: 16px; padding: 22px 24px; margin-bottom: 16px;
        }
        .res-save-inner { display: flex; align-items: flex-start; gap: 14px; }
        .res-save-emoji { font-size: 32px; flex-shrink: 0; }
        .res-save-text-wrap { flex: 1; }
        .res-save-title { font-size: 16px; font-weight: 700; color: #0F1C15; margin-bottom: 5px; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        .res-save-sub { font-size: 12px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
        .res-save-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .res-save-login {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0F1C15; color: #fff; border: none; border-radius: 12px;
          padding: 10px 20px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
        }
        .res-save-login:hover { background: #D4AF37; color: #0F1C15; }
        .res-save-login[disabled] { opacity: 0.65; cursor: wait; }

        .res-save-status {
          border-radius: 16px; padding: 22px 24px; margin-bottom: 16px;
          border: 1.5px solid rgba(15,28,21,0.12); background: rgba(15,28,21,0.04);
        }
        .res-save-status.failed {
          background: rgba(239,68,68,0.04);
          border-color: rgba(239,68,68,0.18);
        }
        .res-save-status.saving {
          background: rgba(212,175,55,0.06);
          border-color: rgba(212,175,55,0.25);
        }

        /* Enroll CTA */
        .res-enroll {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0F1C15;
          border: none; border-radius: 14px; padding: 16px 24px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
          box-shadow: 0 4px 20px rgba(212,175,55,0.35);
        }
        .res-enroll:hover { filter: brightness(1.1); box-shadow: 0 6px 28px rgba(212,175,55,0.45); transform: translateY(-1px); }

        /* Action buttons */
        .res-actions { display: flex; flex-column: column; gap: 10px; margin-bottom: 20px; }
        .res-retake {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; background: #0F1C15; color: #fff; border: none; border-radius: 14px;
          padding: 15px 24px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
          box-shadow: 0 4px 16px rgba(15,28,21,0.25);
        }
        .res-retake:hover { background: #D4AF37; color: #0F1C15; }
        .res-report-toggle {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; background: transparent;
          border: 1.5px solid rgba(15,28,21,0.12); border-radius: 14px;
          padding: 13px 24px; font-size: 11px; font-weight: 700; color: #6b7280;
          cursor: pointer; transition: all 0.15s; font-family: 'Rajdhani', sans-serif;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .res-report-toggle:hover { background: rgba(15,28,21,0.04); color: #0F1C15; }

        /* Answer report */
        .res-report { background: rgba(255,255,255,0.8); border: 1px solid rgba(212,175,55,0.15); border-radius: 18px; overflow: hidden; }
        .res-report-hdr { padding: 14px 22px; border-bottom: 1px solid rgba(212,175,55,0.12); background: rgba(243,244,246,0.8); display: flex; align-items: center; justify-content: space-between; }
        .res-report-hdr-title { font-size: 9px; font-weight: 700; color: #374151; letter-spacing: 0.18em; text-transform: uppercase; font-family: monospace; }
        .res-report-row { padding: 16px 22px; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .res-report-row:last-child { border-bottom: none; }
        .res-row-num { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: #9ca3af; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; font-family: monospace; }
        .res-row-icon { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; }
        .res-row-icon.c { background: rgba(34,197,94,0.12); color: #16a34a; }
        .res-row-icon.w { background: rgba(239,68,68,0.1); color: #ef4444; }
        .res-row-icon.u { background: rgba(0,0,0,0.05); color: #9ca3af; }
        .res-row-pts { margin-left: auto; font-size: 10px; font-weight: 700; font-family: monospace; }
        .res-row-pts.c { color: #16a34a; }
        .res-row-pts.w { color: #ef4444; }
        .res-row-qtext { font-size: 13px; font-weight: 600; color: #0F1C15; margin-bottom: 8px; line-height: 1.5; }
        .res-row-pills { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 6px; }
        .res-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .res-pill.correct { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #15803d; }
        .res-pill.wrong { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; }
        .res-pill.skip { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #9ca3af; }
        .res-explain { font-size: 12px; color: #6b7280; line-height: 1.6; padding: 8px 12px; background: rgba(212,175,55,0.04); border-radius: 8px; border-left: 3px solid rgba(212,175,55,0.3); }

        .res-report-locked { padding: 44px 24px; text-align: center; }
        .res-locked-icon { font-size: 40px; margin-bottom: 14px; }
        .res-locked-title { font-size: 20px; font-weight: 700; color: #0F1C15; margin-bottom: 6px; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; }
        .res-locked-sub { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 22px; }

        @media (max-width: 600px) {
          .res-outer { padding: 32px 12px 60px; }
          .res-hero { padding: 28px 20px 24px; }
          .res-save-inner { flex-direction: column; gap: 10px; }
          .res-stats { flex-wrap: wrap; }
          .res-stat { flex: 1 1 30%; }
          .res-verdict-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mt-page">
        <div className="mt-corner-tl" />
        <div className="mt-corner-br" />

        <div className="mt-hud-decal">
          <div>
            SCORE: {score}/{FULL_MARKS}
          </div>
          <div>STATUS: {passed ? "PASS" : "FAIL"}</div>
          <div className="mt-hud-gold">{passed ? "MISSION COMPLETE" : "RETRY RECOMMENDED"}</div>
        </div>

        <div className="res-outer">
          <div className="mt-card res-hero">
            <div className="res-glow" />

            <div className="mt-eyebrow" style={{ justifyContent: "center" }}>
              <span className="mt-eyebrow-dot" />
              <span className="mt-eyebrow-text">Deployment Report Finalized</span>
            </div>

            {/* Animated score ring */}
            <div className="res-ring-wrap">
              <svg className="res-ring-svg" viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="70" className="res-ring-track" />
                <circle cx="80" cy="80" r="70" className="res-ring-fill" />
              </svg>
              <div className="res-ring-inner">
                <div className="res-pct">{pct}%</div>
                <div className="res-pct-label">Efficiency</div>
              </div>
            </div>

            <h2 className="res-headline">
              {passed ? "Mission Accomplished" : "Continue Training"}
            </h2>
            <p className="res-msg">
              {passed
                ? `Outstanding cognitive performance. You scored ${score}/${FULL_MARKS} — demonstrating superior aptitude for officer selection.`
                : `You scored ${score}/${FULL_MARKS}. Pass mark: ${PASS_MARK_SCORE}. Every engagement sharpens your capability. Review and retry.`}
            </p>

            <div className="res-stats">
              <div className="res-stat">
                <div className="res-stat-val g">{correct}</div>
                <div className="res-stat-lbl">Correct</div>
              </div>
              <div className="res-stat">
                <div className="res-stat-val r">{wrong}</div>
                <div className="res-stat-lbl">Wrong</div>
              </div>
              <div className="res-stat">
                <div className="res-stat-val a">{unanswered}</div>
                <div className="res-stat-lbl">Skipped</div>
              </div>
              <div className="res-stat">
                <div className="res-stat-val">
                  {mins}m {secs}s
                </div>
                <div className="res-stat-lbl">Time</div>
              </div>
              <div className="res-stat">
                <div className="res-stat-val b">
                  {score}/{FULL_MARKS}
                </div>
                <div className="res-stat-lbl">Score</div>
              </div>
            </div>

            {/* Verdict cards */}
            <div className="res-verdict-grid">
              <div className="res-verdict-card">
                <div className="res-verdict-card-hdr">
                  <svg
                    className="res-verdict-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="res-verdict-label">Command Verdict</span>
                </div>
                <p className="res-verdict-text">
                  "
                  {passed
                    ? "Outstanding cognitive agility. Candidate shows superior reasoning and rapid processing capabilities."
                    : "Satisfactory engagement. Performance indicates strong potential — optimization required in cross-analysis."}
                  "
                </p>
              </div>
              <div className="res-verdict-card">
                <div className="res-verdict-card-hdr">
                  <svg
                    className="res-verdict-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="res-verdict-label">Mission Orders</span>
                </div>
                <p className="res-verdict-text" style={{ fontStyle: "normal", color: "#6b7280" }}>
                  To maximize selection probability, candidate is recommended for the{" "}
                  <strong style={{ color: "#0F1C15" }}>Standardized IQ Masterclass</strong>{" "}
                  protocol.
                </p>
              </div>
            </div>

            {/* Enroll CTA */}
            <button
              type="button"
              className="res-enroll"
              onClick={() => router.push("/courses/officer-cadet-elite")}
              style={{ marginBottom: 16 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
              </svg>
              Enroll in Officer Cadet Course
            </button>

            {/* Guest save banner */}
            {!isLoggedIn && (
              <div className="res-save-banner">
                <div className="res-save-inner">
                  <div className="res-save-emoji">🔐</div>
                  <div className="res-save-text-wrap">
                    <div className="res-save-title">Save Your Result</div>
                    <div className="res-save-sub">
                      Create a free account or log in to permanently save your score and track your
                      progress.
                    </div>
                    <div className="res-save-btns">
                      <button type="button" className="res-save-login" onClick={onSaveAndLogin}>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 1v6M4 4l3-3 3 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 10v2h10v-2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Log In / Register Free
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showSaveRecovery && (
              <div className={`res-save-status ${saveStatus}`}>
                <div className="res-save-title">
                  {saveStatus === "saving"
                    ? "Saving Result to Your Account"
                    : "Result Still Needs to Be Saved"}
                </div>
                <div className="res-save-sub">
                  {saveStatus === "saving"
                    ? "Keep this tab open while we store this attempt in your account."
                    : saveError ||
                      "Your score is visible now, but this attempt is not stored in your account yet."}
                </div>
                {saveStatus === "failed" && (
                  <div className="res-save-btns">
                    <button type="button" className="res-save-login" onClick={onRetrySave}>
                      Retry Save
                    </button>
                  </div>
                )}
              </div>
            )}

            <div
              className="res-actions"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <button type="button" className="res-retake" onClick={onRetake}>
                Retake Assessment
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M1 7a6 6 0 1 0 1.5-4M1 3v4h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button type="button" className="res-report-toggle" onClick={onGoHome}>
                Return to Home
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M6 2L1 7l5 5M2 7h11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {iqReportEnabled && (
                <button
                  type="button"
                  className="res-report-toggle"
                  onClick={() => setShowReport((v) => !v)}
                >
                  {showReport ? "Hide" : "View"} Answer Report
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d={showReport ? "M2 9l5-5 5 5" : "M2 5l5 5 5-5"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {iqReportEnabled && showReport && (
            <div className="res-report">
              <div className="res-report-hdr">
                <span className="res-report-hdr-title">Intel Report — All 60 Modules</span>
                <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>
                  {correct} ✓ · {wrong} ✗ · {unanswered} —
                </span>
              </div>
              {!isLoggedIn ? (
                <div className="res-report-locked">
                  <div className="res-locked-icon">🔒</div>
                  <div className="res-locked-title">Classified — Login Required</div>
                  <div className="res-locked-sub">
                    Full intel report requires authentication. Login or register free to unlock all
                    answers and explanations.
                  </div>
                  <button
                    type="button"
                    className="res-save-login"
                    style={{ margin: "0 auto" }}
                    onClick={onSaveAndLogin}
                  >
                    Authenticate to Unlock
                  </button>
                </div>
              ) : (
                questions.map((q) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.answer;
                  const correctText = q.options[optionLetters.indexOf(q.answer)];
                  const userText = userAns ? q.options[optionLetters.indexOf(userAns)] : null;
                  return (
                    <div className="res-report-row" key={q.id}>
                      <div className="res-row-num">
                        <div className={`res-row-icon ${isCorrect ? "c" : userAns ? "w" : "u"}`}>
                          {isCorrect ? "✓" : userAns ? "✗" : "–"}
                        </div>
                        Module {q.id}
                        <span className={`res-row-pts ${isCorrect ? "c" : "w"}`}>
                          {isCorrect ? "+1 pt" : "0 pts"}
                        </span>
                      </div>
                      <div className="res-row-qtext">{q.text}</div>
                      <div className="res-row-pills">
                        <span className="res-pill correct">
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 7l4 4 6-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Correct: {q.answer}) {correctText}
                        </span>
                        {userAns && !isCorrect && (
                          <span className="res-pill wrong">
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 14 14"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 3l8 8M11 3l-8 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                            Your answer: {userAns}) {userText}
                          </span>
                        )}
                        {!userAns && <span className="res-pill skip">Not attempted</span>}
                      </div>
                      <div className="res-explain">{q.explanation}</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="mt-footer-note">
            <span>Scientifically Designed</span>
            <span className="mt-footer-dot" />
            <span>Colonel's Academy</span>
            <span className="mt-footer-dot" />
            <span>Free Assessment</span>
          </div>
        </div>
      </div>
    </>
  );
}
