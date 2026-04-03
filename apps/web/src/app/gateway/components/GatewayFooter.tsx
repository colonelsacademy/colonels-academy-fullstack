import { Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

export const GatewayCTA = () => {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative">
        {/* Main Card */}
        <div className="relative bg-[#0B120F] rounded-[4rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            {/* Icon Box */}
            <div className="w-24 h-24 shrink-0 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <Compass className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
            </div>

            {/* Text Content */}
            <div className="space-y-3 max-w-lg font-rajdhani">
              <h4 className="text-3xl md:text-5xl font-bold font-rajdhani text-white leading-[1.1] tracking-tight">
                Lost in the <br className="hidden md:block" />
                <span className="text-[#D4AF37]">Selection Process?</span>
              </h4>
              <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm mx-auto md:mx-0 opacity-80">
                Get a personalized roadmap from retired officers who have been in the selection
                board.
              </p>
            </div>
          </div>

          {/* Action Link: Now using Next.js Link instead of router hook */}
          <Link
            href="/contact"
            className="group/btn relative z-10 flex items-center gap-4 pl-10 pr-8 py-5 bg-white text-gray-900 rounded-full font-black uppercase tracking-[0.1em] text-sm shadow-xl shadow-white/5 hover:shadow-white/10 hover:scale-105 transition-all active:scale-95 shrink-0"
          >
            <span>Talk to Us</span>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover/btn:bg-gray-200 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
