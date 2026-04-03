import type {
  CourseDetail,
  DashboardSnapshot,
  InstructorProfile,
  LiveSessionPreview
} from "./types";

export const instructors: InstructorProfile[] = [
  {
    slug: "rajesh-thapa",
    name: "Col. (Retd.) Rajesh Thapa",
    branch: "Nepal Army",
    experience: "25+ years",
    specialization: "Strategy, command preparation, and selection-board drills",
    avatarUrl: "https://ca-assets.b-cdn.net/images/instructors/rajesh-thapa.jpg",
    bio: "Former directing staff with deep experience preparing officer-cadet and command-track candidates for high-stakes military assessments."
  },
  {
    slug: "kp-sharma",
    name: "DIG (Retd.) K. P. Sharma",
    branch: "Nepal Police",
    experience: "30+ years",
    specialization: "Criminal law, investigation, and oral-board performance",
    avatarUrl: "https://ca-assets.b-cdn.net/images/instructors/kp-sharma.jpg",
    bio: "Law-enforcement mentor focused on analytical reasoning, legal frameworks, and interview readiness for inspector-track learners."
  },
  {
    slug: "sb-basnet",
    name: "AIG (Retd.) S. B. Basnet",
    branch: "APF Nepal",
    experience: "28+ years",
    specialization: "Border security, tactical ops, and field leadership",
    avatarUrl: "https://ca-assets.b-cdn.net/images/instructors/sb-basnet.jpg",
    bio: "Operations-focused instructor helping cadets translate theory into disciplined, scenario-based decision making."
  }
];

export const courseCatalog: CourseDetail[] = [
  {
    slug: "staff-college-command",
    title: "Nepal Army Staff College Command Track [2026]",
    track: "staff",
    summary:
      "Strategic exam prep for command-level candidates balancing military history, staff writing, and operational analysis.",
    description:
      "A flagship command-preparation program for experienced candidates targeting the Staff College pathway. It combines doctrine review, case-study breakdowns, command writing, and structured coaching.",
    level: "Advanced",
    durationLabel: "60 hours",
    lessonCount: 75,
    priceNpr: 8500,
    originalPriceNpr: 12000,
    accentColor: "#5E6B3C",
    heroImageUrl: "https://ca-assets.b-cdn.net/images/courses/nepal-army-staff-college.png",
    featured: true,
    format: "hybrid",
    liveSupport: "Weekly faculty-led doctrine clinic and answer-writing review.",
    instructorSlugs: ["rajesh-thapa"],
    outcomeBullets: [
      "Build staff-college answer structure with command clarity",
      "Practice doctrinal interpretation under time pressure",
      "Review high-value historical case studies"
    ],
    syllabus: [
      "Operational art and campaign framing",
      "Military history and command essays",
      "Doctrine interpretation workshops",
      "Timed staff writing and review"
    ]
  },
  {
    slug: "police-inspector-cadet",
    title: "Nepal Police Inspector Cadet [2026]",
    track: "police",
    summary:
      "A complete inspector-cadet preparation path covering law, investigation, interview drills, and exam stamina.",
    description:
      "This track is built for aspirants preparing for Nepal Police Inspector selection with guided study plans, mock assessments, and legal-procedure breakdowns.",
    level: "Intermediate",
    durationLabel: "50 hours",
    lessonCount: 65,
    priceNpr: 4500,
    originalPriceNpr: 7500,
    accentColor: "#224785",
    heroImageUrl: "https://ca-assets.b-cdn.net/images/courses/nepal-police-inspector-cadet.png",
    featured: true,
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
  },
  {
    slug: "apf-inspector-cadet",
    title: "APF Inspector Cadet [2026]",
    track: "apf",
    summary:
      "Focused preparation for APF candidates emphasizing tactical judgement, border-security operations, and leadership readiness.",
    description:
      "Designed for Armed Police Force aspirants who need structured tactical revision, leadership coaching, and assessment-focused operational scenarios.",
    level: "Intermediate",
    durationLabel: "45 hours",
    lessonCount: 55,
    priceNpr: 4500,
    originalPriceNpr: 7000,
    accentColor: "#B6762C",
    heroImageUrl: "https://ca-assets.b-cdn.net/images/courses/apf-inspector-cadet.png",
    featured: true,
    format: "hybrid",
    liveSupport: "Weekend live tactical scenario lab with faculty review.",
    instructorSlugs: ["sb-basnet"],
    outcomeBullets: [
      "Train tactical decision-making for field scenarios",
      "Sharpen border-security and internal-security fundamentals",
      "Prepare concise, confident leadership responses"
    ],
    syllabus: [
      "Border management fundamentals",
      "Tactical operations and scenario planning",
      "Command presence and communication",
      "Mock assessments"
    ]
  },
  {
    slug: "officer-cadet-elite",
    title: "Nepal Army Officer Cadet Elite [2026]",
    track: "army",
    summary:
      "The broadest officer-cadet prep path, designed for disciplined daily study and measurable performance gains.",
    description:
      "An end-to-end officer-cadet course that blends aptitude, military fundamentals, interview confidence, and guided weekly planning.",
    level: "Beginner",
    durationLabel: "45 hours",
    lessonCount: 50,
    priceNpr: 4500,
    originalPriceNpr: 7000,
    accentColor: "#8F7A38",
    heroImageUrl: "https://ca-assets.b-cdn.net/images/courses/nepal-army-officer-cadet.png",
    featured: true,
    format: "cohort",
    liveSupport: "Structured faculty office hours and cohort checkpoints.",
    instructorSlugs: ["rajesh-thapa"],
    outcomeBullets: [
      "Build an exam-ready daily preparation rhythm",
      "Improve aptitude, communication, and confidence together",
      "Follow a simple but disciplined route to interview readiness"
    ],
    syllabus: [
      "Cadet aptitude system",
      "Military awareness essentials",
      "Interview preparation",
      "Revision and mock performance tracking"
    ]
  },
  {
    slug: "mission-english-ops",
    title: "Mission English and Deployment Readiness",
    track: "mission",
    summary:
      "Language and communication preparation for UN deployment, pre-deployment testing, and international exercises.",
    description:
      "A targeted language program for officers and personnel who need structured mission-facing English, listening, and speaking practice.",
    level: "Intermediate",
    durationLabel: "20 hours",
    lessonCount: 15,
    priceNpr: 6000,
    originalPriceNpr: 9000,
    accentColor: "#8C4136",
    heroImageUrl: "https://ca-assets.b-cdn.net/images/courses/nepal-army-officer-cadet.png",
    featured: false,
    format: "self-paced",
    liveSupport: "Monthly pronunciation and briefing workshop.",
    instructorSlugs: ["rajesh-thapa"],
    outcomeBullets: [
      "Improve briefing fluency and comprehension",
      "Practice mission-focused vocabulary and listening",
      "Prepare for deployment-related communication tasks"
    ],
    syllabus: [
      "Mission vocabulary",
      "Listening and comprehension drills",
      "Spoken briefings",
      "Deployment readiness checkpoints"
    ]
  }
];

export const upcomingSessions: LiveSessionPreview[] = [
  {
    id: "session-staff-01",
    courseSlug: "staff-college-command",
    title: "Command writing studio",
    startsAt: "2026-04-03T13:00:00.000Z",
    endsAt: "2026-04-03T14:30:00.000Z",
    deliveryMode: "zoom",
    replayAvailable: true
  },
  {
    id: "session-police-01",
    courseSlug: "police-inspector-cadet",
    title: "Case-analysis live drill",
    startsAt: "2026-04-04T12:00:00.000Z",
    endsAt: "2026-04-04T13:00:00.000Z",
    deliveryMode: "hybrid",
    replayAvailable: true
  },
  {
    id: "session-army-01",
    courseSlug: "officer-cadet-elite",
    title: "Cadet aptitude sprint review",
    startsAt: "2026-04-05T11:30:00.000Z",
    endsAt: "2026-04-05T12:30:00.000Z",
    deliveryMode: "in-app",
    replayAvailable: false
  }
];

export const dashboardSnapshot: DashboardSnapshot = {
  progressPercent: 62,
  enrolledCourses: 3,
  upcomingSessionCount: 2,
  pendingTasks: 4,
  completionTarget: "Officer Cadet board window"
};
