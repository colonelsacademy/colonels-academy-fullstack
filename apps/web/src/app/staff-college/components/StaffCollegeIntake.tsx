import { ArrowRight } from "lucide-react";

const CDN = "https://ca-assets.b-cdn.net";

const intake = {
  label: "Nepal Army",
  title: "Staff College 2083",
  subtitle: "Strategic Leadership Mastery.",
  image: `${CDN}/images/army-logo.png?width=160&quality=82`,
  applyBy: "Magh 30",
  written: "Falgun 15",
  physical: "Chaitra 20"
};

const timeline: { key: "applyBy" | "written" | "physical"; label: string }[] = [
  { key: "applyBy", label: "Submit Form" },
  { key: "written", label: "Written Exam" },
  { key: "physical", label: "Result / Physical" }
];

export const StaffCollegeIntake = () => {
  return (
    <section className="py-16">
      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative max-w-5xl mx-auto w-full fade-in-up">
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 bg-[radial-gradient(circle_at_1px_1px,_rgba(17,24,39,0.06)_1px,_transparent_0)] bg-[size:14px_14px] relative">
          {/* Logo + Program */}
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={intake.image}
                alt={intake.label}
                decoding="async"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                  {intake.label}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 font-rajdhani uppercase tracking-tight">
                {intake.title}
              </h2>
              <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{intake.subtitle}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200 flex-shrink-0" />

          {/* Recruitment timeline */}
          <div className="flex items-center justify-center gap-6 lg:gap-10">
            {timeline.map((item, i) => (
              <div key={item.key} className="flex items-center gap-6 lg:gap-10">
                {i > 0 && (
                  <ArrowRight className="w-5 h-5 text-gray-200 hidden sm:block flex-shrink-0" />
                )}
                <div className="text-center min-w-[80px]">
                  <div className="font-bold text-gray-900 text-xl font-['Rajdhani'] leading-none">
                    {intake[item.key]}
                  </div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
