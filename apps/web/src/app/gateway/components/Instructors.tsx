import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { MENTORS, type Category } from '@/data/gateway';
import ImageWithSkeleton from '@/components/ui/ImageWithSkeleton';
import { db } from '@colonels-academy/database';

interface InstructorsProps {
  activeTab: Category;
}

export const Instructors = async ({ activeTab = 'all' }: InstructorsProps) => {
  // Mapping UI categories to DB branch names
  const branchMap: Record<string, string> = {
    army: 'Nepal Army',
    police: 'Nepal Police',
    apf: 'APF Nepal',
  };

  // Fetch from Database
  const branchName = activeTab !== 'all' ? branchMap[activeTab] : undefined;
  const dbInstructors = await db.instructor.findMany({ 
    where: branchName ? { branch: branchName } : {},
    orderBy: { createdAt: 'desc' }
  });

  // Merge with static data for metrics (rating, etc.) or use fallback
  const mentors = dbInstructors.map(dbM => {
    // Find existing static mentor for metrics fallback
    const staticFallback = MENTORS.find(m => m.name === dbM.name);
    return {
      name: dbM.name,
      rank: dbM.branch,
      experience: dbM.experienceLabel,
      specialization: dbM.specialization,
      image: dbM.avatarUrl || '/images/placeholder-avatar.jpg',
      category: activeTab,
      rating: staticFallback?.rating || 4.8,
      reviews: staticFallback?.reviews || 1200,
      students: staticFallback?.students || 500,
      courses: staticFallback?.courses || 4,
      bio: dbM.bio
    };
  });

  const tabs = [
    { id: 'all', label: 'All Instructors' },
    { id: 'army', label: 'Nepal Army' },
    { id: 'police', label: 'Nepal Police' },
    { id: 'apf', label: 'APF Nepal' },
  ];

  if (mentors.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500 font-medium">No instructors found for this category.</p>
      </div>
    );
  }

  return (
    <div id="mentors" className="py-12 mt-20 font-rajdhani">
      {/* Header & tabs */}
      <div className="flex flex-col items-center justify-center gap-6 mb-12 text-center">
        <div>
          <h3 className="text-4xl font-bold text-[#0F1C15] font-rajdhani mb-2">Meet Your Instructors</h3>
          <p className="text-gray-500 font-medium tracking-wide font-sans">Learn from the officers who have been in the selection board.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-gray-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/?mentorCategory=${tab.id}`}
                scroll={false}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive ? 'bg-[#0F1C15] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((m, index) => (
            <div
              key={m.name}
              className={`relative h-[500px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={m.image}
                  alt={m.name}
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  widths={[390, 640, 900]}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  skeletonClassName="rounded-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C15]/90 via-[#0F1C15]/40 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col gap-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-[#D4AF37] text-[#0F1C15] text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg font-rajdhani">
                    {m.rank}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white">
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="text-xs font-bold">{m.rating}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-3xl font-bold text-white font-rajdhani leading-none mb-2">{m.name}</h4>
                  <p className="text-white/70 text-sm font-medium tracking-wide font-sans">{m.specialization}</p>
                </div>

                <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3 italic font-sans">{m.bio}</p>
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10 font-rajdhani">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{(m.students ?? 0).toLocaleString()}</span>
                      <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest">Students</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{m.courses}</span>
                      <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest">Courses</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10 lg:border-none font-rajdhani">
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
      </div>

      {/* View all CTA */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/instructors"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#0F1C15] text-[#0F1C15] font-bold rounded-2xl hover:bg-[#0F1C15] hover:text-white transition-all transform hover:scale-105 active:scale-95 group shadow-sm font-rajdhani"
        >
          View All Instructors
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
