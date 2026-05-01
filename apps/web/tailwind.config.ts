import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Oswald", "sans-serif"],
        mono: ["Rajdhani", "monospace"]
      },
      colors: {
        army: {
          light: "#F4F7F5",
          main: "#4F772D",
          dark: "#1F3325",
          accent: "#D4AF37",
          "accent-dark": "#B89626"
        },
        police: {
          light: "#F0F4F8",
          main: "#1E3A8A",
          dark: "#0F172A",
          accent: "#38BDF8"
        },
        apf: {
          light: "#FFF5F5",
          main: "#B91C1C",
          dark: "#450A0A",
          accent: "#F97316"
        }
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
    ({
      addUtilities
    }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) => {
      addUtilities({
        ".glass-panel": {
          background: "rgba(255, 255, 255, 0.7)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        },
        ".text-fluid-sm": { "font-size": "var(--text-fluid-sm)" },
        ".text-fluid-base": { "font-size": "var(--text-fluid-base)" },
        ".text-fluid-lg": { "font-size": "var(--text-fluid-lg)" },
        ".text-fluid-xl": { "font-size": "var(--text-fluid-xl)" },
        ".text-fluid-2xl": { "font-size": "var(--text-fluid-2xl)" },
        ".text-fluid-3xl": { "font-size": "var(--text-fluid-3xl)" },
        ".text-fluid-4xl": { "font-size": "var(--text-fluid-4xl)" },
        ".text-fluid-5xl": { "font-size": "var(--text-fluid-5xl)" },
        ".text-fluid-hero": { "font-size": "var(--text-fluid-hero)" },
        ".text-fluid-display": { "font-size": "var(--text-fluid-display)" },
        ".p-fluid-section": { padding: "var(--space-fluid-section)" },
        ".p-fluid-xl": { padding: "var(--space-fluid-xl)" },
        ".gap-fluid-md": { gap: "var(--space-fluid-md)" },
        ".gap-fluid-lg": { gap: "var(--space-fluid-lg)" }
      });
    }
  ]
};

export default config;
