import type {
  CourseAssessmentWeighting,
  CourseDetail,
  CoursePhaseBlueprint,
  DashboardSnapshot,
  InstructorProfile,
  LiveSessionPreview,
  WeeklyStudyScheduleDay
} from "./types";

export const instructors: InstructorProfile[] = [
  {
    slug: "rajesh-thapa",
    name: "Col. (Retd.) Rajesh Thapa",
    branch: "Nepal Army",
    experience: "25+ years",
    specialization: "Strategy, command preparation, and selection-board drills",
    avatarUrl: "https://uat.thecolonelsacademy.com/images/instructors/Rajesh%20Thapa.png",
    bio: "Former directing staff with deep experience preparing officer-cadet and command-track candidates for high-stakes military assessments."
  },
  {
    slug: "kp-sharma",
    name: "DIG (Retd.) K. P. Sharma",
    branch: "Nepal Police",
    experience: "30+ years",
    specialization: "Criminal law, investigation, and oral-board performance",
    avatarUrl: "https://uat.thecolonelsacademy.com/images/instructors/KP%20Sharma.png",
    bio: "Law-enforcement mentor focused on analytical reasoning, legal frameworks, and interview readiness for inspector-track learners."
  },
  {
    slug: "sb-basnet",
    name: "AIG (Retd.) S. B. Basnet",
    branch: "APF Nepal",
    experience: "28+ years",
    specialization: "Border security, tactical ops, and field leadership",
    avatarUrl: "https://uat.thecolonelsacademy.com/images/instructors/SB%20Basnet.png",
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
    durationLabel: "9-10 months",
    lessonCount: 122,
    priceNpr: 8500,
    originalPriceNpr: 12000,
    accentColor: "#5E6B3C",
    heroImageUrl: "/images/courses/nepal-army-staff-college.jpg",
    featured: true,
    isComingSoon: false,
    format: "hybrid",
    liveSupport:
      "Live kickoff, twice-weekly instructor check-ins, and optional mock-review clinics during key preparation phases.",
    instructorSlugs: ["rajesh-thapa"],
    outcomeBullets: [
      "Follow a structured self-paced roadmap with weekly instructor accountability",
      "Practice mock tests, appreciation exercises, essays, and lecturette submissions",
      "Use instructor feedback to close weak areas before final readiness review"
    ],
    syllabus: [
      "Program Orientation & Kickoff",
      "Weekly Learning System",
      "Military Operations & Administration",
      "Contemporary Affairs & Military Technology",
      "Military History & Strategic Thought",
      "Armed Conflicts, Military Appreciation & Plans",
      "Lecturette & Oral Presentation",
      "Study Skills, Writing & Exam Technique",
      "Mock Tests & Performance Review",
      "9-Month Study Roadmap",
      "Resource Library",
      "Administrative & Support"
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
    heroImageUrl: "/images/courses/nepal-police-inspector-cadet.jpg",
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
    heroImageUrl: "/images/courses/apf-inspector-cadet.jpg",
    featured: true,
    isComingSoon: false,
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
    heroImageUrl: "/images/courses/nepal-army-officer-cadet.jpg",
    featured: false,
    isComingSoon: false,
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
    heroImageUrl: "/images/courses/mission-english-ops.jpg",
    featured: false,
    isComingSoon: false,
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

export const staffCollegeCommandAssessmentWeighting: CourseAssessmentWeighting = {
  label: "Nepal Army Staff College Command Track [2026] weighting model",
  subjects: [
    {
      subjectArea: "TACTICS_ADMIN",
      label: "Tactics & Administration",
      weightPercent: 20,
      components: [
        {
          code: "TACTICS",
          label: "Tactics",
          weightPercent: 70
        },
        {
          code: "ADMINISTRATION",
          label: "Administration",
          weightPercent: 20
        },
        {
          code: "MILITARY_LAW",
          label: "Military Law",
          weightPercent: 10
        }
      ]
    },
    {
      subjectArea: "CURRENT_AFFAIRS",
      label: "Contemporary Affairs",
      weightPercent: 20,
      components: [
        {
          code: "NATIONAL",
          label: "National",
          weightPercent: 40
        },
        {
          code: "REGIONAL",
          label: "Regional",
          weightPercent: 30
        },
        {
          code: "INTERNATIONAL",
          label: "International",
          weightPercent: 20
        },
        {
          code: "MILITARY_TECH",
          label: "Military Technology",
          weightPercent: 10
        }
      ]
    },
    {
      subjectArea: "MILITARY_HISTORY_STRATEGY",
      label: "Military History & Strategic Thoughts",
      weightPercent: 20
    },
    {
      subjectArea: "APPRECIATION_PLANS",
      label: "Military Appreciation & Plans",
      weightPercent: 20
    },
    {
      subjectArea: "LECTURETTE",
      label: "Lecturette / Oral Presentation",
      weightPercent: 20
    }
  ]
};

export const staffCollegeCommandPhaseBlueprints: CoursePhaseBlueprint[] = [
  {
    phaseNumber: 1,
    slug: "foundation",
    title: "Foundation",
    monthLabel: "Month 1",
    focus: "Build doctrinal foundations and study habits across all five subjects.",
    summary:
      "Officers establish fundamentals in tactics and administration, current-affairs methodology, military history, appreciation basics, and lecturette confidence.",
    subjectThemes: [
      "Tactics and administration fundamentals",
      "Current-affairs note-making and defence relevance",
      "Military history foundations",
      "Appreciation doctrine basics",
      "Lecturette introduction and short delivery drills"
    ],
    liveSessionPattern:
      "A live kickoff followed by twice-weekly instructor sessions focused on orientation, doctrine walkthroughs, and guided Q&A.",
    milestone: {
      id: "phase-1-self-assessment",
      title: "Self-Assessment Quiz",
      description:
        "A phase-end readiness check covering foundational concepts before the development phase unlocks.",
      criteria: [
        {
          kind: "QUIZ_SCORE",
          label: "Score at least 60% on the self-assessment quiz",
          threshold: 60,
          unit: "%",
          manualReview: false
        }
      ]
    }
  },
  {
    phaseNumber: 2,
    slug: "development",
    title: "Development",
    monthLabel: "Month 2",
    focus: "Deepen subject knowledge and move from recall into guided application.",
    summary:
      "Learners progress into scenario exercises, case-based discussions, military law and administration study, strategic thinkers, and structured 10-minute presentations.",
    subjectThemes: [
      "Advanced tactics and scenario exercises",
      "Administration, leadership, and military law",
      "Strategic thinkers and modern military history",
      "Appreciation workshops and simulation drills",
      "Structured lecturette delivery"
    ],
    liveSessionPattern:
      "Twice-weekly instructor sessions focused on case studies, answer review, and faculty-guided discussion.",
    milestone: {
      id: "phase-2-mock-exam-1",
      title: "Mock Exam I",
      description:
        "First timed mock across the command-track syllabus to confirm readiness for higher-pressure work.",
      criteria: [
        {
          kind: "ASSESSMENT_ATTEMPT",
          label: "Attempt Mock Exam I",
          manualReview: false
        },
        {
          kind: "ASSESSMENT_SCORE",
          label: "Score at least 40% overall",
          threshold: 40,
          unit: "%",
          manualReview: false
        }
      ]
    }
  },
  {
    phaseNumber: 3,
    slug: "application",
    title: "Application",
    monthLabel: "Month 3",
    focus: "Practice exam-style writing, analytical judgment, and timed execution.",
    summary:
      "This phase emphasizes essay technique, current-affairs analysis, appreciation writing, comparative history responses, and formal lecturette practice with Q&A.",
    subjectThemes: [
      "Essay writing for tactics and law",
      "PEEL-based current-affairs analysis",
      "Comparative military history responses",
      "Full appreciation and planning exercises",
      "Formal presentation and Q&A handling"
    ],
    liveSessionPattern:
      "Twice-weekly instructor sessions centered on faculty review, writing clinics, and exercise debriefs, with optional mock-review clinics.",
    milestone: {
      id: "phase-3-mock-exam-2",
      title: "Mock Exam II",
      description:
        "A timed mock that tests applied understanding across subjects before weak-area consolidation begins.",
      criteria: [
        {
          kind: "ASSESSMENT_ATTEMPT",
          label: "Complete Mock Exam II under timed conditions",
          manualReview: false
        },
        {
          kind: "ASSESSMENT_SCORE",
          label: "Meet the configured passing threshold for Mock Exam II",
          threshold: 50,
          unit: "%",
          manualReview: false
        }
      ]
    }
  },
  {
    phaseNumber: 4,
    slug: "consolidation",
    title: "Consolidation",
    monthLabel: "Month 4",
    focus: "Repair weak areas, polish exam method, and bring DS back into the loop.",
    summary:
      "Officers revisit weak subjects, complete mixed-format practice, refine lecturette performance, and prepare for progression review with DS.",
    subjectThemes: [
      "Targeted weak-area review",
      "Mixed MCQ and essay practice",
      "Lecturette rehearsals with faculty feedback",
      "Progress review and mentorship conversations"
    ],
    liveSessionPattern:
      "Twice-weekly instructor sessions focused on remediation, faculty feedback, and progress review.",
    milestone: {
      id: "phase-4-ds-approval",
      title: "DS Review and Approval",
      description:
        "Directing Staff reviews effort, engagement, and readiness before simulation content opens.",
      criteria: [
        {
          kind: "DS_APPROVAL",
          label: "Receive Directing Staff approval to progress",
          manualReview: true
        }
      ]
    }
  },
  {
    phaseNumber: 5,
    slug: "simulation",
    title: "Simulation",
    monthLabel: "Month 5",
    focus: "Recreate exam conditions and evaluate performance at full intensity.",
    summary:
      "Learners complete full-length simulation assessments, receive faculty debriefs, and submit advanced lecturette work for evaluated review.",
    subjectThemes: [
      "Full mock simulation across all subjects",
      "Post-exam faculty review",
      "Panel-style lecturette evaluation",
      "Individualized performance feedback"
    ],
    liveSessionPattern:
      "Twice-weekly instructor sessions for simulation debriefs, strategy adjustments, and panel practice, with optional review clinics.",
    milestone: {
      id: "phase-5-mock-exam-3",
      title: "Mock Exam III",
      description:
        "A full simulation milestone that confirms officers have experienced the pressure and pacing of the real exam cycle.",
      criteria: [
        {
          kind: "ASSESSMENT_ATTEMPT",
          label: "Complete Mock Exam III full simulation",
          manualReview: false
        }
      ]
    }
  },
  {
    phaseNumber: 6,
    slug: "final-preparation",
    title: "Final Preparation",
    monthLabel: "Month 6",
    focus: "Finalize revision, readiness, and confidence ahead of the real exam window.",
    summary:
      "The closing phase compresses revision, short quizzes, counselling, and exam-readiness work into a disciplined final push.",
    subjectThemes: [
      "Rapid revision across all subjects",
      "Daily recall quizzes and short drills",
      "Stress and time management",
      "Final lecturette polish and counselling"
    ],
    liveSessionPattern:
      "Twice-weekly instructor sessions for final Q&A, revision support, and readiness counselling.",
    milestone: {
      id: "phase-6-final-readiness",
      title: "Final Readiness Check",
      description:
        "A final self-assessment and counselling checkpoint to close the command-track program.",
      criteria: [
        {
          kind: "QUIZ_SCORE",
          label: "Complete the final self-assessment",
          manualReview: false
        },
        {
          kind: "COUNSELLING",
          label: "Complete final counselling with DS",
          unit: "step",
          manualReview: true
        }
      ]
    }
  }
];

export const staffCollegeCommandWeeklySchedule: WeeklyStudyScheduleDay[] = [
  {
    day: "Sunday",
    morning: "Tactics & Military Technology",
    afternoon: "Military History",
    evening: "Tactics & Military Technology quiz"
  },
  {
    day: "Monday",
    morning: "Appreciation theory & application",
    afternoon: "Military Law, Administration & Leadership",
    evening: "Current Affairs topic selection"
  },
  {
    day: "Tuesday",
    morning: "Military History",
    afternoon: "Writing skills",
    evening: "Current Affairs review"
  },
  {
    day: "Wednesday",
    morning: "Administration & Leadership",
    afternoon: "Military Law",
    evening: "Military Law and Administration quiz"
  },
  {
    day: "Thursday",
    morning: "Tactics & Military Technology",
    afternoon: "Appreciation theory & application",
    evening: "Appreciation quiz"
  },
  {
    day: "Friday",
    morning: "Current Affairs review",
    afternoon: "Expert talk or recorded lecture",
    evening: "Planning for next week",
    note: "Use the live-class calendar to anchor the three weekly instructor-led sessions."
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
