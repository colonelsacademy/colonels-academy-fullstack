"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Award, BookOpen, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MagneticButton = ({
  children,
  onClick,
  className
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    x.set((clientX - (left + width / 2)) * 0.3);
    y.set((clientY - (top + height / 2)) * 0.3);
  };

  return (
    <motion.button
      type="button"
      ref={ref}
      style={{ x: mouseX, y: mouseY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// TODO: swap with real 10-sec welcome clip from retired Colonel speaker.
const WELCOME_VIDEO_POSTER =
  "https://uat.thecolonelsacademy.com/images/instructors/Rajesh%20Thapa.png";
const WELCOME_VIDEO_SRC = "https://ca-assets.b-cdn.net/videos/staff-college-welcome.mp4";

const StaffCollegeHero = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="w-full pt-6 pb-20 relative overflow-hidden">
      {/* Ambient gradient mist background tracking the user's sleek grey/blush aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white_60%,transparent_100%)]">
        {/* Base cool grey wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EBEDEE] via-[#D8DBDE] to-[#C9CBCF] opacity-90" />
        {/* Subtle rose/morning light bloom on the right */}
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E0CDD1]/90 via-[#D8DBDE]/20 to-transparent blur-[80px]" />
        {/* Brightness lift on the far left to keep it misty and fresh */}
        <div className="absolute top-0 left-[-10%] w-[50%] h-[100%] bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mt-8">
          {/* Left: copy */}
          <div className="flex flex-col items-start text-left fade-in-up">
            <div className="mb-6 fade-in-up [animation-delay:100ms]">
              <span className="bg-[#0B1120] text-white text-[11px] sm:text-[12px] font-black tracking-[0.22em] uppercase px-5 py-3 rounded-xl shadow-md border border-gray-800 flex items-center gap-2 font-['Rajdhani']">
                <Award className="w-4 h-4" />
                <span>Nepal Army • Command &amp; Staff College • Intake 2083</span>
              </span>
            </div>

            <h1 className="mb-6 fade-in-up [animation-delay:200ms]">
              <span className="block text-fluid-hero font-extrabold text-[#0B1120] tracking-tight leading-[1.05] mb-1 font-['Rajdhani']">
                From Staff
              </span>
              <span className="block text-fluid-hero font-extrabold text-[#0B1120] tracking-tight leading-[1.05] mb-1 font-['Rajdhani']">
                to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600 relative">
                  Command.
                  <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-gradient-to-r from-blue-700 to-red-600 origin-left animate-scale-x-in [animation-delay:800ms] rounded-full opacity-80" />
                </span>
              </span>
            </h1>

            <p className="text-fluid-lg text-gray-600 max-w-xl leading-relaxed mb-8 font-medium fade-in-up [animation-delay:400ms]">
              A <span className="text-[#0B1120] font-bold">6-month hybrid programme</span>,
              engineered by serving and retired Generals, for the officers who will lead
              Nepal&apos;s next decade of defence.
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-10 fade-in-up [animation-delay:500ms]">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-gray-700 text-sm font-semibold">4.9 faculty rating</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-700 text-sm font-semibold">14 days to intake</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-semibold">
                  <span className="text-[#0F1C15] font-bold">120</span> seats
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto fade-in-up [animation-delay:600ms]">
              <MagneticButton
                onClick={() => router.push("/checkout")}
                className="group w-full sm:w-auto px-8 py-5 bg-[#0B1120] text-white rounded-xl font-bold text-base tracking-wider uppercase shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Award className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
                <span>Enroll Now</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => {
                  document
                    .getElementById("course-syllabus")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="group w-full sm:w-auto px-8 py-5 bg-white/50 backdrop-blur-sm text-gray-900 border border-gray-200 rounded-xl font-bold text-base tracking-wider uppercase shadow-sm hover:shadow-md hover:bg-white flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>View Full Syllabus</span>
              </MagneticButton>
            </div>

            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#0B1120] transition-colors"
            >
              Back to main gateway
            </Link>
          </div>

          {/* Right: video card */}
          <div className="relative fade-in-up [animation-delay:300ms]">
            <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden bg-[#0F1C15] shadow-2xl border border-gray-200 group">
              <video
                ref={videoRef}
                poster={WELCOME_VIDEO_POSTER}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                preload="metadata"
                controls={playing}
              >
                <source src={WELCOME_VIDEO_SRC} type="video/mp4" />
                <track
                  kind="captions"
                  src="/captions/staff-college-welcome.vtt"
                  srcLang="en"
                  label="English captions"
                  default
                />
              </video>

              {!playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play welcome message"
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0F1C15]/70 via-[#0F1C15]/20 to-transparent cursor-pointer group"
                >
                  <span className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#D4AF37] text-[#0F1C15] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2} />
                  </span>
                </button>
              )}

              {!playing && (
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 pointer-events-none">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] font-['Rajdhani'] mb-1">
                      Welcome Address · 0:10
                    </div>
                    <div className="text-white font-bold font-['Rajdhani'] text-xl md:text-2xl leading-tight drop-shadow">
                      Col. (Rtd.) S.B. Basnet
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      Directing Staff · Command &amp; Staff 2083
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#D4AF37] text-[#0F1C15] text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow font-['Rajdhani']">
                    Watch
                  </span>
                </div>
              )}
            </div>

            {/* Subtle corner accents */}
            <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-[2rem] pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-[2rem] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffCollegeHero;
