import { getInstructors } from "@/lib/api";
import { ChevronRight, Star, Users } from "lucide-react";
import Link from "next/link";

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="bg-[#0F1C15] py-16 px-4 text-center">
        <h1 className="text-5xl font-bold text-white font-['Rajdhani'] uppercase tracking-tight mb-3">
          Meet Your Instructors
        </h1>
        <p className="text-gray-400 font-medium">
          Learn from the officers who have been in the selection board.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <div
              key={instructor.slug}
              className="relative h-[500px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute inset-0">
                {instructor.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instructor.avatarUrl}
                    alt={instructor.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0F1C15] to-[#1a2e20] flex items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-6xl">
                      {instructor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C15]/90 via-[#0F1C15]/40 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col gap-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-[#D4AF37] text-[#0F1C15] text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {instructor.specialization.split(" ").slice(0, 2).join(" ")}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white">
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-3xl font-bold text-white font-['Rajdhani'] leading-none mb-2">
                    {instructor.name}
                  </h4>
                  <p className="text-white/70 text-sm font-medium tracking-wide">
                    {instructor.specialization}
                  </p>
                </div>

                <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3 italic">
                    {instructor.bio}
                  </p>
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">1,200+</span>
                      <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest">
                        Students
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{instructor.experience}</span>
                      <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest">
                        Experience
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">
                    Mission Dossier
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0F1C15] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0F1C15] text-white font-bold rounded-2xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-all"
          >
            <Users className="w-5 h-5" />
            Explore Our Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
