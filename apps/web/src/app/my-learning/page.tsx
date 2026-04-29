"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import type { EnrolledCourse } from "@colonels-academy/contracts";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Play,
  Radio,
  Star,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type LiveSession = {
  id: string;
  courseSlug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: string;
  meetingUrl: string | null;
  replayAvailable: boolean;
};

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const start = new Date(targetDate).getTime();
      const diff = start - now;
      if (diff <= 0) { setIsLive(true); setTimeLeft("LIVE NOW"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return { timeLeft, isLive };
}

function LiveBanner({ session }: { session: LiveSession }) {
  const { timeLeft, isLive } = useCountdown(session.startsAt);
  return (
    <div className={`rounded-2xl p-5 flex items-center justify-between gap-4 ${isLive ? "bg-red-600" : "bg-[#0F1C15] border border-[#D4AF37]/30"}`}>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-white/20" : "bg-[#D4AF37]/20"}`}>
          {isLive ? <Radio className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-[#D4AF37]" />}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isLive ? "text-white/70" : "text-[#D4AF37]"}`}>
            {isLive ? "🔴 Live Now" : "⏰ Starting Soon"}
          </p>
          <p className={`font-bold text-sm ${isLive ? "text-white" : "text-white"}`}>{session.title}</p>
          <p className={`text-xs mt-0.5 ${isLive ? "text-white/70" : "text-gray-400"}`}>
            {new Date(session.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {new Date(session.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xl font-black font-['Rajdhani'] ${isLive ? "text-white" : "text-[#D4AF37]"}`}>{timeLeft}</span>
        {session.meetingUrl && (
          <a href={session.meetingUrl} target="_blank" rel="noreferrer"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${isLive ? "bg-white text-red-600" : "bg-[#D4AF37] text-[#0F1C15]"}`}>
            <ExternalLink className="w-3.5 h-3.5" />
            {isLive ? "Join Now" : "Join"}
          </a>
        )}
      </div>
    </div>
  );
}

function CircleProgress({ percent, size = 80, stroke = 6, color = "#D4AF37" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

function CourseCard({ enrollment }: { enrollment: EnrolledCourse }) {
  const weekNum = enrollment.enrolledAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(enrollment.enrolledAt).getTime()) / (7 * 24 * 3600000)))
    : 1;
  const done = enrollment.progressPercent >= 100;

  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "https://cdn.thecolonelsacademy.com";
  const imageUrl = enrollment.heroImageUrl
    ? enrollment.heroImageUrl.startsWith("http")
      ? enrollment.heroImageUrl
      : `${cdnUrl}${enrollment.heroImageUrl}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-[#0F1C15] overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={enrollment.courseTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-[#D4AF37]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Week badge */}
        <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#0F1C15] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          Week {weekNum}
        </div>
        {done && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Complete
          </div>
        )}
        {/* Progress overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <div className="flex justify-between text-white text-[10px] mb-1 font-medium">
            <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
            <span className="font-bold">{enrollment.progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-400" : "bg-[#D4AF37]"}`}
              style={{ width: `${enrollment.progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start gap-1 mb-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= 4 ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-200 fill-gray-200"}`} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">4.8</span>
        </div>
        <h4 className="font-bold text-[#0F1C15] text-sm leading-snug line-clamp-2 font-['Rajdhani'] mb-3">
          {enrollment.courseTitle}
        </h4>
        <div className="flex items-center justify-between">
          {enrollment.lastAccessedAt && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              {new Date(enrollment.lastAccessedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
          )}
          <Link href={`/classroom/${enrollment.courseSlug}`}
            className={`ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              done ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-[#0F1C15] hover:bg-[#D4AF37] hover:text-[#0F1C15] text-white"
            }`}>
            <Play className="w-3 h-3 fill-current" />
            {done ? "Review" : "Continue"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, authenticated, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) { setLoading(false); return; }
    async function load() {
      try {
        const [eRes, lRes] = await Promise.all([
          fetch("/api/learning/enrollments", { credentials: "include", cache: "no-store" }),
          fetch("/api/learning/live-sessions", { cache: "no-store" }),
        ]);
        if (eRes.ok) { const d = await eRes.json(); setEnrollments(d.items ?? []); }
        if (lRes.ok) { const d = await lRes.json(); setLiveSessions(d.items ?? []); }
      } catch { /* fallback */ } finally { setLoading(false); }
    }
    load();
  }, [authenticated]);

  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length) : 0;
  const completedLessons = enrollments.reduce((s, e) => s + e.completedLessons, 0);
  const totalLessons = enrollments.reduce((s, e) => s + e.totalLessons, 0);
  const now = new Date();
  const imminent = liveSessions.filter(s => new Date(s.endsAt) > now && new Date(s.startsAt) < new Date(now.getTime() + 24 * 3600000));
  const upcoming = liveSessions.filter(s => new Date(s.startsAt) > new Date(now.getTime() + 24 * 3600000)).slice(0, 4);
  const greetingName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Cadet";

  if (authLoading) return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
      <div className="text-center">
        <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">Sign In Required</h2>
        <p className="text-gray-500 mb-6">Please sign in to access your learning dashboard.</p>
        <Link href="/login" className="px-8 py-3 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-xl uppercase tracking-wider">HQ Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-6">

        {/* Live banners */}
        {imminent.map(s => <LiveBanner key={s.id} session={s} />)}

        {/* Header */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0F1C15] font-['Rajdhani'] uppercase">
            Welcome back, {greetingName}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Courses */}
          <div className="lg:col-span-2 space-y-5">

            {/* Enrolled Courses header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-black text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wide text-lg">
                  Enrolled Courses
                </h2>
                <span className="w-6 h-6 rounded-full bg-[#0F1C15] text-white text-[10px] font-black flex items-center justify-center">
                  {enrollments.length}
                </span>
              </div>
              <Link href="/courses" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0F1C15] font-bold transition-colors">
                Browse All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-[#0F1C15] font-['Rajdhani'] text-lg mb-1">No courses yet</h3>
                <p className="text-gray-400 text-sm mb-5">Start your training by enrolling in a course.</p>
                <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F1C15] text-white font-bold rounded-xl text-sm hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors">
                  <BookOpen className="w-4 h-4" /> Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {enrollments.map(e => <CourseCard key={e.enrollmentId} enrollment={e} />)}
              </div>
            )}

            {/* Upcoming Live Classes (below courses) */}
            {upcoming.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-black text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wide text-sm">
                    Upcoming Live Classes
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {upcoming.map(s => (
                    <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#0F1C15] text-sm">{s.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(s.startsAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                            {" · "}
                            {new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      {s.meetingUrl && (
                        <a href={s.meetingUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors shrink-0">
                          <ExternalLink className="w-3 h-3" /> Join
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Stats sidebar */}
          <div className="space-y-4">

            {/* Progress card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wide text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Progress
                </h3>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <CircleProgress percent={overallProgress} size={120} stroke={8} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#0F1C15] font-['Rajdhani']">{overallProgress}%</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">Overall</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F3F4F6] rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-[#0F1C15] font-['Rajdhani']">{completedLessons}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Completed</div>
                </div>
                <div className="bg-[#F3F4F6] rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-[#0F1C15] font-['Rajdhani']">{totalLessons - completedLessons}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Remaining</div>
                </div>
              </div>
            </div>

            {/* Achievement card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wide text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" /> Achievement
                </h3>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Attendance", value: Math.min(100, overallProgress + 10), color: "#D4AF37" },
                  { label: "Completion", value: overallProgress, color: "#0F1C15" },
                ].map(a => (
                  <div key={a.label} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <CircleProgress percent={a.value} size={72} stroke={6} color={a.color} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-black text-[#0F1C15] font-['Rajdhani']">{a.value}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's focus */}
            <div className="bg-[#0F1C15] rounded-2xl p-6 text-white">
              <h3 className="font-black font-['Rajdhani'] uppercase tracking-wide text-sm text-[#D4AF37] mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Today's Focus
              </h3>
              {enrollments.length === 0 ? (
                <p className="text-xs text-gray-400">Enroll in a course to see your daily focus.</p>
              ) : (
                <div className="space-y-3">
                  {enrollments.slice(0, 2).map(e => (
                    <Link key={e.enrollmentId} href={`/classroom/${e.courseSlug}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white line-clamp-1">{e.courseTitle}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{e.progressPercent}% complete</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#D4AF37] transition-colors shrink-0" />
                    </Link>
                  ))}
                  <p className="text-[10px] text-gray-500 text-center pt-1">Weekly schedule coming soon</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
