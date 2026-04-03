"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import type { CourseDetail } from "@colonels-academy/contracts";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DAILY_MISSIONS = [
  { id: 1, task: "Finish Lesson 24 practice questions", completed: true },
  { id: 2, task: "Review history video notes", completed: false },
  { id: 3, task: "Take the weekly checkpoint quiz", completed: false }
];

const UPCOMING_SESSIONS = [
  {
    id: 1,
    topic: "Command writing studio",
    date: "Apr 3",
    time: "1:00 PM",
    instructor: "Col. Thapa",
    type: "Live"
  },
  {
    id: 2,
    topic: "Case-analysis live drill",
    date: "Apr 4",
    time: "12:00 PM",
    instructor: "DIG Sharma",
    type: "Live"
  },
  {
    id: 3,
    topic: "Cadet aptitude sprint review",
    date: "Apr 5",
    time: "11:30 AM",
    instructor: "Col. Thapa",
    type: "Live"
  }
];

export default function DashboardPage() {
  const { user, authenticated } = useAuth();
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [missions, setMissions] = useState(DAILY_MISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { getCourses } = await import("@/lib/api");
        const data = await getCourses();
        setCourses(data.filter((c) => c.featured).slice(0, 3));
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleMission = (id: number) =>
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani'] mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-500 mb-6">Please sign in to access your learning dashboard.</p>
          <Link
            href="/login"
            className="px-8 py-3 bg-[#D4AF37] text-[#0F1C15] font-bold rounded-xl uppercase tracking-wider"
          >
            HQ Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#0F1C15] flex items-center justify-center text-[#D4AF37] font-bold text-2xl mx-auto mb-3">
                {user?.email?.charAt(0).toUpperCase() ?? "C"}
              </div>
              <h3 className="font-bold text-[#0F1C15] font-['Rajdhani'] text-lg">
                {user?.displayName ?? user?.email?.split("@")[0] ?? "Cadet"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Officer Candidate</p>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">
                    {courses.length}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Courses</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0F1C15] font-['Rajdhani']">62%</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Progress</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {[
                { icon: TrendingUp, label: "Overview", href: "/dashboard" },
                { icon: BookOpen, label: "My Courses", href: "/dashboard#courses" },
                { icon: Calendar, label: "Live Classes", href: "/dashboard#classes" },
                { icon: Target, label: "Daily Missions", href: "/dashboard#missions" }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-sm font-medium text-gray-700 hover:text-[#0F1C15] transition-colors"
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Enrolled",
                  value: courses.length,
                  icon: BookOpen,
                  color: "text-blue-600 bg-blue-50"
                },
                {
                  label: "Progress",
                  value: "62%",
                  icon: TrendingUp,
                  color: "text-emerald-600 bg-emerald-50"
                },
                {
                  label: "Live Classes",
                  value: UPCOMING_SESSIONS.length,
                  icon: Users,
                  color: "text-purple-600 bg-purple-50"
                },
                {
                  label: "Missions",
                  value: `${missions.filter((m) => m.completed).length}/${missions.length}`,
                  icon: Target,
                  color: "text-amber-600 bg-amber-50"
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-[#0F1C15] font-['Rajdhani']">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Learning */}
            <div
              id="courses"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wider">
                  Continue Learning
                </h2>
                <Link href="/courses" className="text-xs text-blue-600 font-bold hover:underline">
                  Browse All
                </Link>
              </div>
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No courses enrolled yet.</p>
                  <Link
                    href="/courses"
                    className="mt-4 inline-block px-6 py-2.5 bg-[#0F1C15] text-white font-bold rounded-xl text-sm uppercase tracking-wider"
                  >
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <div
                      key={course.slug}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#0F1C15] flex items-center justify-center shrink-0 overflow-hidden">
                        {course.heroImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.heroImageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-7 h-7 text-[#D4AF37]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#0F1C15] text-sm truncate">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D4AF37] rounded-full"
                              style={{ width: "35%" }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 font-medium shrink-0">35%</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.durationLabel}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessonCount} lessons
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0F1C15] text-white text-xs font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-colors shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Classes */}
            <div
              id="classes"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Upcoming Live Classes
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {UPCOMING_SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F1C15] text-sm">{session.topic}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{session.instructor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0F1C15]">{session.date}</div>
                      <div className="text-xs text-gray-400">{session.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Missions */}
            <div
              id="missions"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#0F1C15] font-['Rajdhani'] uppercase tracking-wider">
                  Daily Missions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => toggleMission(mission.id)}
                    onKeyDown={(e) => e.key === "Enter" && toggleMission(mission.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${mission.completed ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${mission.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}
                    >
                      {mission.completed && (
                        <CheckCircle className="w-4 h-4 text-white fill-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${mission.completed ? "line-through text-gray-400" : "text-[#0F1C15]"}`}
                    >
                      {mission.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
