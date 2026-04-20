import { mockTestBaseCSS } from "@/data/mockTestTheme";
import { FULL_MARKS, PASS_MARK_SCORE, TOTAL_QUESTIONS } from "../../data/mockQuestions";

interface Props {
  isLoggedIn: boolean;
  onGoHome: () => void;
  onStart: () => void;
  onPrint: () => void;
}

export default function MockTestIntro({ isLoggedIn, onGoHome, onStart, onPrint }: Props) {
  return (
    <>
      <style>{`
        ${mockTestBaseCSS}

        .intro-outer {
          max-width: 560px; margin: 0 auto;
          padding: 60px 20px 80px;
          position: relative; z-index: 1;
          text-align: center;
        }

        .intro-headline {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(32px, 7vw, 52px);
          font-weight: 700;
          color: #0F1C15;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          line-height: 1.05;
          margin: 0 0 8px;
        }
        .intro-headline span {
          background: linear-gradient(90deg, #D4AF37, #B8860B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .intro-sub {
          font-size: 14px; color: #6b7280;
          margin: 0 0 36px; line-height: 1.6; font-weight: 500;
        }

        .intro-card { padding: 40px 36px 36px; }

        /* Stats grid */
        .intro-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 14px; overflow: hidden; margin-bottom: 28px;
          background: rgba(15,28,21,0.03);
        }
        .intro-cell { padding: 18px 10px; text-align: center; }
        .intro-cell:not(:last-child) { border-right: 1px solid rgba(212,175,55,0.15); }
        .intro-cell-icon {
          font-size: 12px; font-weight: 700; color: #D4AF37;
          letter-spacing: 0.2em; text-transform: uppercase;
          font-family: monospace; margin-bottom: 6px;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .intro-cell-val {
          font-size: 28px; font-weight: 700;
          color: #0F1C15; letter-spacing: -0.02em;
          font-family: 'Rajdhani', sans-serif;
        }
        .intro-cell-lbl {
          font-size: 11px; color: #9ca3af; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px;
          font-family: monospace;
        }

        /* Rules */
        .intro-rules { text-align: left; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
        .intro-rule { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #374151; line-height: 1.5; font-weight: 500; }
        .intro-rule-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .intro-rule-dot.g { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
        .intro-rule-dot.r { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }

        /* Guest notice */
        .intro-guest-notice {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 10px; padding: 12px 14px;
          font-size: 12px; color: #92400e;
          margin-bottom: 20px; text-align: left; line-height: 1.5;
        }

        /* Print button */
        .intro-print-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; background: transparent;
          border: 1.5px solid rgba(15,28,21,0.15);
          border-radius: 14px; padding: 13px 24px;
          font-size: 11px; font-weight: 700; color: #6b7280;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Rajdhani', sans-serif;
          margin-top: 10px; letter-spacing: 0.2em; text-transform: uppercase;
        }
        .intro-print-btn:hover { background: rgba(15,28,21,0.04); border-color: rgba(15,28,21,0.3); color: #0F1C15; }

        .intro-home-btn { margin-top: 10px; }

        /* Status bar at bottom of card */
        .intro-status-bar {
          margin-top: 20px; padding-top: 16px;
          border-top: 1px solid rgba(212,175,55,0.15);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .intro-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: mt-dot-pulse 1.2s ease-in-out infinite; }
        .intro-status-text { font-size: 9px; font-weight: 700; color: #9ca3af; letter-spacing: 0.2em; text-transform: uppercase; font-family: monospace; }

        @media (max-width: 480px) {
          .intro-card { padding: 26px 18px 22px; }
          .intro-grid { grid-template-columns: 1fr 1fr; }
          .intro-cell:nth-child(2) { border-right: none; }
          .intro-cell:nth-child(3),
          .intro-cell:nth-child(4) { border-top: 1px solid rgba(212,175,55,0.15); }
          .intro-cell:nth-child(3) { border-right: 1px solid rgba(212,175,55,0.15); }
          .intro-outer { padding: 40px 14px 60px; }
        }
      `}</style>

      <div className="mt-page">
        {/* Corner accents */}
        <div className="mt-corner-tl" />
        <div className="mt-corner-br" />

        {/* HUD side decal */}
        <div className="mt-hud-decal">
          <div>SYS: ONLINE</div>
          <div>MODE: ASSESSMENT</div>
          <div className="mt-hud-gold">READY {/* v3.0 */}</div>
        </div>

        <div className="intro-outer">
          <div className="mt-eyebrow">
            <span className="mt-eyebrow-dot" />
            <span className="mt-eyebrow-text">Aptitude Assessment</span>
          </div>

          <h1 className="intro-headline">
            IQ Mock <span>Examination</span>
          </h1>
          <p className="intro-sub">
            Officer selection requires precision under pressure.
            <br />
            Read all instructions carefully before you begin.
          </p>

          <div className="mt-card intro-card">
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
                <div className="intro-cell-val">{TOTAL_QUESTIONS}</div>
                <div className="intro-cell-lbl">Questions</div>
              </div>
              <div className="intro-cell">
                <div className="intro-cell-icon">
                  <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="5.5" stroke="#D4AF37" strokeWidth="1.3" />
                    <path d="M7 4v3l2 2" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Timer
                </div>
                <div className="intro-cell-val">30</div>
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
                <div className="intro-cell-val">{FULL_MARKS}</div>
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
                <div className="intro-cell-val">{PASS_MARK_SCORE}</div>
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
                You may submit before 30 minutes
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
              <div className="intro-rule">
                <span className="intro-rule-dot r" />
                Phone verification required before submission
              </div>
            </div>

            {!isLoggedIn && (
              <div className="intro-guest-notice">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 14 14"
                  fill="none"
                  role="img"
                  aria-label="Information"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="7" cy="7" r="6" stroke="#D4AF37" strokeWidth="1.5" />
                  <path
                    d="M7 4v3M7 9.5v.5"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  You're taking the test as a <strong>guest</strong>. Log in or register after the
                  test to save your results and track your progress.
                </span>
              </div>
            )}

            <button type="button" className="mt-btn-primary" onClick={onStart}>
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

            <button type="button" className="intro-print-btn" onClick={onPrint}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Paper Version
            </button>

            <button type="button" className="intro-print-btn intro-home-btn" onClick={onGoHome}>
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
              <span className="intro-status-text">Secured Academy Connection · Free for all</span>
            </div>
          </div>

          <div className="mt-footer-note">
            <span>No Negative Marking</span>
            <span className="mt-footer-dot" />
            <span>Colonel's Academy</span>
            <span className="mt-footer-dot" />
            <span>NP_KTM_85.3</span>
          </div>
        </div>
      </div>
    </>
  );
}
