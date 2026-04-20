"use client";

import type { ReactNode } from "react";

export function StageShell({
  title,
  eyebrow,
  courseTitle,
  footerTitle,
  children
}: {
  title: string;
  eyebrow: string;
  courseTitle: string;
  footerTitle: string;
  children: ReactNode;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f6f8fa_58%,_#eaf0f5_100%)]">
      <div className="flex h-full flex-col">
        <div className="border-b-4 border-sky-400 px-8 pb-4 pt-7 md:px-14 md:pb-5 md:pt-9">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="font-['Rajdhani'] text-[clamp(2rem,1.35rem+2.2vw,4.4rem)] font-bold leading-none tracking-[0.03em] text-slate-950">
            {title}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-8 py-6 md:px-14 md:py-8">{children}</div>

        <div className="border-t-4 border-sky-400 bg-white/85 px-6 py-3 backdrop-blur-sm md:px-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 md:text-xs">
              {courseTitle}
            </p>
            <p className="font-['Rajdhani'] text-lg font-bold text-slate-950 md:text-2xl">
              {footerTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
