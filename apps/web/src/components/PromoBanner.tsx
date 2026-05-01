"use client";

import { Clock, X } from "lucide-react";
import { useEffect, useState } from "react";

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: 3, m: 35, s: 46 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-100 text-gray-800 text-xs sm:text-sm py-3 px-4 relative z-[60]">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center sm:text-left">
        {/* Timer Section */}
        <div className="font-bold flex items-center gap-2 text-red-600 tracking-widest font-mono shrink-0 bg-red-50 px-2 py-0.5 rounded border border-red-100">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-bold uppercase text-[10px] sm:text-xs text-red-800">Ends in</span>
          <span>{String(timeLeft.h).padStart(2, "0")}h</span> :{" "}
          <span>{String(timeLeft.m).padStart(2, "0")}m</span> :{" "}
          <span>{String(timeLeft.s).padStart(2, "0")}s</span>
        </div>

        {/* Text Content */}
        <div className="flex-1 leading-tight">
          <span className="text-gray-600 font-medium">New to the academy?</span>
          <span className="hidden sm:inline mx-3 text-gray-300">|</span>
          <span className="font-bold text-gray-900">Shop now to get a limited time offer:</span>
          <span className="ml-1 text-gray-600">
            Courses starting from{" "}
            <span className="text-gray-900 font-bold decoration-amber-400 underline underline-offset-4 decoration-2">
              NPR 1,500
            </span>
          </span>
        </div>

        {/* CTA Link */}
        <button
          type="button"
          className="hidden sm:block font-bold text-gray-900 hover:text-blue-700 hover:underline transition-all whitespace-nowrap"
        >
          View Subscription &rarr;
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-2 sm:top-1/2 sm:-translate-y-1/2 p-1.5 hover:bg-gray-200/50 rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
