import { type Question, optionLetters } from "@/data/mockQuestions";
import { mockTestBaseCSS } from "@/data/mockTestTheme";
import { useEffect, useState } from "react";
import mq1 from "../../assets/mq1.png";
import mq2 from "../../assets/mq2.png";
import mq3 from "../../assets/mq3.png";
import mq4 from "../../assets/mq4.png";
import mq5 from "../../assets/mq5.png";
import mq6 from "../../assets/mq6.png";
import mq7 from "../../assets/mq7.png";
import mq8 from "../../assets/mq8.png";
import mq9 from "../../assets/mq9.png";
import mq10 from "../../assets/mq10.png";
import mq11 from "../../assets/mq11.png";

const imageMap: Record<number, string> = {
  0: mq1.src,
  1: mq2.src,
  2: mq3.src,
  3: mq4.src,
  4: mq5.src,
  5: mq6.src,
  6: mq7.src,
  7: mq8.src,
  8: mq9.src,
  9: mq10.src,
  10: mq11.src
};

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  answeredCount: number;
  timeLeft: number;
  timerUrgent: boolean;
  onAnswer: (letter: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onJump: (index: number) => void;
  onSubmit: () => void;
  onExit: () => void;
  answers: Record<number, string>;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MockTestQuestion({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  answeredCount,
  timeLeft,
  timerUrgent,
  onAnswer,
  onNext,
  onPrev,
  onJump,
  onSubmit,
  onExit,
  answers
}: Props) {
  const [imgError, setImgError] = useState(false);
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;
  const progress = Math.round(((questionIndex + 1) / totalQuestions) * 100);

  // Keyboard shortcuts: A-E select option, Arrow keys / Enter navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isInteractive = target?.closest(
        "button, a, input, textarea, select, summary, [role='button'], [contenteditable='true']"
      );

      // Don't intercept while typing or when a native/focusable control already owns the keypress.
      if (tag === "INPUT" || tag === "TEXTAREA" || isInteractive) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (optionLetters.includes(key) && question.options[optionLetters.indexOf(key)]) {
        e.preventDefault();
        onAnswer(key);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLast) onSubmit();
        else onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) onPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question, isFirst, isLast, onAnswer, onNext, onPrev, onSubmit]);

  return (
    <>
      <style>{`
        ${mockTestBaseCSS}

        /* ── STICKY TOP BAR ── */
        .mqt-bar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(243,244,246,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,55,0.2);
          padding: 10px 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .mqt-exit-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          min-width: 124px; background: rgba(255,255,255,0.84);
          border: 1px solid rgba(15,28,21,0.12); border-radius: 12px;
          padding: 10px 14px; color: #6b7280; cursor: pointer;
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; font-family: monospace; transition: all 0.15s;
        }
        .mqt-exit-btn:hover { background: #fff; color: #0F1C15; border-color: rgba(15,28,21,0.25); }

        @keyframes mqt-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* Progress pod */
        .mqt-progress-track { width: 100%; height: 5px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; margin-top: 4px; }
        .mqt-progress-fill { height: 100%; background: linear-gradient(90deg, #D4AF37, #B8860B); border-radius: 3px; transition: width 0.4s ease; }
        .mqt-progress-label { font-size: 12px; font-weight: 700; color: #D4AF37; letter-spacing: 0.18em; text-transform: uppercase; font-family: monospace; margin-bottom: 4px; }

        /* ── MAIN CONTENT ── */
        .mqt-outer {
          max-width: 760px; margin: 0 auto;
          padding: 20px 16px 100px;
          position: relative; z-index: 1;
        }

        /* Question meta */
        .mqt-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .mqt-qbadge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 999px; padding: 5px 14px;
          font-size: 11px; font-weight: 700; color: #B8860B;
          letter-spacing: 0.15em; text-transform: uppercase;
          font-family: monospace;
        }
        .mqt-answered-count {
          font-size: 12px; font-weight: 700; color: #9ca3af;
          letter-spacing: 0.1em; font-family: monospace; text-transform: uppercase;
        }
        .mqt-answered-count span { color: #D4AF37; }

        /* Question card */
        .mqt-card { padding: 28px 32px 26px; margin-bottom: 14px; }

        /* Category tag */
        .mqt-category {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
        }
        .mqt-cat-dot { width: 5px; height: 5px; border-radius: 50%; background: #D4AF37; flex-shrink: 0; }
        .mqt-cat-text { font-size: 9px; font-weight: 700; color: #D4AF37; letter-spacing: 0.3em; text-transform: uppercase; font-family: monospace; }

        .mqt-qtext {
          font-size: 16px; font-weight: 600; color: #0F1C15;
          line-height: 1.7; margin: 0 0 20px;
        }
        .mqt-img-box {
          background: rgba(243,244,246,0.8); border: 1px solid rgba(212,175,55,0.15);
          border-radius: 12px; padding: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .mqt-img { max-width: 100%; max-height: 200px; object-fit: contain; display: block; }

        /* Options — dark green selected, gold on hover */
        .mqt-options { display: flex; flex-direction: column; gap: 10px; }
        .mqt-option {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(0,0,0,0.06);
          border-radius: 14px; padding: 14px 18px;
          cursor: pointer; transition: all 0.2s;
          text-align: left; font-family: inherit; width: 100%;
        }
        .mqt-option:hover { background: rgba(212,175,55,0.05); border-color: rgba(212,175,55,0.3); }
        .mqt-option.sel { background: #0F1C15; border-color: #0F1C15; }
        .mqt-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
        }
        .mqt-radio.sel { border-color: rgba(212,175,55,0.5); background: #D4AF37; }
        .mqt-radio-inner { width: 7px; height: 7px; border-radius: 50%; background: #0F1C15; opacity: 0; transition: opacity 0.15s; }
        .mqt-radio.sel .mqt-radio-inner { opacity: 1; }
        .mqt-opt-letter { font-size: 11px; font-weight: 700; color: #9ca3af; min-width: 16px; font-family: monospace; transition: color 0.15s; }
        .mqt-option.sel .mqt-opt-letter { color: #D4AF37; }
        .mqt-opt-text { font-size: 14px; color: #374151; line-height: 1.45; flex: 1; font-weight: 500; transition: color 0.15s; }
        .mqt-option.sel .mqt-opt-text { color: #fff; font-weight: 600; }

        /* Nav buttons */
        .mqt-nav { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
        .mqt-nav-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 12px 20px; border-radius: 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.2s; font-family: 'Rajdhani', sans-serif; border: none;
        }
        .mqt-nav-btn.prev {
          background: rgba(255,255,255,0.8); border: 1.5px solid rgba(15,28,21,0.1); color: #6b7280;
        }
        .mqt-nav-btn.prev:hover { background: rgba(15,28,21,0.05); border-color: rgba(15,28,21,0.2); color: #0F1C15; }
        .mqt-nav-btn.prev:disabled { opacity: 0.35; cursor: not-allowed; }
        .mqt-nav-btn.next {
          flex: 1; background: #0F1C15; color: #fff; justify-content: center;
          box-shadow: 0 4px 16px rgba(15,28,21,0.25);
        }
        .mqt-nav-btn.next:hover { background: #D4AF37; color: #0F1C15; }
        .mqt-nav-btn.submit {
          flex: 1; background: #D4AF37; color: #0F1C15; justify-content: center;
          box-shadow: 0 4px 16px rgba(212,175,55,0.3); font-weight: 700;
        }
        .mqt-nav-btn.submit:hover { background: #B8860B; color: #fff; }

        /* Question dot grid */
        .mqt-grid-wrap {
          background: rgba(255,255,255,0.7); border: 1px solid rgba(212,175,55,0.15);
          border-radius: 18px; padding: 18px 20px;
        }
        .mqt-grid-title {
          font-size: 11px; font-weight: 700; color: #9ca3af;
          letter-spacing: 0.18em; text-transform: uppercase;
          margin-bottom: 14px; display: flex; justify-content: space-between;
          font-family: monospace;
        }
        .mqt-grid-title span:last-child { color: #D4AF37; }
        .mqt-grid-dots { display: flex; flex-wrap: wrap; gap: 6px; }
        .mqt-dot {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; cursor: pointer;
          border: 1.5px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.5); color: #6b7280;
          transition: all 0.12s; font-family: monospace;
        }
        .mqt-dot:hover { border-color: rgba(212,175,55,0.4); color: #B8860B; }
        .mqt-dot.answered { background: rgba(212,175,55,0.12); border-color: rgba(212,175,55,0.35); color: #B8860B; }
        .mqt-dot.current { background: #0F1C15; border-color: #0F1C15; color: #fff; }
        .mqt-dot.current.answered { background: #D4AF37; border-color: #D4AF37; color: #0F1C15; }

        .mqt-legend { display: flex; gap: 16px; margin-top: 12px; }
        .mqt-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #9ca3af; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-family: monospace; }
        .mqt-legend-dot { width: 12px; height: 11px; border-radius: 3px; }

        @media (max-width: 600px) {
          .mqt-outer { padding: 16px 12px 80px; }
          .mqt-card { padding: 20px 16px 18px; }
          .mqt-qtext { font-size: 14px; }
          .mqt-dot { width: 28px; height: 28px; font-size: 9px; }
        }
      `}</style>

      {/* Sticky top bar */}
      <div className="mqt-bar">
        <button type="button" className="mqt-exit-btn" onClick={onExit}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M6 2L1 7l5 5M2 7h11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Exit
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3
          }}
        >
          <div className="mqt-progress-label">
            Processing — {questionIndex + 1}/{totalQuestions}
          </div>
          <div className="mqt-progress-track" style={{ width: "100%", maxWidth: 200 }}>
            <div className="mqt-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "'Rajdhani', sans-serif",
            color: timerUrgent ? "#ef4444" : "#0F1C15",
            padding: "6px 12px",
            background: "rgba(255,255,255,0.8)",
            border: timerUrgent
              ? "1px solid rgba(239,68,68,0.3)"
              : "1px solid rgba(212,175,55,0.25)",
            borderRadius: 10,
            letterSpacing: "0.05em",
            animation: timerUrgent ? "mqt-pulse 1s ease-in-out infinite" : "none"
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mt-page" style={{ background: "transparent" }}>
        <div className="mqt-outer">
          <div className="mqt-meta">
            <div className="mqt-qbadge">
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#D4AF37",
                  display: "inline-block"
                }}
              />
              Module {questionIndex + 1} / {totalQuestions}
            </div>
            <span className="mqt-answered-count">
              <span>{answeredCount}</span>/{totalQuestions} Answered
            </span>
          </div>

          <div className="mt-card mqt-card">
            <div className="mqt-category">
              <span className="mqt-cat-dot" />
              <span className="mqt-cat-text">Q{question.id} — Cognitive Assessment</span>
            </div>

            <p className="mqt-qtext">{question.text}</p>

            {question.isImage && (
              <div className="mqt-img-box">
                {imgError ? (
                  <div style={{ padding: 12, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
                    📊 Diagram Q{question.id}
                  </div>
                ) : (
                  <img
                    src={imageMap[question.imageIndex!]}
                    alt={`Question ${question.id} diagram`}
                    className="mqt-img"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            )}

            <div className="mqt-options">
              {question.options.map((opt, i) => {
                const letter = optionLetters[i];
                if (letter === undefined) return null;
                const isSel = selectedAnswer === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    className={`mqt-option ${isSel ? "sel" : ""}`}
                    onClick={() => onAnswer(letter)}
                  >
                    <div className={`mqt-radio ${isSel ? "sel" : ""}`}>
                      <div className="mqt-radio-inner" />
                    </div>
                    <span className="mqt-opt-letter">{letter}</span>
                    <span className="mqt-opt-text">{opt}</span>
                    {isSel && (
                      <div
                        style={{
                          marginLeft: "auto",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "1.5px solid rgba(212,175,55,0.4)",
                          background: "#D4AF37",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#0F1C15"
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mqt-nav">
            <button type="button" className="mqt-nav-btn prev" onClick={onPrev} disabled={isFirst}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M9 2L5 7l4 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
            {isLast ? (
              <button type="button" className="mqt-nav-btn submit" onClick={onSubmit}>
                Finalize Assessment
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button type="button" className="mqt-nav-btn next" onClick={onNext}>
                {selectedAnswer ? "Next Question" : "Skip & Next"}
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="mqt-grid-wrap">
            <div className="mqt-grid-title">
              <span>Jump to Module</span>
              <span>
                {answeredCount}/{totalQuestions} Complete
              </span>
            </div>
            <div className="mqt-grid-dots">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const qId = i + 1;
                const isAnswered = !!answers[qId];
                const isCurrent = i === questionIndex;
                return (
                  <button
                    key={qId}
                    type="button"
                    className={`mqt-dot ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`}
                    onClick={() => onJump(i)}
                    title={`Q${qId}${isAnswered ? " ✓" : ""}`}
                  >
                    {qId}
                  </button>
                );
              })}
            </div>
            <div className="mqt-legend">
              <div className="mqt-legend-item">
                <div className="mqt-legend-dot" style={{ background: "#0F1C15" }} />
                Current
              </div>
              <div className="mqt-legend-item">
                <div
                  className="mqt-legend-dot"
                  style={{
                    background: "rgba(212,175,55,0.3)",
                    border: "1px solid rgba(212,175,55,0.4)"
                  }}
                />
                Answered
              </div>
              <div className="mqt-legend-item">
                <div
                  className="mqt-legend-dot"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(0,0,0,0.08)"
                  }}
                />
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
