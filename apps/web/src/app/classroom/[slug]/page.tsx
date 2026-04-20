"use client";

import LessonStageRenderer from "@/components/classroom/LessonStageRenderer";
import { getCourseBySlug } from "@/lib/api";
import {
  createClassroomSubmission,
  endClassroomStudySession,
  getCourseLessonsForClassroom,
  getCourseSubmissionsForClassroom,
  heartbeatClassroomStudySession,
  startClassroomStudySession,
  updateClassroomLessonProgress,
  uploadClassroomAsset
} from "@/services/classroomService";
import type {
  CourseDetail,
  LessonDetail,
  LessonLearningMode,
  LessonSubmissionDetail,
  ModuleDetail,
  QuizQuestionDetail,
  SubmissionType
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
  lessonContent?: LessonDetail["lessonContent"];
  quizQuestions?: QuizQuestionDetail[];
  unlockRequirement?: string;
  phaseNumber?: number;
  subjectArea?: LessonDetail["subjectArea"];
  learningMode?: LessonLearningMode;
};

type ClassroomModule = {
  id: string;
  title: string;
  lessons: ClassroomLesson[];
  subjectArea?: LessonDetail["subjectArea"];
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

function formatLearningMode(mode: LessonLearningMode) {
  switch (mode) {
    case "PRACTICE":
      return "Practice";
    case "QUIZ":
      return "Quiz";
    case "LIVE":
      return "Live";
    case "FEEDBACK":
      return "Feedback";
    case "RESOURCE":
      return "Resource";
    default:
      return "Lesson";
  }
}

function formatLearningModeChipClassName(mode: LessonLearningMode) {
  switch (mode) {
    case "PRACTICE":
      return "bg-orange-50 text-orange-700 ring-orange-200";
    case "QUIZ":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "LIVE":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "FEEDBACK":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "RESOURCE":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
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
    ...(lesson.lessonContent ? { lessonContent: lesson.lessonContent } : {}),
    ...(lesson.quizQuestions ? { quizQuestions: lesson.quizQuestions } : {}),
    ...(lesson.unlockRequirement ? { unlockRequirement: lesson.unlockRequirement } : {}),
    ...(lesson.phaseNumber ? { phaseNumber: lesson.phaseNumber } : {}),
    ...(lesson.subjectArea ? { subjectArea: lesson.subjectArea } : {}),
    ...(lesson.learningMode ? { learningMode: lesson.learningMode } : {})
  };
}

function buildCurriculum(
  modules: ModuleDetail[],
  unorganisedLessons: LessonDetail[]
): ClassroomModule[] {
  const mappedModules = modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map(mapLessonDetail),
    ...(module.subjectArea ? { subjectArea: module.subjectArea } : {})
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
  const [curriculumMode, setCurriculumMode] = useState<"api" | "unavailable">("unavailable");
  const [curriculumNote, setCurriculumNote] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<LessonSubmissionDetail[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionBusy, setSubmissionBusy] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [progressBusy, setProgressBusy] = useState(false);
  const [curriculumReloadToken, setCurriculumReloadToken] = useState(0);
  const [deviceSessionId] = useState(
    () => `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
  const sessionIdRef = useRef<string | null>(null);
  const activeLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeLessonIdRef.current = activeLesson?.id ?? null;
  }, [activeLesson?.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: curriculumReloadToken is an intentional re-fetch trigger, not consumed inside the effect
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
        const renderedCurriculum = nextCurriculum;
        const preservedLessonId = activeLessonIdRef.current;
        const preservedLesson = preservedLessonId
          ? (renderedCurriculum
              .flatMap((module) => module.lessons)
              .find((lesson) => lesson.id === preservedLessonId) ?? null)
          : null;
        const defaultLesson = preservedLesson ?? pickDefaultLesson(renderedCurriculum);

        setCurriculum(renderedCurriculum);
        setActiveLesson(defaultLesson);
        setOpenModules(findOpenModuleIndexes(renderedCurriculum, defaultLesson?.id));
        setCurriculumMode("api");
        setCurriculumNote(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to load classroom curriculum:", error);
        setCurriculum([]);
        setActiveLesson(null);
        setOpenModules([]);
        setCurriculumMode("unavailable");
        setCurriculumNote(
          "Classroom content is temporarily unavailable. Please refresh in a moment."
        );
      }
    }

    void loadClassroom();

    return () => {
      isCancelled = true;
    };
  }, [slug, curriculumReloadToken]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeLesson?.id is a trigger — resets form when lesson changes
  useEffect(() => {
    setSubmissionNotes("");
    setSubmissionFile(null);
    setSubmissionError(null);
    setSubmissionMessage(null);
  }, [activeLesson?.id]);

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
  const latestLessonSubmission = activeLesson
    ? submissions.find((submission) => submission.lessonId === activeLesson.id)
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

    let submissionType: SubmissionType = "ESSAY";
    if (activeLesson.subjectArea === "LECTURETTE") {
      submissionType = "LECTURETTE";
    } else if (activeLesson.subjectArea === "APPRECIATION_PLANS") {
      submissionType = "APPRECIATION_PLAN";
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
        submissionType,
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

  const handleMarkLessonComplete = async () => {
    if (!activeLesson || activeLesson.isLocked) {
      return;
    }

    setProgressBusy(true);
    setSubmissionError(null);
    setSubmissionMessage(null);
    try {
      await updateClassroomLessonProgress(activeLesson.id, "COMPLETED");

      setCurriculum((current) =>
        current.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === activeLesson.id ? { ...lesson, progressStatus: "COMPLETED" } : lesson
          )
        }))
      );
      setActiveLesson((current) =>
        current ? { ...current, progressStatus: "COMPLETED" } : current
      );
      setCurriculumReloadToken((current) => current + 1);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to update lesson progress."
      );
    } finally {
      setProgressBusy(false);
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
            <div className="w-full">
              <LessonStageRenderer
                key={activeLesson?.id}
                courseTitle={course.title}
                {...(course.heroImageUrl ? { poster: course.heroImageUrl } : {})}
                lesson={activeLesson}
                latestSubmission={latestLessonSubmission}
                submissionNotes={submissionNotes}
                submissionFile={submissionFile}
                submissionBusy={submissionBusy}
                submissionError={submissionError}
                submissionMessage={submissionMessage}
                progressBusy={progressBusy}
                onSubmissionNotesChange={setSubmissionNotes}
                onSubmissionFileChange={setSubmissionFile}
                onSubmitSubmission={() => void handleLecturetteSubmission()}
                onMarkComplete={() => void handleMarkLessonComplete()}
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

                  {!activeLesson?.pdfUrl && !activeLesson?.meetingUrl ? (
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
                  onClick={() => {
                    if (module.lessons.length === 0) {
                      return;
                    }

                    toggleModule(moduleIndex);
                  }}
                  className="w-full bg-gray-50/50 p-4 text-left transition-colors hover:bg-gray-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{module.title}</h3>
                      <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                        {module.lessons.length > 0
                          ? `${module.lessons.length} ${
                              module.lessons.some((lesson) => lesson.learningMode)
                                ? module.lessons.length === 1
                                  ? "Item"
                                  : "Items"
                                : module.lessons.length === 1
                                  ? "Lesson"
                                  : "Lessons"
                            }`
                          : "Guide Section"}
                      </p>
                    </div>
                    {module.lessons.length === 0 ? null : openModules.includes(moduleIndex) ? (
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
                                  {lesson.learningMode ? (
                                    <span
                                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${formatLearningModeChipClassName(
                                        lesson.learningMode
                                      )}`}
                                    >
                                      {formatLearningMode(lesson.learningMode)}
                                    </span>
                                  ) : null}
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
