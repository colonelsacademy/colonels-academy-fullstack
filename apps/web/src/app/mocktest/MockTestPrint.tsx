import { useEffect } from "react";
import ssacademybranding from "@/assets/branding.svg";
import mq1 from "@/assets/mq1.png";
import mq2 from "@/assets/mq2.png";
import mq3 from "@/assets/mq3.png";
import mq4 from "@/assets/mq4.png";
import mq5 from "@/assets/mq5.png";
import mq6 from "@/assets/mq6.png";
import mq7 from "@/assets/mq7.png";
import mq8 from "@/assets/mq8.png";
import mq9 from "@/assets/mq9.png";
import mq10 from "@/assets/mq10.png";
import mq11 from "@/assets/mq11.png";
import { optionLetters, questions } from "@/data/mockQuestions";

interface Props {
  onClose: () => void;
}

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
  10: mq11.src,
};

const WHATSAPP_NOTE = "To receive your results or check your answers, WhatsApp a photo of your answer sheet to:";

export default function MockTestPrint({ onClose }: Props) {
  const handlePrint = () => window.print();
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });


  useEffect(() => {
    document.body.classList.add("mocktest-print-open")
    // Scroll to top
    window.scrollTo(0, 0)

    return () => {
      document.body.classList.remove("mocktest-print-open")
    }
  }, [])

  return (
    <>
      <style>{`
        /* ── Hide navbar when print view is open ── */
        body.mocktest-print-open nav,
        body.mocktest-print-open header,
        body.mocktest-print-open [class*="navbar"],
        body.mocktest-print-open [class*="Navbar"],
        body.mocktest-print-open [class*="nav-desktop"],
        body.mocktest-print-open [class*="nav-mobile"] {
          display: none !important;
        }

        /* ─────────────────────────────────────────────
           SCREEN ONLY
        ───────────────────────────────────────────── */
        @media screen {
          *, *::before, *::after { box-sizing: border-box; }

          .prt-page {
            min-height: 100vh;
            background: #e8e5e0;
            font-family: 'Georgia', serif;
            padding: 28px 16px 72px;
          }

          .prt-topbar {
            max-width: 860px; margin: 0 auto 20px;
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; background: #fff;
            border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
            padding: 12px 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          }
          .prt-topbar-left { display: flex; align-items: center; gap: 10px; }
          .prt-topbar-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(15,28,21,0.07); border: 1px solid rgba(15,28,21,0.15);
            border-radius: 5px; padding: 3px 10px;
            font-size: 11px; font-weight: 700; color: #0F1C15;
            letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif;
          }
          .prt-topbar-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #D4AF37; display: inline-block; }
          .prt-topbar-info { font-size: 12px; color: #6b7280; font-family: sans-serif; font-weight: 500; }
          .prt-topbar-info strong { color: #0F1C15; }
          .prt-topbar-btns { display: flex; gap: 8px; }
          .prt-print-btn {
            display: flex; align-items: center; gap: 7px;
            background: #0F1C15; color: #fff; border: none; border-radius: 8px;
            padding: 9px 16px; font-size: 12px; font-weight: 700;
            letter-spacing: 0.1em; text-transform: uppercase;
            cursor: pointer; font-family: sans-serif; transition: all 0.15s;
            white-space: nowrap;
          }
          .prt-print-btn:hover { background: #D4AF37; color: #0F1C15; }
          .prt-close-btn {
            display: flex; align-items: center; gap: 6px;
            background: transparent; border: 1.5px solid rgba(0,0,0,0.12);
            border-radius: 8px; padding: 9px 16px;
            font-size: 12px; font-weight: 600; color: #6b7280;
            cursor: pointer; font-family: sans-serif; transition: all 0.15s;
            white-space: nowrap;
          }
          .prt-close-btn:hover { background: #f5f5f5; color: #0F1C15; }

          .prt-paper {
            max-width: 860px; margin: 0 auto; background: #fff;
            border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;
            padding: 52px 60px 56px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.06);
          }

          @media (max-width: 640px) {
            .prt-page { padding: 16px 10px 56px; }
            .prt-paper { padding: 28px 20px 32px; }
            .prt-topbar { flex-wrap: wrap; gap: 8px; }
            .prt-topbar-left { flex-direction: column; align-items: flex-start; gap: 4px; }
            .prt-topbar-btns { width: 100%; }
            .prt-print-btn, .prt-close-btn { flex: 1; justify-content: center; }
          }
        }

        /* ─────────────────────────────────────────────
           SHARED — PAPER CONTENT
        ───────────────────────────────────────────── */
        .prt-paper {
          font-family: 'Times New Roman', Times, serif;
          color: #000; font-size: 11pt; line-height: 1.6; position: relative;
        }

        /* ── WATERMARK ── */
        .prt-watermark {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-40deg);
          font-size: 88pt; font-family: 'Times New Roman', serif; font-weight: 900;
          color: rgba(0,0,0,0.04); white-space: nowrap; pointer-events: none;
          z-index: 0; letter-spacing: 0.08em; text-transform: uppercase; user-select: none;
        }
        @media screen { .prt-watermark { display: none; } }
        @media print  { .prt-watermark { display: block; } }

        .prt-content { position: relative; z-index: 1; }

        /* ── WHATSAPP NOTE ── */
        .prt-wa-note, .prt-wa-bottom {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #000; border-radius: 3px; padding: 6px 12px;
          font-size: 8.5pt; font-weight: 700; background: #f9f9f9; letter-spacing: 0.01em;
        }
        .prt-wa-note { margin-bottom: 14px; }
        .prt-wa-bottom { margin-top: 18px; }
        .prt-wa-number { color: #1a7f37; font-size: 9.5pt; }

        /* ── HEADER ── */
        .prt-header { border-bottom: 2.5px solid #000; padding-bottom: 14px; margin-bottom: 14px; text-align: center; }
        .prt-logo { height: 96px; width: auto; object-fit: contain; display: inline-block; }

        /* ── EXAM TITLE ── */
        .prt-title-block { text-align: center; border-bottom: 1px solid #000; padding: 12px 0 10px; margin-bottom: 14px; }
        .prt-exam-name { font-size: 15pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 3px; line-height: 1.3; }
        .prt-exam-meta { font-size: 9.5pt; font-weight: 700; border: 1px solid #888; display: inline-flex; overflow: hidden; border-radius: 2px; margin-top: 8px; }
        .prt-exam-meta-item { padding: 4px 16px; border-right: 1px solid #888; letter-spacing: 0.04em; }
        .prt-exam-meta-item:last-child { border-right: none; }

        /* ── CANDIDATE BOX ── */
        .prt-candidate-box { border: 1px solid #777; padding: 10px 14px 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
        .prt-field { display: flex; align-items: flex-end; gap: 6px; font-size: 9.5pt; padding-bottom: 1px; }
        .prt-field-label { white-space: nowrap; font-weight: 700; min-width: 52px; line-height: 1.8; }
        .prt-field-line { flex: 1; border-bottom: 1px solid #555; height: 16px; }

        /* ── INSTRUCTIONS ── */
        .prt-instr { border: 1px solid #333; border-left: 4px solid #000; padding: 7px 12px; margin-bottom: 16px; font-size: 9pt; background: #fafafa; }
        .prt-instr p { margin: 0; line-height: 1.75; }

        /* ── SECTION HEADING ── */
        .prt-section-heading { text-align: center; font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 16px 0 14px; }

        /* ── QUESTIONS ── */
        .prt-question { margin-bottom: 14px; page-break-inside: avoid; break-inside: avoid; }
        .prt-q-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 5px; }
        .prt-q-num { font-weight: 700; min-width: 22px; flex-shrink: 0; font-size: 10.5pt; padding-top: 1px; }
        .prt-q-text { flex: 1; font-weight: 600; font-size: 10.5pt; line-height: 1.55; }
        .prt-q-img { display: block; max-width: 260px; height: auto; margin: 5px 0 6px 30px; border: 1px solid #ccc; }
        .prt-options-grid { padding-left: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
        .prt-opt { font-size: 10pt; padding: 1px 0; line-height: 1.5; }
        .prt-q-divider { border: none; border-top: 1px dashed #ddd; margin: 10px 0 0; }

        /* ── FOOTER ── */
        .prt-footer { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 7.5pt; color: #666; gap: 8px; }
        .prt-footer-center { flex: 1; text-align: center; font-style: italic; }
        .prt-footer-right { text-align: right; }
        .prt-page-note { text-align: center; font-size: 8pt; color: #999; margin-top: 6px; font-style: italic; }

        /* ─────────────────────────────────────────────
           PRINT MEDIA
        ───────────────────────────────────────────── */
        @media print {
          @page { size: A4 portrait; margin: 1.6cm 1.4cm 1.4cm 1.4cm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { margin: 0; padding: 0; background: #fff !important; }

          /* Hide EVERYTHING except the print page */
          body > * { display: none !important; }
          body > #root { display: block !important; }

          /* Hide navbar and any non-print UI inside root */
          nav, header,
          [class*="navbar"], [class*="Navbar"],
          .prt-topbar { display: none !important; }

          .prt-page { padding: 0 !important; background: #fff !important; display: block !important; }
          .prt-paper {
            box-shadow: none !important; border: none !important;
            border-radius: 0 !important; padding: 0 !important;
            max-width: 100% !important; margin: 0 !important;
          }
          .prt-question { page-break-inside: avoid; break-inside: avoid; }
          .prt-q-divider { display: none; }
          .prt-instr, .prt-wa-note, .prt-wa-bottom { background: #fff !important; }
        }
      `}</style>

      <div className="prt-page">

        {/* ── SCREEN TOP BAR ── */}
        <div className="prt-topbar">
          <div className="prt-topbar-left">
            <div className="prt-topbar-badge">
              <span className="prt-topbar-badge-dot" />
              Print Preview
            </div>
            <div className="prt-topbar-info">
              <strong>60 Questions</strong> · A4 Portrait · SS Academy · Watermark
            </div>
          </div>
          <div className="prt-topbar-btns">
            <button className="prt-print-btn" onClick={handlePrint}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Save PDF
            </button>
            <button className="prt-close-btn" onClick={onClose}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12"/>
              </svg>
              Close
            </button>
          </div>
        </div>

        {/* ── PRINTABLE PAPER ── */}
        <div className="prt-paper">
          <div className="prt-watermark">SS Academy</div>

          <div className="prt-content">

            {/* TOP WHATSAPP NOTE */}
            <div className="prt-wa-note">
              <svg style={{ flexShrink: 0, width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
                <path d="M8.5 8.5c.2-.4.7-.7 1.1-.7.3 0 .5.1.7.3l1 2c.1.3 0 .6-.2.8l-.5.5c.4.8 1 1.5 1.8 1.8l.5-.5c.2-.2.5-.3.8-.2l2 1c.2.1.3.4.3.7 0 .4-.3.9-.7 1.1-.8.4-2.1.3-3.5-1.1C9.8 12.5 8.1 10.1 8.5 8.5z" fill="#fff"/>
              </svg>
              <span>
                📌 {WHATSAPP_NOTE} &nbsp;
                <span className="prt-wa-number">📱 9813056161</span>
              </span>
            </div>

            {/* HEADER */}
            <div className="prt-header">
              <img src={ssacademybranding} alt="SS Academy" className="prt-logo" />
            </div>

            {/* EXAM TITLE */}
            <div className="prt-title-block">
              <div className="prt-exam-name">Nepali Army Officer Cadet Preparation IQ Test</div>
              <div className="prt-exam-meta">
                <div className="prt-exam-meta-item">Subject: Intelligence Quotient</div>
                <div className="prt-exam-meta-item">Time Allowed: 30 Minutes</div>
                <div className="prt-exam-meta-item">Full Marks: 60</div>
                <div className="prt-exam-meta-item">Pass Mark: 24</div>
              </div>
            </div>

            {/* CANDIDATE FIELDS */}
            <div className="prt-candidate-box">
              <div className="prt-field"><span className="prt-field-label">Name:</span><div className="prt-field-line" /></div>
              <div className="prt-field"><span className="prt-field-label">Phone:</span><div className="prt-field-line" /></div>
              <div className="prt-field"><span className="prt-field-label">Date:</span><div className="prt-field-line" style={{ maxWidth: 130 }} /></div>
              <div className="prt-field"><span className="prt-field-label">Roll No:</span><div className="prt-field-line" style={{ maxWidth: 130 }} /></div>
              <div className="prt-field" style={{ gridColumn: "1 / -1" }}>
                <span className="prt-field-label">Score:</span>
                <div className="prt-field-line" style={{ maxWidth: 70 }} />
                <span style={{ marginLeft: 28, fontWeight: 700, whiteSpace: "nowrap" }}>Examiner's Signature:</span>
                <div className="prt-field-line" />
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="prt-instr">
              <p>
                <strong>Instructions:</strong>&ensp;
                Attempt <em>all questions</em>. Each correct answer carries <strong>1 mark</strong>.
                There is <strong>no negative marking</strong>. Time allowed: <strong>30 minutes</strong>.
                Write your chosen letter (A / B / C / D / E) in the blank beside each question.
                Calculators and electronic devices are strictly prohibited.
              </p>
            </div>

            {/* SECTION HEADING */}
            <div className="prt-section-heading">
              Section A, B &amp; C &mdash; All Questions &nbsp;(60 Questions · 60 Marks)
            </div>

            {/* QUESTIONS */}
            {questions.map((q, idx) => (
              <div className="prt-question" key={q.id}>
                <div className="prt-q-row">
                  <span className="prt-q-num">{idx + 1}.</span>
                  <span className="prt-q-text">{q.text}</span>
                  <div className="prt-q-blank" />
                </div>
                {q.isImage && (
                  <img src={imageMap[q.imageIndex!]} alt={`Q${q.id} diagram`} className="prt-q-img" />
                )}
                <div className="prt-options-grid">
                  {q.options.map((opt, i) => (
                    <div key={i} className="prt-opt"><strong>{optionLetters[i]})</strong>&ensp;{opt}</div>
                  ))}
                </div>
                {idx < questions.length - 1 && <hr className="prt-q-divider" />}
              </div>
            ))}

            {/* FOOTER */}
            <div className="prt-footer">
              <span>SS Academy · The Colonel's Academy</span>
              <span className="prt-footer-center">This paper is the intellectual property of SS Academy. Not for resale or redistribution.</span>
              <span className="prt-footer-right">Printed: {today}</span>
            </div>
            <div className="prt-page-note">— End of Examination Paper —</div>

            {/* BOTTOM WHATSAPP NOTE */}
            <div className="prt-wa-bottom">
              <svg style={{ flexShrink: 0, width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
                <path d="M8.5 8.5c.2-.4.7-.7 1.1-.7.3 0 .5.1.7.3l1 2c.1.3 0 .6-.2.8l-.5.5c.4.8 1 1.5 1.8 1.8l.5-.5c.2-.2.5-.3.8-.2l2 1c.2.1.3.4.3.7 0 .4-.3.9-.7 1.1-.8.4-2.1.3-3.5-1.1C9.8 12.5 8.1 10.1 8.5 8.5z" fill="#fff"/>
              </svg>
              <span>
                📌 {WHATSAPP_NOTE} &nbsp;
                <span style={{ color: "#1a7f37", fontWeight: 800 }}>📱 9813056161</span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}