import type { CourseDetail } from "@colonels-academy/contracts";

export const mockCourses: CourseDetail[] = [
  {
    slug: "officer-cadet-elite",
    title: "Nepal Army Officer Cadet Elite [2026]",
    track: "army",
    summary:
      "End-to-end officer-cadet prep blending aptitude, military fundamentals, and interview confidence.",
    description:
      "A guided weekly program covering IQ, GK, and physical readiness for the Nepal Army Officer Cadet selection board.",
    level: "Beginner",
    durationLabel: "45 hours",
    lessonCount: 50,
    priceNpr: 4500,
    originalPriceNpr: 7000,
    accentColor: "#8F7A38",
    heroImageUrl: "/images/courses/officer-cadet-elite.jpg",
    featured: true,
    isComingSoon: false,
    format: "cohort",
    liveSupport: "Structured faculty office hours and cohort checkpoints.",
    instructorSlugs: ["rajesh-thapa"],
    outcomeBullets: [
      "Build an exam-ready daily preparation rhythm",
      "Improve aptitude, communication, and confidence",
      "Follow a disciplined route to interview readiness"
    ],
    syllabus: [
      "Cadet aptitude system",
      "Military awareness essentials",
      "Interview preparation",
      "Revision and mock performance tracking"
    ]
  },
  {
    slug: "police-inspector-cadet",
    title: "Nepal Police Inspector Cadet [2026]",
    track: "police",
    summary:
      "Complete inspector-cadet prep covering law, investigation, interview drills, and exam stamina.",
    description:
      "Guided study plans, mock assessments, and legal-procedure breakdowns for Nepal Police Inspector selection.",
    level: "Intermediate",
    durationLabel: "50 hours",
    lessonCount: 65,
    priceNpr: 4500,
    originalPriceNpr: 7500,
    accentColor: "#224785",
    heroImageUrl: "/images/courses/police-inspector-cadet.jpg",
    featured: true,
    isComingSoon: false,
    format: "cohort",
    liveSupport: "Twice-weekly oral-board rehearsal and case debrief sessions.",
    instructorSlugs: ["kp-sharma"],
    outcomeBullets: [
      "Strengthen legal recall and applied reasoning",
      "Improve case-analysis structure for written exams",
      "Prepare for interview and board confidence"
    ],
    syllabus: [
      "Criminal law essentials",
      "Investigation frameworks",
      "Case-study analysis",
      "Interview and viva practice"
    ]
  }
];
