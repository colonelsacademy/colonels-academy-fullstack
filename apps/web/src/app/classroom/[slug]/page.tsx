"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import { getCourseBySlug } from "@/lib/api";
import {
  createClassroomSubmission,
  endClassroomStudySession,
  getCourseLessonsForClassroom,
  getCourseSubmissionsForClassroom,
  heartbeatClassroomStudySession,
  startClassroomStudySession,
  uploadClassroomAsset
} from "@/services/classroomService";
import type {
  CourseDetail,
  LessonDetail,
  LessonSubmissionDetail,
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
import { use, useEffect, useRef, useState } from "react";

const STUDY_SESSION_HEARTBEAT_MS = 60_000;

type ClassroomLesson = {
  id: string;
  title: string;
  durationLabel: string;
  contentType: LessonDetail["contentType"];
  isLocked: boolean;
  isPreview: boolean;
  progressStatus: LessonDetail["progressStatus"];
  synopsis: string;
  videoId?: string;
  meetingUrl?: string;
  pdfUrl?: string;
  unlockRequirement?: string;
  phaseNumber?: number;
  subjectArea?: LessonDetail["subjectArea"];
};

type ClassroomModule = {
  id: string;
  title: string;
  lessons: ClassroomLesson[];
};

function formatDurationLabel(durationMinutes?: number) {
  if (!durationMinutes || durationMinutes <= 0) {
    return "Self-paced";
  }

  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function formatLessonType(contentType: LessonDetail["contentType"]) {
  switch (contentType) {
    case "LIVE":
      return "Live session";
    case "PDF":
      return "PDF lesson";
    case "QUIZ":
      return "Practice quiz";
    case "TEXT":
      return "Reading lesson";
    default:
      return "Video lesson";
  }
}

function formatSubjectArea(subjectArea?: LessonDetail["subjectArea"]) {
  if (!subjectArea) {
    return null;
  }

  return subjectArea
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function mapLessonDetail(lesson: LessonDetail): ClassroomLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    durationLabel: formatDurationLabel(lesson.durationMinutes),
    contentType: lesson.contentType,
    isLocked: lesson.isLocked,
    isPreview: lesson.accessKind === "PREVIEW",
    progressStatus: lesson.progressStatus,
    synopsis: lesson.synopsis,
    ...(lesson.bunnyVideoId ? { videoId: lesson.bunnyVideoId } : {}),
    ...(lesson.meetingUrl ? { meetingUrl: lesson.meetingUrl } : {}),
    ...(lesson.pdfUrl ? { pdfUrl: lesson.pdfUrl } : {}),
    ...(lesson.unlockRequirement ? { unlockRequirement: lesson.unlockRequirement } : {}),
    ...(lesson.phaseNumber ? { phaseNumber: lesson.phaseNumber } : {}),
    ...(lesson.subjectArea ? { subjectArea: lesson.subjectArea } : {})
  };
}

function buildCurriculum(
  modules: ModuleDetail[],
  unorganisedLessons: LessonDetail[]
): ClassroomModule[] {
  const mappedModules = modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map(mapLessonDetail)
  }));

  if (unorganisedLessons.length === 0) {
    return mappedModules;
  }

  return [
    ...mappedModules,
    {
      id: "unorganised-lessons",
      title: "Independent Lessons",
      lessons: unorganisedLessons.map(mapLessonDetail)
    }
  ];
}

function buildFallbackCurriculum(_course: CourseDetail): ClassroomModule[] {
  return [
    {
      id: "fallback-orientation",
      title: "Introduction & Orientation",
      lessons: [
        {
          id: "fallback-l1",
          title: "Lesson 1: Introduction & Orientation Part 1",
          durationLabel: "16 min",
          contentType: "VIDEO",
          isLocked: false,
          isPreview: true,
          progressStatus: "NOT_STARTED",
          synopsis: "A preview lesson while the live curriculum is being connected."
        },
        {
          id: "fallback-l2",
          title: "Lesson 2: Introduction & Orientation Part 2",
          durationLabel: "17 min",
          contentType: "VIDEO",
          isLocked: false,
          isPreview: true,
          progressStatus: "NOT_STARTED",
          synopsis: "A preview lesson while the live curriculum is being connected."
        },
        {
          id: "fallback-l3",
          title: "Lesson 3: Introduction & Orientation Part 3",
          durationLabel: "18 min",
          contentType: "VIDEO",
          isLocked: true,
          isPreview: false,
          progressStatus: "NOT_STARTED",
          synopsis: "Enroll and sign in to continue past the preview track.",
          unlockRequirement: "Unlock the full course to access this lesson."
        }
      ]
    },
    {
      id: "fallback-core-concepts",
      title: "Core Concepts",
      lessons: [
        {
          id: "fallback-l4",
          title: "Core Concept 1",
          durationLabel: "22 min",
          contentType: "VIDEO",
          isLocked: true,
          isPreview: false,
          progressStatus: "NOT_STARTED",
          synopsis: "Locked in preview mode.",
          unlockRequirement: "Unlock the full course to access this lesson."
        },
        {
          id: "fallback-l5",
          title: "Core Concept 2",
          durationLabel: "18 min",
          contentType: "PDF",
          isLocked: true,
          isPreview: false,
          progressStatus: "NOT_STARTED",
          synopsis: "Locked in preview mode.",
          unlockRequirement: "Unlock the full course to access this lesson."
        }
      ]
    }
  ];
}

function pickDefaultLesson(curriculum: ClassroomModule[]) {
  for (const module of curriculum) {
    const unlockedLesson = module.lessons.find((lesson) => !lesson.isLocked);
    if (unlockedLesson) {
      return unlockedLesson;
    }
  }

  return curriculum[0]?.lessons[0] ?? null;
}

function findOpenModuleIndexes(curriculum: ClassroomModule[], lessonId?: string) {
  const activeModuleIndex = lessonId
    ? curriculum.findIndex((module) => module.lessons.some((lesson) => lesson.id === lessonId))
    : -1;

  return activeModuleIndex >= 0 ? [activeModuleIndex] : curriculum.length > 0 ? [0] : [];
}

function noop() {}

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [curriculum, setCurriculum] = useState<ClassroomModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<ClassroomLesson | null>(null);
  const [openModules, setOpenModules] = useState<number[]>([0]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "qa" | "notes" | "resources">("overview");
  const [curriculumMode, setCurriculumMode] = useState<"api" | "fallback">("fallback");
  const [curriculumNote, setCurriculumNote] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<LessonSubmissionDetail[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionBusy, setSubmissionBusy] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [deviceSessionId] = useState(
    () => `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadClassroom() {
      const nextCourse = await getCourseBySlug(slug);

      if (isCancelled) {
        return;
      }

      if (!nextCourse) {
        setCourse(null);
        setCurriculum([]);
        setActiveLesson(null);
        return;
      }

      setCourse(nextCourse);

      try {
        const lessonResponse = await getCourseLessonsForClassroom(slug);

        if (isCancelled) {
          return;
        }

        const nextCurriculum = buildCurriculum(
          lessonResponse.modules,
          lessonResponse.unorganisedLessons
        );
        const defaultLesson = pickDefaultLesson(nextCurriculum);

        setCurriculum(nextCurriculum);
        setActiveLesson(defaultLesson);
        setOpenModules(findOpenModuleIndexes(nextCurriculum, defaultLesson?.id));
        setCurriculumMode("api");
        setCurriculumNote(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to load classroom curriculum, using fallback:", error);
        const nextCurriculum = buildFallbackCurriculum(nextCourse);
        const defaultLesson = pickDefaultLesson(nextCurriculum);

        setCurriculum(nextCurriculum);
        setActiveLesson(defaultLesson);
        setOpenModules(findOpenModuleIndexes(nextCurriculum, defaultLesson?.id));
        setCurriculumMode("fallback");
        setCurriculumNote("Classroom is using fallback content while the live curriculum syncs.");
      }
    }

    void loadClassroom();

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSubmissions() {
      try {
        const response = await getCourseSubmissionsForClassroom(slug);

        if (isCancelled) {
          return;
        }

        setSubmissions(response.items);
        setSubmissionMessage(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.warn("Unable to load classroom submissions:", error);
        setSubmissions([]);
      }
    }

    void loadSubmissions();

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (curriculum.length === 0) {
      setActiveLesson(null);
      return;
    }

    if (!activeLesson) {
      setActiveLesson(pickDefaultLesson(curriculum));
      return;
    }

    const lessonStillExists = curriculum.some((module) =>
      module.lessons.some((lesson) => lesson.id === activeLesson.id)
    );

    if (!lessonStillExists) {
      setActiveLesson(pickDefaultLesson(curriculum));
    }
  }, [curriculum, activeLesson]);

  useEffect(() => {
    const handlePageHide = () => {
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (!sessionId) {
        return;
      }

      void endClassroomStudySession(sessionId, { deviceSessionId }, { keepalive: true }).catch(
        noop
      );
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [deviceSessionId]);

  useEffect(() => {
    if (!course || curriculumMode !== "api" || !activeLesson || activeLesson.isLocked) {
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (sessionId) {
        void endClassroomStudySession(sessionId, { deviceSessionId }).catch(noop);
      }

      return;
    }

    let isCancelled = false;
    let heartbeatTimer: number | undefined;
    const trackedCourseSlug = course.slug;
    const trackedLessonId = activeLesson.id;

    async function beginTracking() {
      const previousSessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (previousSessionId) {
        await endClassroomStudySession(previousSessionId, { deviceSessionId }).catch(noop);
      }

      try {
        const response = await startClassroomStudySession({
          courseSlug: trackedCourseSlug,
          lessonId: trackedLessonId,
          deviceSessionId
        });

        if (isCancelled) {
          await endClassroomStudySession(
            response.session.id,
            { deviceSessionId },
            { keepalive: true }
          ).catch(noop);
          return;
        }

        sessionIdRef.current = response.session.id;
        heartbeatTimer = window.setInterval(() => {
          const sessionId = sessionIdRef.current;

          if (!sessionId) {
            return;
          }

          void heartbeatClassroomStudySession(sessionId, { deviceSessionId }).catch(noop);
        }, STUDY_SESSION_HEARTBEAT_MS);
      } catch (error) {
        console.warn("Study session tracking unavailable for this lesson:", error);
      }
    }

    void beginTracking();

    return () => {
      isCancelled = true;
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
      }

      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (sessionId) {
        void endClassroomStudySession(sessionId, { deviceSessionId }).catch(noop);
      }
    };
  }, [activeLesson, course, curriculumMode, deviceSessionId]);

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  const hasLockedLessons = curriculum.some((module) =>
    module.lessons.some((lesson) => lesson.isLocked)
  );
  const lessonSubject = formatSubjectArea(activeLesson?.subjectArea);
  const supportsLecturetteSubmission =
    activeLesson?.subjectArea === "LECTURETTE" && !activeLesson.isLocked;
  const latestLessonSubmission = activeLesson
    ? submissions.find(
        (submission) =>
          submission.lessonId === activeLesson.id ||
          (submission.subjectArea === activeLesson.subjectArea &&
            submission.phaseNumber === activeLesson.phaseNumber)
      )
    : null;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "qa", label: "Q&A" },
    { id: "notes", label: "Notes" },
    { id: "resources", label: "Resources" }
  ];

  const toggleModule = (index: number) =>
    setOpenModules((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index]
    );

  const handleLecturetteSubmission = async () => {
    if (!course || !activeLesson) {
      return;
    }

    setSubmissionBusy(true);
    setSubmissionError(null);
    setSubmissionMessage(null);

    try {
      let assetUrl: string | undefined;

      if (submissionFile) {
        const upload = await uploadClassroomAsset(submissionFile);
        assetUrl = upload.url;
      }

      const response = await createClassroomSubmission({
        courseSlug: course.slug,
        lessonId: activeLesson.id,
        submissionType: "LECTURETTE",
        title: activeLesson.title,
        ...(activeLesson.phaseNumber ? { phaseNumber: activeLesson.phaseNumber } : {}),
        ...(activeLesson.subjectArea ? { subjectArea: activeLesson.subjectArea } : {}),
        ...(submissionNotes.trim() ? { body: submissionNotes.trim() } : {}),
        ...(assetUrl ? { assetUrl } : {})
      });

      setSubmissions((current) => [
        response.submission,
        ...current.filter((item) => item.id !== response.submission.id)
      ]);
      setSubmissionNotes("");
      setSubmissionFile(null);
      setSubmissionMessage("Lecturette submission uploaded for DS review.");
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Unable to submit lecturette.");
    } finally {
      setSubmissionBusy(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white bg-[radial-gradient(circle_at_1px_1px,_rgba(17,24,39,0.06)_1px,_transparent_0)] bg-[size:14px_14px] px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className="flex items-center gap-1 text-sm font-bold text-gray-700 transition-colors hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline">Back to Courses</span>
          </Link>
          <div className="mx-2 hidden h-6 w-px bg-gray-200 md:block" />
          <h1 className="max-w-[200px] truncate text-sm font-bold text-gray-900 md:max-w-md md:text-base">
            {course.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="bg-black">
            <div className="mx-auto max-w-6xl">
              <VideoPlayer
                {...(activeLesson?.videoId ? { videoId: activeLesson.videoId } : {})}
                {...(course.heroImageUrl ? { poster: course.heroImageUrl } : {})}
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
                    className={`relative whitespace-nowrap py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                      activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id ? (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-black" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-4xl p-6 md:p-8">
              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      Current Lesson
                    </p>
                    <h2 className="mb-3 font-['Rajdhani'] text-2xl font-bold">
                      {activeLesson?.title ?? course.title}
                    </h2>
                    <p className="leading-relaxed text-gray-600">
                      {activeLesson?.synopsis || course.description}
                    </p>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-4">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Lesson Type
                      </p>
                      <p className="font-bold text-gray-900">
                        {activeLesson ? formatLessonType(activeLesson.contentType) : "Course"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Duration
                      </p>
                      <p className="font-bold text-gray-900">
                        {activeLesson?.durationLabel ?? course.durationLabel}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Phase
                      </p>
                      <p className="font-bold text-gray-900">
                        {activeLesson?.phaseNumber ? `Phase ${activeLesson.phaseNumber}` : "Open"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Subject
                      </p>
                      <p className="font-bold text-gray-900">{lessonSubject ?? course.level}</p>
                    </div>
                  </div>

                  {activeLesson?.unlockRequirement ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      {activeLesson.unlockRequirement}
                    </div>
                  ) : null}

                  {curriculumNote ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {curriculumNote}
                    </div>
                  ) : null}

                  {supportsLecturetteSubmission ? (
                    <div className="space-y-4 rounded-xl border border-[#D4AF37]/30 bg-[#fff9e8] p-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8b6a13]">
                          Lecturette Review
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-gray-900">
                          Submit your recorded presentation
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700">
                          Upload a recording and any preparation notes so DS can review body
                          language, structure, and delivery quality for this lecturette lesson.
                        </p>
                      </div>

                      {latestLessonSubmission ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                          <p className="font-bold text-gray-900">
                            Latest status: {latestLessonSubmission.status.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Submitted on{" "}
                            {new Date(latestLessonSubmission.submittedAt).toLocaleString()}
                          </p>
                          {latestLessonSubmission.assetUrl ? (
                            <a
                              href={latestLessonSubmission.assetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex text-sm font-bold text-blue-600 hover:underline"
                            >
                              Open uploaded recording
                            </a>
                          ) : null}
                          {latestLessonSubmission.reviewNotes ? (
                            <p className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700">
                              {latestLessonSubmission.reviewNotes}
                            </p>
                          ) : null}
                          {latestLessonSubmission.score !== undefined &&
                          latestLessonSubmission.maxScore !== undefined ? (
                            <p className="mt-2 font-medium text-gray-800">
                              Score: {latestLessonSubmission.score}/
                              {latestLessonSubmission.maxScore}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <textarea
                          value={submissionNotes}
                          onChange={(event) => setSubmissionNotes(event.target.value)}
                          rows={4}
                          placeholder="Add any presentation notes or context for DS review."
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                        <input
                          type="file"
                          accept="video/*,audio/*"
                          onChange={(event) => setSubmissionFile(event.target.files?.[0] ?? null)}
                          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#D4AF37] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#0B1120]"
                        />
                        {submissionError ? (
                          <p className="text-sm text-red-700">{submissionError}</p>
                        ) : null}
                        {submissionMessage ? (
                          <p className="text-sm text-green-700">{submissionMessage}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleLecturetteSubmission()}
                          disabled={submissionBusy || (!submissionFile && !submissionNotes.trim())}
                          className="inline-flex items-center justify-center rounded-md bg-[#0B1120] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#19263b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submissionBusy ? "Submitting..." : "Submit For Review"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="mb-3 text-lg font-bold">What you&apos;ll learn</h3>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {(course.outcomeBullets.length > 0
                        ? course.outcomeBullets
                        : [
                            "Comprehensive tactical command understanding",
                            "Interview and selection board preparation",
                            "Physical and written exam strategies",
                            "Leadership and decision-making skills"
                          ]
                      ).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {activeTab === "qa" ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-medium">No questions asked yet.</p>
                  <p className="text-sm">Be the first to ask a question to the instructor.</p>
                </div>
              ) : null}

              {activeTab === "notes" ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-medium">Create your first note</p>
                  <p className="text-sm">Timestamped lesson notes will appear here.</p>
                </div>
              ) : null}

              {activeTab === "resources" ? (
                <div className="space-y-3">
                  <h3 className="mb-2 font-bold">Lesson Resources</h3>
                  {activeLesson?.pdfUrl ? (
                    <a
                      href={activeLesson.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                          PDF
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Lesson PDF</p>
                          <p className="text-xs text-gray-500">Open the downloadable resource</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-blue-600 hover:underline">Open</span>
                    </a>
                  ) : null}

                  {activeLesson?.meetingUrl ? (
                    <a
                      href={activeLesson.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                          LIVE
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Join live class</p>
                          <p className="text-xs text-gray-500">
                            Open the instructor session for this lesson
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-blue-600 hover:underline">Join</span>
                    </a>
                  ) : null}

                  {supportsLecturetteSubmission ? (
                    <div className="rounded-lg border border-[#D4AF37]/30 bg-[#fff9e8] p-4">
                      <p className="font-bold text-gray-900">Lecturette submission is enabled</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Use the Overview tab to upload your presentation recording and send it to DS
                        for rubric-based review.
                      </p>
                    </div>
                  ) : null}

                  {!activeLesson?.pdfUrl &&
                  !activeLesson?.meetingUrl &&
                  !supportsLecturetteSubmission ? (
                    <div className="py-12 text-center text-gray-500">
                      <p className="font-medium">No lesson resources attached yet.</p>
                      <p className="text-sm">Downloadable notes and live links will appear here.</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ width: isSidebarOpen ? 350 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className="flex h-full flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-700">
              Course Content
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {curriculum.map((module, moduleIndex) => (
              <div key={module.id} className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleModule(moduleIndex)}
                  className="w-full bg-gray-50/50 p-4 text-left transition-colors hover:bg-gray-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{module.title}</h3>
                      <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                        {module.lessons.length} Lessons
                      </p>
                    </div>
                    {openModules.includes(moduleIndex) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openModules.includes(moduleIndex) ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {module.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = lesson.progressStatus === "COMPLETED";

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              if (lesson.isLocked) {
                                return;
                              }

                              setActiveLesson(lesson);
                            }}
                            className={`group w-full border-l-4 p-3 pl-6 text-left transition-all ${
                              isActive
                                ? "border-[#D4AF37] bg-blue-50"
                                : "border-transparent hover:bg-gray-50"
                            } ${lesson.isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : lesson.isLocked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : isActive ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37]">
                                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                  </div>
                                ) : lesson.contentType === "VIDEO" ? (
                                  <PlayCircle className="h-4 w-4 text-gray-400 group-hover:text-[#D4AF37]" />
                                ) : (
                                  <FileText className="h-4 w-4 text-gray-400 group-hover:text-[#D4AF37]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`truncate text-sm font-medium ${
                                    isActive ? "text-[#0B1120]" : "text-gray-600"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400">
                                    {lesson.durationLabel}
                                  </span>
                                  {lesson.isPreview ? (
                                    <span className="rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-600">
                                      Preview
                                    </span>
                                  ) : null}
                                </div>
                                {lesson.isLocked && lesson.unlockRequirement ? (
                                  <p className="mt-1 text-[10px] text-amber-700">
                                    {lesson.unlockRequirement}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {hasLockedLessons ? (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <Link
                href="/courses"
                className="flex w-full items-center justify-center gap-2 rounded bg-[#D4AF37] py-3 text-xs font-bold uppercase tracking-wider text-[#0B1120] shadow-sm transition-colors hover:bg-[#b8952b]"
              >
                <Lock className="h-3 w-3" />
                Unlock Full Course
              </Link>
            </div>
          ) : null}
        </motion.div>
      </div>

      {!isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute right-4 top-20 z-40 rounded-lg border border-gray-200 bg-white p-2 text-black shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
