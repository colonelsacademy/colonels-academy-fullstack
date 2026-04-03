"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import { getCourseBySlug } from "@/lib/api";
import type { CourseDetail } from "@colonels-academy/contracts";
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

// ─── Mock curriculum (replace with real data from API) ───────────────────────
const buildCurriculum = (_course: CourseDetail) => [
  {
    title: "Introduction & Orientation",
    lessons: [
      {
        id: "l1",
        title: "Lesson 1: Introduction & Orientation Part 1",
        duration: "16 min",
        type: "video",
        isPreview: true,
        videoId: ""
      },
      {
        id: "l2",
        title: "Lesson 2: Introduction & Orientation Part 2",
        duration: "17 min",
        type: "video",
        isPreview: true,
        videoId: ""
      },
      {
        id: "l3",
        title: "Lesson 3: Introduction & Orientation Part 3",
        duration: "18 min",
        type: "video",
        isPreview: false,
        videoId: ""
      }
    ]
  },
  {
    title: "Core Concepts",
    lessons: [
      {
        id: "l4",
        title: "Core Concept 1",
        duration: "22 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l5",
        title: "Core Concept 2",
        duration: "18 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l6",
        title: "Core Concept 3",
        duration: "25 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l7",
        title: "Core Concept 4",
        duration: "20 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l8",
        title: "Core Concept 5",
        duration: "15 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l9",
        title: "Core Concept 6",
        duration: "30 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l10",
        title: "Core Concept 7",
        duration: "28 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l11",
        title: "Core Concept 8",
        duration: "19 min",
        type: "video",
        isPreview: false,
        videoId: ""
      }
    ]
  },
  {
    title: "Advanced Tactics",
    lessons: [
      {
        id: "l12",
        title: "Advanced Tactic 1",
        duration: "35 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l13",
        title: "Advanced Tactic 2",
        duration: "40 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l14",
        title: "Advanced Tactic 3",
        duration: "32 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l15",
        title: "Advanced Tactic 4",
        duration: "28 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l16",
        title: "Advanced Tactic 5",
        duration: "45 min",
        type: "video",
        isPreview: false,
        videoId: ""
      }
    ]
  },
  {
    title: "Practical Application",
    lessons: [
      {
        id: "l17",
        title: "Practical Session 1",
        duration: "50 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l18",
        title: "Practical Session 2",
        duration: "45 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l19",
        title: "Practical Session 3",
        duration: "55 min",
        type: "video",
        isPreview: false,
        videoId: ""
      },
      {
        id: "l20",
        title: "Practical Session 4",
        duration: "60 min",
        type: "video",
        isPreview: false,
        videoId: ""
      }
    ]
  }
];

type Lesson = ReturnType<typeof buildCurriculum>[0]["lessons"][0];

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, _setCompletedLessons] = useState<string[]>([]);
  const [openModules, setOpenModules] = useState<number[]>([0]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "qa" | "notes" | "resources">("overview");

  useEffect(() => {
    getCourseBySlug(slug).then((c) => {
      if (c) {
        setCourse(c);
        const curriculum = buildCurriculum(c);
        setActiveLesson(curriculum[0]?.lessons[0] ?? null);
      }
    });
  }, [slug]);

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const curriculum = buildCurriculum(course);
  const accessLevel = "preview"; // Change to "full" when user is enrolled

  const toggleModule = (i: number) =>
    setOpenModules((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "qa", label: "Q&A" },
    { id: "notes", label: "Notes" },
    { id: "resources", label: "Resources" }
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* ── TOP NAV ── */}
      <div className="h-14 bg-white text-gray-900 flex items-center justify-between px-4 md:px-6 shadow-sm border-b border-gray-100 z-30 shrink-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(17,24,39,0.06)_1px,_transparent_0)] bg-[size:14px_14px]">
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
            {course.title}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Player + Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video */}
          <div className="bg-black">
            <div className="max-w-6xl mx-auto">
              <VideoPlayer
                {...(activeLesson?.videoId ? { videoId: activeLesson.videoId } : {})}
                {...(course.heroImageUrl ? { poster: course.heroImageUrl } : {})}
                autoplay={false}
              />
            </div>
          </div>

          {/* Tabs */}
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
                    <p className="text-gray-600 leading-relaxed">{course.description}</p>
                  </div>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Duration
                      </p>
                      <p className="font-bold text-gray-900">{course.durationLabel}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Lessons
                      </p>
                      <p className="font-bold text-gray-900">{course.lessonCount}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Level
                      </p>
                      <p className="font-bold text-gray-900">{course.level}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3">What you&apos;ll learn</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {(course.outcomeBullets.length > 0
                        ? course.outcomeBullets
                        : [
                            "Comprehensive tactical command understanding",
                            "Interview and selection board preparation",
                            "Physical and written exam strategies",
                            "Leadership and decision-making skills"
                          ]
                      ).map((item, _i) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
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
          </div>

          <div className="flex-1 overflow-y-auto">
            {curriculum.map((module, moduleIndex) => (
              <div key={module.title} className="border-b border-gray-100">
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
                      {module.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isLocked = accessLevel === "preview" && !lesson.isPreview;

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => !isLocked && setActiveLesson(lesson)}
                            className={`w-full flex items-start gap-3 p-3 pl-6 border-l-4 transition-all text-left group ${
                              isActive
                                ? "bg-blue-50 border-[#D4AF37]"
                                : "border-transparent hover:bg-gray-50"
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
                              ) : lesson.type === "video" ? (
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
                                <span className="text-[10px] text-gray-400">{lesson.duration}</span>
                                {lesson.isPreview && accessLevel === "preview" && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {accessLevel === "preview" && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <Link
                href="/courses"
                className="w-full py-3 bg-[#D4AF37] text-[#0B1120] font-bold uppercase tracking-wider text-xs rounded hover:bg-[#b8952b] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3 h-3" />
                Unlock Full Course
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile sidebar toggle */}
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
