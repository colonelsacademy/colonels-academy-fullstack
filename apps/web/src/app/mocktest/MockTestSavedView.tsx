import { useState } from "react"
import type { MockTestSavedResult } from "@/services/mockTestService"
import { questions, FULL_MARKS, optionLetters } from "@/data/mockQuestions"
import { mockTestBaseCSS } from "@/data/mockTestTheme"

interface Props {
  savedResult: MockTestSavedResult
  clearLoading: boolean
  onGoHome: () => void
  onClearAndRetake: () => void
}

export default function MockTestSavedView({ savedResult, clearLoading, onGoHome, onClearAndRetake }: Props) {
  const iqReportEnabled = process.env.NEXT_PUBLIC_IQ_REPORT_ENABLED !== "false"
  const [showConfirm, setShowConfirm] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const { score, totalMarks, timeTaken, passed, createdAt, answers } = savedResult

  const safeScore = score ?? 0
  const safeTimeTaken = timeTaken ?? 0
  const safeTotalMarks = totalMarks ?? FULL_MARKS

  const pct = Math.round((safeScore / safeTotalMarks) * 100)
  const mins = Math.floor(safeTimeTaken / 60)
  const secs = safeTimeTaken % 60
  const date = new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const answerMap: Record<number, string> = {}
  if (answers) Object.entries(answers).forEach(([k, v]) => { answerMap[Number(k)] = v as string })

  const correct = questions.filter(q => answerMap[q.id] === q.answer).length
  const wrong = Object.keys(answerMap).length - correct
  const unanswered = questions.length - Object.keys(answerMap).length

  return (
    <>
      <style>{`
        ${mockTestBaseCSS}

        .sv-outer { max-width: 680px; margin: 0 auto; padding: 52px 16px 80px; position: relative; z-index: 1; }

        .sv-hero { padding: 44px 36px 36px; text-align: center; margin-bottom: 14px; position: relative; overflow: hidden; }
        .sv-glow {
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px; border-radius: 50%;
          background: ${passed ? "rgba(212,175,55,0.08)" : "rgba(239,68,68,0.06)"}; filter: blur(32px);
          pointer-events: none;
        }

        /* Score ring */
        .sv-ring-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto 22px; }
        .sv-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .sv-ring-track { stroke: ${passed ? "rgba(212,175,55,0.1)" : "rgba(239,68,68,0.1)"}; stroke-width: 6; fill: none; }
        .sv-ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; stroke: ${passed ? "#D4AF37" : "#ef4444"}; stroke-dasharray: ${pct * 3.77} 377; }
        .sv-ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sv-score-num { font-size: 40px; font-weight: 700; color: #0F1C15; font-family: 'Rajdhani', sans-serif; line-height: 1; }
        .sv-score-denom { font-size: 12px; color: #9ca3af; font-weight: 700; font-family: monospace; }

        .sv-verdict { font-size: clamp(18px, 4vw, 26px); font-weight: 700; color: #0F1C15; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px; }

        .sv-date-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(15,28,21,0.05); border: 1px solid rgba(15,28,21,0.1);
          border-radius: 999px; padding: 4px 12px; margin-bottom: 22px;
          font-size: 10px; color: #6b7280; font-weight: 700; font-family: monospace; letter-spacing: 0.08em;
        }

        .sv-stats { display: flex; border: 1px solid rgba(212,175,55,0.15); border-radius: 14px; overflow: hidden; margin-bottom: 26px; background: rgba(243,244,246,0.5); }
        .sv-stat { flex: 1; padding: 16px 8px; text-align: center; }
        .sv-stat + .sv-stat { border-left: 1px solid rgba(212,175,55,0.12); }
        .sv-stat-val { font-size: 20px; font-weight: 700; color: #0F1C15; letter-spacing: -0.02em; font-family: 'Rajdhani', sans-serif; }
        .sv-stat-val.g { color: #16a34a; }
        .sv-stat-val.r { color: #ef4444; }
        .sv-stat-val.a { color: #D4AF37; }
        .sv-stat-val.p { color: ${passed ? "#D4AF37" : "#ef4444"}; }
        .sv-stat-lbl { font-size: 8px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 3px; font-family: monospace; }

        .sv-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .sv-retake-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; background: #0F1C15; color: #fff; border: none;
          border-radius: 14px; padding: 15px 24px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
          box-shadow: 0 4px 16px rgba(15,28,21,0.2);
        }
        .sv-retake-btn:hover:not(:disabled) { background: #D4AF37; color: #0F1C15; }
        .sv-retake-btn:disabled { background: #9ca3af; cursor: not-allowed; }

        .sv-clear-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%; background: transparent;
          border: 1.5px solid rgba(239,68,68,0.3); border-radius: 14px;
          padding: 13px 24px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #ef4444;
          cursor: pointer; transition: all 0.15s; font-family: 'Rajdhani', sans-serif;
        }
        .sv-clear-btn:hover:not(:disabled) { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.5); }
        .sv-clear-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sv-report-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; background: transparent; border: 1.5px solid rgba(212,175,55,0.2);
          border-radius: 14px; padding: 12px 24px; font-size: 11px; font-weight: 700;
          color: #B8860B; cursor: pointer; transition: all 0.15s;
          font-family: 'Rajdhani', sans-serif; letter-spacing: 0.2em; text-transform: uppercase;
        }
        .sv-report-btn:hover { background: rgba(212,175,55,0.06); }

        /* Confirm modal */
        .sv-confirm-overlay {
          position: fixed; inset: 0; z-index: 100; background: rgba(15,28,21,0.6);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: sv-fadein 0.15s ease; backdrop-filter: blur(4px);
        }
        @keyframes sv-fadein { from { opacity: 0; } to { opacity: 1; } }
        .sv-confirm-card {
          background: #fff; border-radius: 20px; padding: 36px 32px 30px;
          max-width: 420px; width: 100%; text-align: center;
          box-shadow: 0 24px 64px rgba(15,28,21,0.3);
          animation: sv-slidein 0.2s ease;
          border: 1px solid rgba(212,175,55,0.2);
        }
        @keyframes sv-slidein { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sv-confirm-icon { font-size: 44px; margin-bottom: 14px; }
        .sv-confirm-title { font-size: 22px; font-weight: 700; color: #0F1C15; margin: 0 0 8px; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        .sv-confirm-sub { font-size: 13px; color: #6b7280; line-height: 1.65; margin: 0 0 16px; }
        .sv-confirm-note {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.2);
          border-radius: 10px; padding: 10px 12px; margin-bottom: 22px;
          font-size: 11px; color: #92400e; text-align: left; line-height: 1.6;
        }
        .sv-confirm-btns { display: flex; gap: 10px; }
        .sv-confirm-cancel {
          flex: 1; background: transparent; border: 1.5px solid rgba(15,28,21,0.12);
          border-radius: 12px; padding: 12px; font-size: 11px; font-weight: 700;
          color: #6b7280; cursor: pointer; font-family: 'Rajdhani', sans-serif;
          letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.15s;
        }
        .sv-confirm-cancel:hover { background: rgba(15,28,21,0.04); }
        .sv-confirm-delete {
          flex: 1; background: #ef4444; color: #fff; border: none;
          border-radius: 12px; padding: 12px; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'Rajdhani', sans-serif;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .sv-confirm-delete:hover:not(:disabled) { background: #dc2626; }
        .sv-confirm-delete:disabled { background: #9ca3af; cursor: not-allowed; }
        .sv-spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: sv-spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes sv-spin { to { transform: rotate(360deg); } }

        /* Answer report */
        .sv-report { background: rgba(255,255,255,0.8); border: 1px solid rgba(212,175,55,0.15); border-radius: 18px; overflow: hidden; }
        .sv-report-hdr { padding: 14px 22px; border-bottom: 1px solid rgba(212,175,55,0.12); background: rgba(243,244,246,0.8); display: flex; align-items: center; justify-content: space-between; }
        .sv-report-hdr-title { font-size: 9px; font-weight: 700; color: #374151; letter-spacing: 0.18em; text-transform: uppercase; font-family: monospace; }
        .sv-report-row { padding: 16px 22px; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .sv-report-row:last-child { border-bottom: none; }
        .sv-row-num { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: #9ca3af; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; font-family: monospace; }
        .sv-row-icon { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
        .sv-row-icon.c { background: rgba(34,197,94,0.12); color: #16a34a; }
        .sv-row-icon.w { background: rgba(239,68,68,0.1); color: #ef4444; }
        .sv-row-icon.u { background: rgba(0,0,0,0.05); color: #9ca3af; }
        .sv-row-pts { margin-left: auto; font-size: 10px; font-weight: 700; font-family: monospace; }
        .sv-row-pts.c { color: #16a34a; }
        .sv-row-pts.w { color: #ef4444; }
        .sv-row-qtext { font-size: 13px; font-weight: 600; color: #0F1C15; margin-bottom: 8px; line-height: 1.5; }
        .sv-pills { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 6px; }
        .sv-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .sv-pill.correct { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #15803d; }
        .sv-pill.wrong { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; }
        .sv-pill.skip { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #9ca3af; }
        .sv-explain { font-size: 12px; color: #6b7280; line-height: 1.6; padding: 8px 12px; background: rgba(212,175,55,0.04); border-radius: 8px; border-left: 3px solid rgba(212,175,55,0.3); }

        @media (max-width: 600px) {
          .sv-outer { padding: 32px 12px 60px; }
          .sv-hero { padding: 28px 18px 24px; }
          .sv-stats { flex-wrap: wrap; }
          .sv-stat { flex: 1 1 30%; }
          .sv-confirm-card { padding: 28px 20px 24px; }
          .sv-confirm-btns { flex-direction: column; }
        }
      `}</style>

      {showConfirm && (
        <div className="sv-confirm-overlay" onClick={() => !clearLoading && setShowConfirm(false)}>
          <div className="sv-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="sv-confirm-icon">🗑️</div>
            <h3 className="sv-confirm-title">Clear Score?</h3>
            <p className="sv-confirm-sub">
              Your score and answers will be permanently deleted so you can retake the assessment with a clean slate.
            </p>
            <div className="sv-confirm-note">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M2 7l4 4 6-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>
                Your <strong>phone number</strong> and account info will be kept — only your test score and answers will be removed.
              </span>
            </div>
            <div className="sv-confirm-btns">
              <button className="sv-confirm-cancel" onClick={() => setShowConfirm(false)} disabled={clearLoading}>Cancel</button>
              <button className="sv-confirm-delete" onClick={onClearAndRetake} disabled={clearLoading}>
                {clearLoading
                  ? <><span className="sv-spinner" /> Removing…</>
                  : <>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                        <rect x="3" y="4" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/>
                      </svg>
                      Confirm Clear
                    </>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-page">
        <div className="mt-corner-tl" />
        <div className="mt-corner-br" />

        <div className="mt-hud-decal">
          <div>PREV SCORE: {safeScore}/{safeTotalMarks}</div>
          <div>STATUS: {passed ? "PASS" : "FAIL"}</div>
          <div className="mt-hud-gold">{passed ? "QUALIFIED" : "RETRY"}</div>
        </div>

        <div className="sv-outer">
       

          <div className="mt-card sv-hero">
            <div className="sv-glow" />

            <div className="mt-eyebrow" style={{ justifyContent: "center" }}>
              <span className="mt-eyebrow-dot" style={{ background: passed ? "#D4AF37" : "#ef4444", animationPlayState: "running" }} />
              <span className="mt-eyebrow-text" style={{ color: passed ? "#B8860B" : "#dc2626" }}>
                {passed ? "Previous Result — Qualified" : "Previous Result — Not Passed"}
              </span>
            </div>

            <div className="sv-ring-wrap">
              <svg className="sv-ring-svg" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" className="sv-ring-track" />
                <circle cx="70" cy="70" r="60" className="sv-ring-fill" />
              </svg>
              <div className="sv-ring-inner">
                <div className="sv-score-num">{safeScore}</div>
                <div className="sv-score-denom">/ {safeTotalMarks}</div>
              </div>
            </div>

            <h2 className="sv-verdict">
              {passed ? "🎖️ Assessment Passed" : "⚡ Training Required"}
            </h2>

            <div className="sv-date-tag">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 2v2M9 2v2M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Logged: {date}
            </div>

            <div className="sv-stats">
              <div className="sv-stat"><div className="sv-stat-val g">{correct}</div><div className="sv-stat-lbl">Correct</div></div>
              <div className="sv-stat"><div className="sv-stat-val r">{wrong}</div><div className="sv-stat-lbl">Wrong</div></div>
              <div className="sv-stat"><div className="sv-stat-val a">{unanswered}</div><div className="sv-stat-lbl">Skipped</div></div>
              <div className="sv-stat"><div className="sv-stat-val">{mins}m {secs}s</div><div className="sv-stat-lbl">Time</div></div>
              <div className="sv-stat"><div className="sv-stat-val p">{pct}%</div><div className="sv-stat-lbl">Score %</div></div>
            </div>

            <div className="sv-actions">
              <button className="sv-retake-btn" onClick={() => setShowConfirm(true)} disabled={clearLoading}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7a6 6 0 1 0 1.5-4M1 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Retake Assessment
              </button>
              <button className="sv-report-btn" onClick={onGoHome}>
                Return to Home
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M6 2L1 7l5 5M2 7h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="sv-clear-btn" onClick={() => setShowConfirm(true)} disabled={clearLoading}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Clear Score from Database
              </button>
              {iqReportEnabled && (
                <button className="sv-report-btn" onClick={() => setShowReport(v => !v)}>
                  {showReport ? "Hide" : "View"} Full Intel Report
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d={showReport ? "M2 9l5-5 5 5" : "M2 5l5 5 5-5"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {iqReportEnabled && showReport && (
            <div className="sv-report">
              <div className="sv-report-hdr">
                <span className="sv-report-hdr-title">Intel Report — All 60 Modules</span>
                <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{correct} ✓ · {wrong} ✗ · {unanswered} —</span>
              </div>
              {questions.map(q => {
                const userAns = answerMap[q.id]
                const isCorrect = userAns === q.answer
                const correctText = q.options[optionLetters.indexOf(q.answer)]
                const userText = userAns ? q.options[optionLetters.indexOf(userAns)] : null
                return (
                  <div className="sv-report-row" key={q.id}>
                    <div className="sv-row-num">
                      <div className={`sv-row-icon ${isCorrect ? "c" : userAns ? "w" : "u"}`}>{isCorrect ? "✓" : userAns ? "✗" : "–"}</div>
                      Module {q.id}
                      <span className={`sv-row-pts ${isCorrect ? "c" : "w"}`}>{isCorrect ? "+1 pt" : "0 pts"}</span>
                    </div>
                    <div className="sv-row-qtext">{q.text}</div>
                    <div className="sv-pills">
                      <span className="sv-pill correct">
                        <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        Correct: {q.answer}) {correctText}
                      </span>
                      {userAns && !isCorrect && (
                        <span className="sv-pill wrong">
                          <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Your answer: {userAns}) {userText}
                        </span>
                      )}
                      {!userAns && <span className="sv-pill skip">Not attempted</span>}
                    </div>
                    <div className="sv-explain">{q.explanation}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-footer-note">
            <span>Secured</span>
            <span className="mt-footer-dot" />
            <span>Colonel's Academy</span>
            <span className="mt-footer-dot" />
            <span>NP_KTM_85.3</span>
          </div>
        </div>
      </div>
    </>
  )
}
