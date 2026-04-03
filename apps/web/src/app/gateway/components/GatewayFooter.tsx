import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

export const GatewayCTA = () => {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto relative group">
        {/* Abstract Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[3rem] blur-3xl opacity-50 transition-opacity group-hover:opacity-75" />

        <div className="relative bg-[#0F1C15] rounded-[3rem] p-fluid-section border border-white/10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left shadow-2xl">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "32px 32px"
            }}
          />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
              <Compass className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
            </div>

            <div className="space-y-2 max-w-lg">
              <h4 className="text-fluid-3xl font-bold font-['Rajdhani'] text-white leading-tight">
                Lost in the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-200">
                  Selection Process?
                </span>
              </h4>
              <p className="text-gray-400 text-lg font-medium">
                Get a personalized roadmap from retired officers who have been in the selection
                board.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="relative z-10 group/btn flex items-center gap-3 pl-8 pr-6 py-4 bg-white text-gray-900 rounded-full font-bold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] hover:scale-105 transition-all text-sm shrink-0"
          >
            <span>Talk to Us</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/btn:bg-gray-200 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
