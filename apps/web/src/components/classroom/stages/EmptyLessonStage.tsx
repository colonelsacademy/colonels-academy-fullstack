"use client";

import { Play } from "lucide-react";

export function EmptyLessonStage({ courseTitle }: { courseTitle: string }) {
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        {/* Pulsing play button */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center animate-pulse">
            <Play className="w-10 h-10 text-[#D4AF37]/60" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 animate-ping" />
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-2 w-32 bg-gray-700/50 rounded-full animate-pulse" />
          <p className="text-gray-400 text-sm font-medium">Loading lesson...</p>
        </div>
        
        {/* Fake progress bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#D4AF37]/40 rounded-full"
            style={{
              animation: 'loading 2s ease-in-out infinite',
            }} 
          />
        </div>
      </div>
      
      {/* Add keyframe animation */}
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 75%; margin-left: 12.5%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
