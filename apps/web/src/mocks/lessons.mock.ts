import type { LessonDetail, ModuleDetail } from "@colonels-academy/contracts";

export const mockLessons: LessonDetail[] = [
  {
    id: "lesson-mock-01",
    courseId: "officer-cadet-elite",
    title: "Introduction to Officer Selection",
    synopsis: "Overview of the Officer Cadet selection process and what to expect.",
    position: 0,
    durationMinutes: 12,
    contentType: "VIDEO",
    accessKind: "PREVIEW",
    bunnyVideoId: "mock-bunny-id-01"
  },
  {
    id: "lesson-mock-02",
    courseId: "officer-cadet-elite",
    title: "Aptitude Test Fundamentals",
    synopsis: "Core aptitude concepts: numerical, verbal, and spatial reasoning.",
    position: 1,
    durationMinutes: 30,
    contentType: "VIDEO",
    accessKind: "STANDARD",
    bunnyVideoId: "mock-bunny-id-02"
  },
  {
    id: "lesson-mock-03",
    courseId: "officer-cadet-elite",
    title: "Aptitude Practice Quiz",
    synopsis: "10-question timed quiz to test your aptitude fundamentals.",
    position: 2,
    durationMinutes: 15,
    contentType: "QUIZ",
    accessKind: "STANDARD",
    quizQuestions: [
      {
        id: "q-01",
        question: "If a soldier marches 4 km in 1 hour, how far does he march in 90 minutes?",
        options: [{ text: "5 km" }, { text: "6 km" }, { text: "7 km" }, { text: "8 km" }],
        correctOptionIndex: 1,
        explanation: "4 km/h × 1.5 h = 6 km.",
        position: 0
      }
    ]
  },
  {
    id: "lesson-mock-04",
    courseId: "officer-cadet-elite",
    title: "Live Q&A — Interview Preparation",
    synopsis: "Join the instructor for a live session on interview technique and board confidence.",
    position: 3,
    durationMinutes: 60,
    contentType: "LIVE",
    accessKind: "LIVE_REPLAY",
    meetingUrl: "https://zoom.us/j/mock-session"
  }
];

export const mockModules: ModuleDetail[] = [
  {
    id: "module-mock-01",
    courseId: "officer-cadet-elite",
    title: "Module 1: Selection Process Overview",
    position: 0,
    lessons: [mockLessons[0]]
  },
  {
    id: "module-mock-02",
    courseId: "officer-cadet-elite",
    title: "Module 2: Aptitude & Assessment",
    position: 1,
    lessons: [mockLessons[1], mockLessons[2]]
  },
  {
    id: "module-mock-03",
    courseId: "officer-cadet-elite",
    title: "Module 3: Interview Readiness",
    position: 2,
    lessons: [mockLessons[3]]
  }
];
