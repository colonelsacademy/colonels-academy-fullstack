"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import type {
  CourseLessonsResponse,
  LessonDetail,
  ModuleDetail
} from "@colonels-academy/contracts";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FileText,
  Lock,
  Menu,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseLessonCount, setCourseLessonCount] = useState(0);
  const [courseLevel, setCourseLevel] = useState("");
  const [courseOutcomes, setCourseOutcomes] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleDetail[]>([]);
  const [unorganised, setUnorganised] = useState<LessonDetail[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonDetail | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [openModules, setOpenModules] = useState<number[]>([0]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "qa" | "notes" | "resources">("overview");
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Load course detail
        const { getCourseBySlug } = await import("@/lib/api");
        const course = await getCourseBySlug(slug);
        if (course) {
          setCourseTitle(course.title);
          setCourseDescription(course.description);
          setCourseDuration(course.durationLabel);
          setCourseLessonCount(course.lessonCount);
          setCourseLevel(course.level);
          setCourseOutcomes(course.outcomeBullets);
        }

        // Load lessons from API proxy
        const res = await fetch(`/api/learning/courses/${slug}/lessons`);
        if (res.ok) {
          const data: CourseLessonsResponse = await res.json();
          setModules(data.modules);
          setUnorganised(data.unorganisedLessons);

          // Set first available lesson as active
          const firstLesson = data.modules[0]?.lessons[0] ?? data.unorganisedLessons[0] ?? null;
          setActiveLesson(firstLesson);

          // Check enrollment by seeing if any lesson is not locked (beyond preview)
          const hasFullAccess = [
            ...data.modules.flatMap((m) => m.lessons),
            ...data.unorganisedLessons
          ].some((l) => !l.isLocked && l.accessKind !== "PREVIEW");
          setIsEnrolled(hasFullAccess);

          // Build completed set from progress
          const completed = new Set(
            [...data.modules.flatMap((m) => m.lessons), ...data.unorganisedLessons]
              .filter((l) => l.progressStatus === "COMPLETED")
              .map((l) => l.id)
          );
          setCompletedLessons(completed);
        }
      } catch (err) {
        console.error("Failed to load classroom:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const markComplete = async (lessonId: string) => {
    try {
      await fetch(`/api/learning/progress/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      setCompletedLessons((prev) => new Set([...prev, lessonId]));
    } catch {
      // non-fatal
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allLessons = [...modules.flatMap((m) => m.lessons), ...unorganised];
  const toggleModule = (i: number) =>
    setOpenModules((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "qa", label: "Q&A" },
    { id: "notes", label: "Notes" },
    { id: "resources", label: "Resources" }
  ];

  const renderLesson = (lesson: LessonDetail) => {
    const isActive = activeLesson?.id === lesson.id;
    const isCompleted = completedLessons.has(lesson.id);
    const isLocked = lesson.isLocked;

    return (
      <button
        key={lesson.id}
        type="button"
        onClick={() => !isLocked && setActiveLesson(lesson)}
        className={`w-full flex items-start gap-3 p-3 pl-6 border-l-4 transition-all text-left group ${
          isActive ? "bg-blue-50 border-[#D4AF37]" : "border-transparent hover:bg-gray-50"
        } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-gray-400" />
          ) : isActive ? (
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          ) : lesson.contentType === "VIDEO" ? (
            <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37]" />
          ) : (
            <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${isActive ? "text-[#0B1120]" : "text-gray-600"}`}
          >
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {lesson.durationMinutes && (
              <span className="text-[10px] text-gray-400">{lesson.durationMinutes} min</span>
            )}
            {lesson.accessKind === "PREVIEW" && !isEnrolled && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                Free Preview
              </span>
            )}
            {isLocked && lesson.unlockRequirement && (
              <span className="text-[9px] text-gray-400 truncate">{lesson.unlockRequirement}</span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* TOP NAV */}
      <div className="h-14 bg-white flex items-center justify-between px-4 md:px-6 shadow-sm border-b border-gray-100 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className="hover:text-gray-600 transition-colors flex items-center gap-1 text-sm font-bold text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Courses</span>
          </Link>
          <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block" />
          <h1 className="font-bold truncate max-w-[200px] md:max-w-md text-sm md:text-base text-gray-900">
            {courseTitle}
          </h1>
        </div>
        {activeLesson && !completedLessons.has(activeLesson.id) && isEnrolled && (
          <button
            type="button"
            onClick={() => markComplete(activeLesson.id)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </button>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Player + Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="bg-black">
            <div className="max-w-6xl mx-auto">
              <VideoPlayer
                {...(activeLesson?.bunnyVideoId ? { videoId: activeLesson.bunnyVideoId } : {})}
                autoplay={false}
              />
            </div>
          </div>

          <div className="flex-1 border-r border-gray-100">
            <div className="border-b border-gray-200">
              <div className="flex gap-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-4 text-sm font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap ${
                      activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-4xl">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 font-['Rajdhani']">About this course</h2>
                    <p className="text-gray-600 leading-relaxed">{courseDescription}</p>
                  </div>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Duration
                      </p>
                      <p className="font-bold text-gray-900">{courseDuration}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Lessons
                      </p>
                      <p className="font-bold text-gray-900">{courseLessonCount}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Level
                      </p>
                      <p className="font-bold text-gray-900">{courseLevel}</p>
                    </div>
                  </div>
                  {courseOutcomes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">What you&apos;ll learn</h3>
                      <ul className="grid md:grid-cols-2 gap-3">
                        {courseOutcomes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-1 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeLesson && isEnrolled && !completedLessons.has(activeLesson.id) && (
                    <button
                      type="button"
                      onClick={() => markComplete(activeLesson.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Mark Lesson Complete
                    </button>
                  )}
                </div>
              )}
              {activeTab === "qa" && (
                <div className="text-center py-12 text-gray-500">
                  <p className="font-medium">No questions asked yet.</p>
                  <p className="text-sm">Be the first to ask a question to the instructor!</p>
                </div>
              )}
              {activeTab === "notes" && (
                <div className="text-center py-12 text-gray-500">
                  <p className="font-medium">Create your first note</p>
                  <p className="text-sm">Click the timestamp in the video to add a note.</p>
                </div>
              )}
              {activeTab === "resources" && (
                <div className="space-y-3">
                  <h3 className="font-bold mb-2">Downloadable Resources</h3>
                  <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">Course Syllabus & Guide</p>
                        <p className="text-xs text-gray-500">2.4 MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Curriculum Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isSidebarOpen ? 350 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className="flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <span className="font-bold text-sm uppercase tracking-wider text-gray-700">
              Course Content
            </span>
            <span className="text-xs text-gray-400">
              {completedLessons.size}/{allLessons.length} done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {modules.length > 0
              ? modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border-b border-gray-100">
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors text-left"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{module.title}</h3>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                          {module.lessons.length} Lessons
                        </p>
                      </div>
                      {openModules.includes(moduleIndex) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openModules.includes(moduleIndex) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {module.lessons.map(renderLesson)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              : unorganised.map(renderLesson)}
          </div>

          {!isEnrolled && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <Link
                href={`/courses/${slug}`}
                className="w-full py-3 bg-[#D4AF37] text-[#0B1120] font-bold uppercase tracking-wider text-xs rounded hover:bg-[#b8952b] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3 h-3" />
                Unlock Full Course
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-20 right-4 z-40 p-2 bg-white text-black shadow-lg rounded-lg border border-gray-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
