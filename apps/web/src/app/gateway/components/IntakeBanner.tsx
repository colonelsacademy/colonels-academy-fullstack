"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getOptimizedAssetUrl } from "@/utils/assetUtils";

const INTAKE_SCHEDULE = [
  {
    id: "army-cadet",
    label: "Nepal Army",
    title: "Officer Cadet 2083",
    subtitle: "Lead with Honor and Courage.",
    image: getOptimizedAssetUrl("/images/army-logo.png", { width: 160, quality: 82 }),
    applyBy: "Falgun 30",
    written: "Chaitra 15",
    physical: "Baisakh 25"
  },
  {
    id: "army-staff",
    label: "Nepal Army",
    title: "Staff College 2083",
    subtitle: "Strategic Leadership Mastery.",
    image: getOptimizedAssetUrl("/images/army-logo.png", { width: 160, quality: 82 }),
    applyBy: "Magh 30",
    written: "Falgun 15",
    physical: "Chaitra 20"
  },
  {
    id: "police-insp",
    label: "Nepal Police",
    title: "Inspector 2083",
    subtitle: "Serve with Truth and Integrity.",
    image: getOptimizedAssetUrl("/images/police-logo.png", { width: 160, quality: 82 }),
    applyBy: "Falgun 10",
    written: "Chaitra 05",
    physical: "Baisakh 15"
  },
  {
    id: "police-asi",
    label: "Nepal Police",
    title: "Sub-Inspector ASI 2083",
    subtitle: "Dedicated to Public Safety.",
    image: getOptimizedAssetUrl("/images/police-logo.png", { width: 160, quality: 82 }),
    applyBy: "Falgun 15",
    written: "Chaitra 10",
    physical: "Baisakh 20"
  },
  {
    id: "apf-insp",
    label: "APF Nepal",
    title: "APF Inspector 2083",
    subtitle: "Security, Peace, Commitment.",
    image: getOptimizedAssetUrl("/images/apf-logo.png", { width: 160, quality: 82 }),
    applyBy: "Falgun 25",
    written: "Chaitra 15",
    physical: "Baisakh 30"
  }
];

const IntakeBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const current = INTAKE_SCHEDULE[currentIndex]!;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INTAKE_SCHEDULE.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden relative group max-w-5xl mx-auto w-full fade-in-up [animation-delay:800ms]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 bg-[radial-gradient(circle_at_1px_1px,_rgba(17,24,39,0.06)_1px,_transparent_0)] bg-[size:14px_14px] relative">
        {/* Logo + Program */}
        <div className="flex items-start gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.label}
                decoding="async"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </motion.div>
          </AnimatePresence>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                {current.label}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-black text-gray-900 font-rajdhani uppercase tracking-tight">
                  {current.title}
                </h2>
                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                  {current.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-gray-200 flex-shrink-0" />

        {/* Recruitment timeline */}
        <div className="flex items-center justify-center gap-6 lg:gap-10">
          {[
            { key: "applyBy", label: "Submit Form" },
            { key: "written", label: "Written Exam" },
            { key: "physical", label: "Result / Physical" }
          ].map((item, i) => (
            <div key={item.key} className="flex items-center gap-6 lg:gap-10">
              {i > 0 && (
                <ArrowRight className="w-5 h-5 text-gray-200 hidden sm:block flex-shrink-0" />
              )}
              <div className="text-center min-w-[80px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${current.id}-${item.key}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <div className="font-bold text-gray-900 text-xl font-['Rajdhani'] leading-none">
                      {current[item.key as keyof typeof current]}
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntakeBanner;
