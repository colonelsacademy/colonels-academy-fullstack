import type {
  ContentType,
  LessonContent,
  LessonLearningMode,
  SubjectArea
} from "@colonels-academy/contracts";

type LessonAccessKind = "PREVIEW" | "STANDARD" | "LIVE_REPLAY" | "DOWNLOADABLE";

type CurriculumLessonSeed = {
  title: string;
  contentType: ContentType;
  phaseNumber?: number;
  synopsis?: string;
  durationMinutes?: number;
  accessKind?: LessonAccessKind;
  learningMode?: LessonLearningMode;
  lessonContent?: LessonContent;
  subjectArea?: SubjectArea;
  componentCode?: string;
  componentLabel?: string;
};

type CurriculumModuleSeed = {
  phaseNumber: number;
  title: string;
  subjectArea?: SubjectArea;
  componentCode?: string;
  componentLabel?: string;
  lessons: CurriculumLessonSeed[];
};

export type BuiltCurriculumLessonSeed = CurriculumLessonSeed & {
  phaseNumber: number;
  position: number;
  synopsis: string;
  accessKind: LessonAccessKind;
  learningMode: LessonLearningMode;
  durationMinutes?: number;
};

export type BuiltCurriculumModuleSeed = Omit<CurriculumModuleSeed, "lessons"> & {
  position: number;
  lessons: BuiltCurriculumLessonSeed[];
};

export type BuiltCurriculumSeed = {
  lessonCount: number;
  modules: BuiltCurriculumModuleSeed[];
};

const TACTICS_COMPONENT = {
  componentCode: "TACTICS",
  componentLabel: "Tactics"
} as const;

const ADMIN_COMPONENT = {
  componentCode: "ADMINISTRATION",
  componentLabel: "Administration"
} as const;

const LAW_COMPONENT = {
  componentCode: "MILITARY_LAW",
  componentLabel: "Military Law"
} as const;

const NATIONAL_COMPONENT = {
  componentCode: "NATIONAL",
  componentLabel: "National"
} as const;

const REGIONAL_COMPONENT = {
  componentCode: "REGIONAL",
  componentLabel: "Regional"
} as const;

const INTERNATIONAL_COMPONENT = {
  componentCode: "INTERNATIONAL",
  componentLabel: "International"
} as const;

const MILITARY_TECH_COMPONENT = {
  componentCode: "MILITARY_TECH",
  componentLabel: "Military Technology"
} as const;

const LEARNING_MODE_LABELS: Record<LessonLearningMode, string> = {
  LESSON: "Self-paced",
  PRACTICE: "Practice task",
  QUIZ: "Quiz/Test",
  LIVE: "Instructor-led",
  FEEDBACK: "Feedback",
  RESOURCE: "Resource"
};

function contentTypeForLearningMode(learningMode: LessonLearningMode): ContentType {
  switch (learningMode) {
    case "QUIZ":
      return "QUIZ";
    case "LIVE":
      return "LIVE";
    case "RESOURCE":
      return "PDF";
    case "LESSON":
    case "PRACTICE":
    case "FEEDBACK":
    default:
      return "TEXT";
  }
}

function lesson(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
): CurriculumLessonSeed {
  return {
    title,
    contentType,
    ...overrides
  };
}

function hybridItem(
  title: string,
  learningMode: LessonLearningMode,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType" | "learningMode"> = {}
): CurriculumLessonSeed {
  return lesson(title, contentTypeForLearningMode(learningMode), {
    learningMode,
    ...overrides
  });
}

function tactics(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...TACTICS_COMPONENT,
    ...overrides
  });
}

function administration(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...ADMIN_COMPONENT,
    ...overrides
  });
}

function militaryLaw(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...LAW_COMPONENT,
    ...overrides
  });
}

function nationalAffairs(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...NATIONAL_COMPONENT,
    ...overrides
  });
}

function regionalAffairs(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...REGIONAL_COMPONENT,
    ...overrides
  });
}

function internationalAffairs(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...INTERNATIONAL_COMPONENT,
    ...overrides
  });
}

function militaryTechnology(
  title: string,
  contentType: ContentType,
  overrides: Omit<CurriculumLessonSeed, "title" | "contentType"> = {}
) {
  return lesson(title, contentType, {
    ...MILITARY_TECH_COMPONENT,
    ...overrides
  });
}

function defaultSynopsis(moduleTitle: string, lessonTitle: string, contentType: ContentType) {
  switch (contentType) {
    case "VIDEO":
      return `Video lesson in ${moduleTitle} covering ${lessonTitle}.`;
    case "PDF":
      return `Downloadable reference in ${moduleTitle} for ${lessonTitle}.`;
    case "LIVE":
      return `Scheduled live faculty session in ${moduleTitle} for ${lessonTitle}.`;
    case "QUIZ":
      return `Practice assessment in ${moduleTitle} focused on ${lessonTitle}.`;
    case "TEXT":
      return `Written study note in ${moduleTitle} covering ${lessonTitle}.`;
    default:
      return `${lessonTitle} in ${moduleTitle}.`;
  }
}

function defaultLessonContent(
  lessonTitle: string,
  synopsis: string,
  learningMode: LessonLearningMode
): LessonContent {
  return {
    mode: "cue",
    segments: [
      {
        text: synopsis,
        durationMs: 5200
      },
      {
        text: `Learning mode: ${LEARNING_MODE_LABELS[learningMode]}`,
        durationMs: 3200
      },
      {
        text: lessonTitle,
        durationMs: 3200
      }
    ]
  };
}

function defaultAccessKind(contentType: ContentType): LessonAccessKind {
  if (contentType === "PDF") {
    return "DOWNLOADABLE";
  }

  return "STANDARD";
}

function defaultDurationMinutes(title: string, contentType: ContentType) {
  if (title.includes("Mock Exam")) {
    return 180;
  }

  if (title.includes("Counselling")) {
    return 45;
  }

  if (contentType === "LIVE") {
    return 90;
  }

  if (contentType === "VIDEO") {
    return 35;
  }

  if (contentType === "QUIZ") {
    return 25;
  }

  return 15;
}

const STAFF_COLLEGE_INTRO_CONTENT: LessonContent = {
  mode: "reading",
  blocks: [
    {
      type: "paragraph",
      text: "Our platform is dedicated to supporting officers of the Nepalese Army in their preparation for the Command & Staff College Entrance Exam."
    },
    {
      type: "paragraph",
      text: "Vision: To empower officers with structured, comprehensive, and modern learning tools that enhance their readiness for the Command & Staff College entrance exam."
    },
    {
      type: "paragraph",
      text: "Mission: To provide accessible, flexible, and interactive study resources that combine individual effort, faculty guidance, and peer collaboration."
    },
    {
      type: "heading",
      text: "Objectives"
    },
    {
      type: "bulletList",
      items: [
        "Equip officers with a clear understanding of exam requirements.",
        "Provide structured study plans and timelines.",
        "Facilitate practice through quizzes, mock exams, and feedback systems.",
        "Foster confidence, discipline, and analytical skills essential for success."
      ]
    }
  ]
};

const STAFF_COLLEGE_OVERVIEW_CONTENT: LessonContent = {
  mode: "cue",
  segments: [
    {
      text: "This platform offers a 9-10 month preparation program designed around the syllabus of the Command & Staff College Entrance Exam.",
      durationMs: 5200
    },
    {
      text: "Subjects Covered:",
      durationMs: 2200
    },
    {
      text: "Military Operations & Administration - Tactics & Administration - 100 Marks",
      durationMs: 3600
    },
    {
      text: "Contemporary Affairs - Current Affairs - 100 Marks",
      durationMs: 3200
    },
    {
      text: "Military History & Strategic Thoughts - Military History - 100 Marks",
      durationMs: 3600
    },
    {
      text: "Armed Conflicts Military Appreciation & Plans - Appreciation - 100 Marks",
      durationMs: 3800
    },
    {
      text: "Lecture Methodology - Lecturette - 100 Marks",
      durationMs: 3200
    }
  ]
};

const staffCollegeCommandCurriculum: CurriculumModuleSeed[] = [
  {
    phaseNumber: 1,
    title: "Program Orientation & Kickoff",
    lessons: [
      hybridItem("Program Introduction", "LESSON", {
        synopsis:
          "Start with the program purpose, vision, mission, and learning objectives before moving into the subject areas.",
        accessKind: "PREVIEW",
        lessonContent: STAFF_COLLEGE_INTRO_CONTENT
      }),
      hybridItem("Overview of the 9-10 Month Program", "LESSON", {
        synopsis:
          "A timed overview of the program duration, structure, and subject areas covered in the exam preparation track.",
        accessKind: "PREVIEW",
        lessonContent: STAFF_COLLEGE_OVERVIEW_CONTENT
      }),
      hybridItem("Exam Format & Subject Weighting", "LESSON"),
      hybridItem("How the Standard Hybrid Model Works", "LESSON"),
      hybridItem("Live Kickoff Class", "LIVE"),
      hybridItem("Platform Walkthrough", "LESSON"),
      hybridItem("Diagnostic Self-Assessment", "QUIZ", { durationMinutes: 45 }),
      hybridItem("Study Expectations & Officer Discipline", "LESSON")
    ]
  },
  {
    phaseNumber: 1,
    title: "Weekly Learning System",
    lessons: [
      hybridItem("Weekly Self-Paced Learning Routine", "LESSON"),
      hybridItem("Weekly Practice & Submission Routine", "PRACTICE"),
      hybridItem("Weekly Live Cadence Overview", "LESSON"),
      hybridItem("Live Class 1: Concept Clinic", "LIVE"),
      hybridItem("Live Class 2: Application & Feedback Lab", "LIVE"),
      hybridItem("Optional Office Hour / Mock Review Clinic", "LIVE"),
      hybridItem("How to Use Replays, Notes, and Action Items", "RESOURCE"),
      hybridItem("Progress Tracking & Instructor Feedback Loop", "FEEDBACK")
    ]
  },
  {
    phaseNumber: 1,
    title: "Military Operations & Administration",
    subjectArea: "TACTICS_ADMIN",
    lessons: [
      tactics("Operations of War", "TEXT", { learningMode: "LESSON" }),
      tactics("Basic Tactics: Patrolling, Raid, Ambush", "TEXT", { learningMode: "LESSON" }),
      tactics(
        "Basic Arms: Infantry, Armor, Artillery, Air Defence, Engineer, Signal, Special Forces",
        "TEXT",
        { learningMode: "LESSON" }
      ),
      tactics("Mountain & Jungle Warfare", "TEXT", { learningMode: "LESSON" }),
      tactics("Counter Insurgency Operations", "TEXT", { learningMode: "LESSON" }),
      tactics("Fighting in Built-up Areas", "TEXT", { learningMode: "LESSON" }),
      tactics("Peacekeeping Operations", "TEXT", { learningMode: "LESSON" }),
      tactics("Intelligence & Security", "TEXT", { learningMode: "LESSON" }),
      administration("Administration in War & Peace", "TEXT", { learningMode: "LESSON" }),
      administration("Training", "TEXT", { learningMode: "LESSON" }),
      administration("Leadership & Man Management", "TEXT", { learningMode: "LESSON" }),
      administration("Organization of the Nepali Army", "TEXT", { learningMode: "LESSON" }),
      militaryLaw("Military Act, Laws, and Regulations", "TEXT", { learningMode: "LESSON" }),
      administration("Logistic System in the Nepali Army", "TEXT", { learningMode: "LESSON" }),
      hybridItem("Tactics/Admin Practice Drills", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "TACTICS_ADMIN"
      }),
      hybridItem("Tactics/Admin Topic Quiz", "QUIZ", {
        phaseNumber: 2,
        subjectArea: "TACTICS_ADMIN"
      }),
      hybridItem("Instructor Concept Clinic", "LIVE", {
        phaseNumber: 2,
        subjectArea: "TACTICS_ADMIN"
      }),
      hybridItem("Instructor Application & Feedback Lab", "FEEDBACK", {
        phaseNumber: 3,
        subjectArea: "TACTICS_ADMIN"
      })
    ]
  },
  {
    phaseNumber: 1,
    title: "Contemporary Affairs & Military Technology",
    subjectArea: "CURRENT_AFFAIRS",
    lessons: [
      nationalAffairs("National Events", "TEXT", { learningMode: "LESSON" }),
      regionalAffairs("Regional Events", "TEXT", { learningMode: "LESSON" }),
      internationalAffairs("International Events", "TEXT", { learningMode: "LESSON" }),
      militaryTechnology("Military Technology", "TEXT", { learningMode: "LESSON" }),
      hybridItem("Current Affairs Note-Making System", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("Weekly Current Affairs Revision", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("Linking News to Nepal's Security Context", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("MCQ and Short Note Practice", "QUIZ", {
        phaseNumber: 2,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("Analytical Essay Practice Using PEEL", "PRACTICE", {
        phaseNumber: 3,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("Instructor Current Affairs Discussion", "LIVE", {
        phaseNumber: 2,
        subjectArea: "CURRENT_AFFAIRS"
      }),
      hybridItem("Current Affairs Essay Feedback", "FEEDBACK", {
        phaseNumber: 3,
        subjectArea: "CURRENT_AFFAIRS"
      })
    ]
  },
  {
    phaseNumber: 1,
    title: "Military History & Strategic Thought",
    subjectArea: "MILITARY_HISTORY_STRATEGY",
    lessons: [
      hybridItem("Ancient, Medieval, Modern, and Contemporary Military History", "LESSON", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Nepali Military History", "LESSON", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Global Wars and Turning Points", "LESSON", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Strategic Thinkers: Sun Tzu, Clausewitz, Jomini, Mao", "LESSON", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Battle and Campaign Case Studies", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Timelines, Maps, and Flashcards", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Military History Essay Practice", "PRACTICE", {
        phaseNumber: 3,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Strategic Thought Short Notes Quiz", "QUIZ", {
        phaseNumber: 2,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Instructor Military History Discussion", "LIVE", {
        phaseNumber: 2,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      hybridItem("Instructor Essay Review Lab", "FEEDBACK", {
        phaseNumber: 3,
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      })
    ]
  },
  {
    phaseNumber: 1,
    title: "Armed Conflicts, Military Appreciation & Plans",
    subjectArea: "APPRECIATION_PLANS",
    lessons: [
      hybridItem("Military Appreciation Framework", "LESSON", {
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Aim, Factors, Courses of Action, Comparison, Decision", "LESSON", {
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Terrain, Enemy, Own Forces, Time, and Logistics Analysis", "LESSON", {
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Tactical Problem Solving", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Map and Sketch Practice", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("SMEAC-Based Plan Writing", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Appreciation Templates", "RESOURCE", { subjectArea: "APPRECIATION_PLANS" }),
      hybridItem("Daily Appreciation Practice", "PRACTICE", {
        phaseNumber: 3,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Appreciation Timed Exercise", "QUIZ", {
        phaseNumber: 3,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Instructor Appreciation Walkthrough", "LIVE", {
        phaseNumber: 2,
        subjectArea: "APPRECIATION_PLANS"
      }),
      hybridItem("Instructor Plan Feedback Lab", "FEEDBACK", {
        phaseNumber: 3,
        subjectArea: "APPRECIATION_PLANS"
      })
    ]
  },
  {
    phaseNumber: 1,
    title: "Lecturette & Oral Presentation",
    subjectArea: "LECTURETTE",
    lessons: [
      hybridItem("Lecturette Format and Expectations", "LESSON", { subjectArea: "LECTURETTE" }),
      hybridItem("Topic Familiarization", "LESSON", { subjectArea: "LECTURETTE" }),
      hybridItem("Introduction, Body, Conclusion Structure", "LESSON", {
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Cue Card Method", "RESOURCE", { subjectArea: "LECTURETTE" }),
      hybridItem("3-5 Minute Delivery Practice", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Voice, Posture, Eye Contact, and Confidence", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Recorded Lecturette Submissions", "PRACTICE", {
        phaseNumber: 2,
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Peer Review", "FEEDBACK", {
        phaseNumber: 2,
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Instructor Live Presentation Lab", "LIVE", {
        phaseNumber: 2,
        subjectArea: "LECTURETTE"
      }),
      hybridItem("Panel-Style Rehearsal", "FEEDBACK", {
        phaseNumber: 3,
        subjectArea: "LECTURETTE"
      })
    ]
  },
  {
    phaseNumber: 1,
    title: "Study Skills, Writing & Exam Technique",
    lessons: [
      hybridItem("Time Management", "LESSON"),
      hybridItem("Active Recall and Spaced Repetition", "LESSON"),
      hybridItem("Military-Style Answer Writing", "LESSON", { phaseNumber: 2 }),
      hybridItem("Short Answer Structure", "PRACTICE", { phaseNumber: 2 }),
      hybridItem("Essay Structure", "PRACTICE", { phaseNumber: 2 }),
      hybridItem("PEEL Method", "PRACTICE", { phaseNumber: 3 }),
      hybridItem("Diagram and Map Use", "PRACTICE", { phaseNumber: 2 }),
      hybridItem("Revision Planning", "PRACTICE", { phaseNumber: 4 }),
      hybridItem("Stress and Readiness Management", "LESSON", { phaseNumber: 6 }),
      hybridItem("Instructor Exam Technique Clinic", "LIVE", { phaseNumber: 3 })
    ]
  },
  {
    phaseNumber: 1,
    title: "Mock Tests & Performance Review",
    lessons: [
      hybridItem("Diagnostic Test", "QUIZ", { durationMinutes: 45 }),
      hybridItem("Topic Quizzes", "QUIZ"),
      hybridItem("Subject-Specific Tests", "QUIZ", { phaseNumber: 2 }),
      hybridItem("Mock Exam I", "QUIZ", { phaseNumber: 2, durationMinutes: 180 }),
      hybridItem("Mock Exam I Review Clinic", "LIVE", { phaseNumber: 2 }),
      hybridItem("Mock Exam II", "QUIZ", { phaseNumber: 3, durationMinutes: 180 }),
      hybridItem("Mock Exam II Review Clinic", "LIVE", { phaseNumber: 3 }),
      hybridItem("Mock Exam III Full Simulation", "QUIZ", {
        phaseNumber: 5,
        durationMinutes: 180
      }),
      hybridItem("Panel Lecturette Evaluation", "LIVE", { phaseNumber: 5 }),
      hybridItem("Final Readiness Self-Assessment", "QUIZ", {
        phaseNumber: 6,
        durationMinutes: 45
      }),
      hybridItem("Instructor Counselling & Weak-Area Plan", "FEEDBACK", { phaseNumber: 6 })
    ]
  },
  {
    phaseNumber: 1,
    title: "9-Month Study Roadmap",
    lessons: [
      hybridItem("Months 1-2: Foundation Phase", "LESSON"),
      hybridItem("Months 3-4: Development Phase", "LESSON"),
      hybridItem("Months 5-6: Application Phase", "LESSON"),
      hybridItem("Month 7: Consolidation Phase", "LESSON"),
      hybridItem("Month 8: Simulation Phase", "LESSON"),
      hybridItem("Month 9: Final Preparation Phase", "LESSON"),
      hybridItem("Optional Month 10 Buffer", "LESSON"),
      hybridItem("Key Milestones Recap", "RESOURCE")
    ]
  },
  {
    phaseNumber: 1,
    title: "Resource Library",
    lessons: [
      hybridItem("Lecture Notes", "RESOURCE"),
      hybridItem("Reading Lists", "RESOURCE"),
      hybridItem("Doctrine References", "RESOURCE"),
      hybridItem("Templates", "RESOURCE"),
      hybridItem("Question Banks", "RESOURCE"),
      hybridItem("Current Affairs Trackers", "RESOURCE"),
      hybridItem("Appreciation Templates", "RESOURCE"),
      hybridItem("Essay Templates", "RESOURCE"),
      hybridItem("Lecturette Cue Card Templates", "RESOURCE"),
      hybridItem("Mock Test Papers", "RESOURCE"),
      hybridItem("Recorded Live Sessions", "RESOURCE")
    ]
  },
  {
    phaseNumber: 1,
    title: "Administrative & Support",
    lessons: [
      hybridItem("Fee Structure and Installment Notes", "LESSON"),
      hybridItem("Demo Class Access", "LESSON"),
      hybridItem("Technical Support", "LESSON"),
      hybridItem("Discussion Forum Guidelines", "LESSON"),
      hybridItem("Mentorship and Counselling Support", "FEEDBACK", { phaseNumber: 4 }),
      hybridItem("Final Preparation Instructions", "LESSON", { phaseNumber: 6 })
    ]
  }
];

export function buildStaffCollegeCommandCurriculumSeed(): BuiltCurriculumSeed {
  let modulePosition = 0;
  let lessonPosition = 0;

  const modules = staffCollegeCommandCurriculum.map((moduleSeed) => {
    modulePosition += 1;

    return {
      ...moduleSeed,
      position: modulePosition,
      lessons: moduleSeed.lessons.map((lessonSeed) => {
        lessonPosition += 1;
        const synopsis =
          lessonSeed.synopsis ??
          defaultSynopsis(moduleSeed.title, lessonSeed.title, lessonSeed.contentType);
        const learningMode = lessonSeed.learningMode ?? "LESSON";

        return {
          ...lessonSeed,
          phaseNumber: lessonSeed.phaseNumber ?? moduleSeed.phaseNumber,
          ...(moduleSeed.subjectArea && !lessonSeed.subjectArea
            ? { subjectArea: moduleSeed.subjectArea }
            : {}),
          ...(moduleSeed.componentCode && !lessonSeed.componentCode
            ? { componentCode: moduleSeed.componentCode }
            : {}),
          ...(moduleSeed.componentLabel && !lessonSeed.componentLabel
            ? { componentLabel: moduleSeed.componentLabel }
            : {}),
          position: lessonPosition,
          synopsis,
          accessKind: lessonSeed.accessKind ?? defaultAccessKind(lessonSeed.contentType),
          learningMode,
          lessonContent:
            lessonSeed.lessonContent ??
            defaultLessonContent(lessonSeed.title, synopsis, learningMode),
          durationMinutes:
            lessonSeed.durationMinutes ??
            defaultDurationMinutes(lessonSeed.title, lessonSeed.contentType)
        };
      })
    };
  });

  return {
    lessonCount: lessonPosition,
    modules
  };
}
