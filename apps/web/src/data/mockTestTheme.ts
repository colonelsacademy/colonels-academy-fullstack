export const mockTestBaseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  /* Hide navbar & footer during active test to prevent accidental navigation */
  body.mocktest-active nav,
  body.mocktest-active header,
  body.mocktest-active footer,
  body.mocktest-active [class*="navbar"] {
    display: none !important;
  }

  .mt-page {
    min-height: 100vh;
    background: #F3F4F6;
    position: relative;
    font-family: inherit;
    color: #0F1C15;
    font-size: 15px;
  }

  /* Radial gold glow at top */
  .mt-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* Corner accent brackets — gold */
  .mt-corner-tl, .mt-corner-br {
    position: fixed;
    width: 80px; height: 80px;
    pointer-events: none; z-index: 0;
  }
  .mt-corner-tl {
    top: 0; left: 0;
    border-top: 2px solid rgba(212,175,55,0.25);
    border-left: 2px solid rgba(212,175,55,0.25);
  }
  .mt-corner-br {
    bottom: 0; right: 0;
    border-bottom: 2px solid rgba(212,175,55,0.25);
    border-right: 2px solid rgba(212,175,55,0.25);
  }

  /* Brand */
  .mt-brand {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; text-decoration: none; margin-bottom: 28px;
  }
  .mt-brand-icon {
    width: 30px; height: 30px; background: #0F1C15;
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(212,175,55,0.3);
  }
  .mt-brand-name {
    font-size: 18px; font-weight: 700; color: #0F1C15;
    letter-spacing: 0.05em; text-transform: uppercase;
    font-family: 'Rajdhani', sans-serif;
  }

  /* Eyebrow badge — gold */
  .mt-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(212,175,55,0.1);
    border: 1px solid rgba(212,175,55,0.25);
    border-radius: 999px; padding: 5px 16px; margin-bottom: 14px;
  }
  .mt-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #D4AF37; display: inline-block;
    animation: mt-dot-pulse 1.5s ease-in-out infinite;
  }
  @keyframes mt-dot-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
  .mt-eyebrow-text {
    font-size: 12px; font-weight: 700; color: #B8860B;
    letter-spacing: 0.18em; text-transform: uppercase;
    font-family: 'Rajdhani', sans-serif;
  }

  /* Primary button — dark green → gold on hover */
  .mt-btn-primary {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; background: #0F1C15; color: #fff;
    border: none; border-radius: 14px; padding: 17px 24px;
    font-size: 14px; font-weight: 700; letter-spacing: 0.25em;
    text-transform: uppercase; cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    font-family: 'Rajdhani', sans-serif;
    box-shadow: 0 4px 20px rgba(15,28,21,0.3);
  }
  .mt-btn-primary:hover:not(:disabled) {
    background: #D4AF37; color: #0F1C15;
    box-shadow: 0 4px 20px rgba(212,175,55,0.25);
  }
  .mt-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .mt-btn-primary:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.7; }

  /* Spinner */
  .mt-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%; border-top-color: #fff;
    animation: mt-spin 0.8s linear infinite;
  }
  @keyframes mt-spin { to { transform: rotate(360deg); } }

  /* Glass card — frosted white */
  .mt-card {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 24px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.06);
    position: relative;
  }

  /* Gold corner accents on cards */
  .mt-card::before,
  .mt-card::after {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
  }
  .mt-card::before {
    top: 14px; left: 14px;
    border-top: 1.5px solid rgba(212,175,55,0.3);
    border-left: 1.5px solid rgba(212,175,55,0.3);
  }
  .mt-card::after {
    top: 14px; right: 14px;
    border-top: 1.5px solid rgba(212,175,55,0.3);
    border-right: 1.5px solid rgba(212,175,55,0.3);
  }

  /* Footer note */
  .mt-footer-note {
    margin-top: 20px; text-align: center;
    font-size: 12px; color: #9ca3af;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    letter-spacing: 0.1em; text-transform: uppercase;
    font-family: monospace; font-weight: 700;
  }
  .mt-footer-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: rgba(212,175,55,0.4); display: inline-block;
  }

  /* HUD side decal */
  .mt-hud-decal {
    position: fixed; top: 100px; right: 24px;
    display: none;
    font-size: 11px; font-family: monospace; font-weight: 700;
    color: #9ca3af; text-transform: uppercase; letter-spacing: 0.15em;
    border-left: 2px solid rgba(212,175,55,0.25);
    padding-left: 12px;
    line-height: 2;
    z-index: 10;
  }
  @media (min-width: 1280px) { .mt-hud-decal { display: block; } }
  .mt-hud-gold { color: #D4AF37; }

  @media print {
    .mt-page::before,
    .mt-corner-tl,
    .mt-corner-br { display: none !important; }
  }
`;
