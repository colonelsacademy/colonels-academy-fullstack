import type { ContentType, SubjectArea } from "@colonels-academy/contracts";

type LessonAccessKind = "PREVIEW" | "STANDARD" | "LIVE_REPLAY" | "DOWNLOADABLE";

type CurriculumLessonSeed = {
  title: string;
  contentType: ContentType;
  synopsis?: string;
  durationMinutes?: number;
  accessKind?: LessonAccessKind;
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

const staffCollegeCommandCurriculum: CurriculumModuleSeed[] = [
  {
    phaseNumber: 1,
    title: "Tactics & Administration — Foundations",
    subjectArea: "TACTICS_ADMIN",
    lessons: [
      tactics("Operation of War", "VIDEO"),
      tactics("Basic Tactics — Patrolling, Raid, Ambush", "VIDEO", {
        synopsis: "Video lesson with companion notes on patrolling, raids, and ambush drills."
      }),
      tactics(
        "Basic Arms — Infantry, Armor, Artillery, Air Defence, Engineer, Signal, Special Forces",
        "VIDEO"
      ),
      tactics("Mountain & Jungle Warfare", "VIDEO"),
      lesson("How to Prepare for Tactics & Admin", "TEXT"),
      tactics("Tactics Fundamentals Quiz", "QUIZ")
    ]
  },
  {
    phaseNumber: 1,
    title: "Military History — Ancient to Modern",
    subjectArea: "MILITARY_HISTORY_STRATEGY",
    lessons: [
      lesson("Introduction & Study Method", "TEXT"),
      lesson("Ancient Warfare — Key Battles", "VIDEO"),
      lesson("Nepali Military History — Anglo-Nepal War 1814", "VIDEO"),
      lesson("Strategic Thinkers — Sun Tzu", "VIDEO"),
      lesson("History Short-Answer Practice", "QUIZ")
    ]
  },
  {
    phaseNumber: 1,
    title: "Appreciation Theory — Aim to Decision",
    subjectArea: "APPRECIATION_PLANS",
    lessons: [
      lesson("Appreciation Steps Explained", "VIDEO"),
      lesson("Appreciation Format — SMEAC Template", "PDF"),
      lesson("Live: Appreciation Case Study Discussion", "LIVE")
    ]
  },
  {
    phaseNumber: 1,
    title: "Oral Presentation — Introduction",
    subjectArea: "LECTURETTE",
    lessons: [
      lesson("Public Speaking Techniques", "VIDEO"),
      lesson("3-Part Structure — Intro, Body, Conclusion", "TEXT"),
      lesson("Practice: 3-minute presentation", "QUIZ")
    ]
  },
  {
    phaseNumber: 2,
    title: "Advanced Tactics",
    subjectArea: "TACTICS_ADMIN",
    componentCode: TACTICS_COMPONENT.componentCode,
    componentLabel: TACTICS_COMPONENT.componentLabel,
    lessons: [
      tactics("Counter Insurgency Operations", "VIDEO"),
      tactics("Fighting in Built-up Area", "VIDEO"),
      tactics("Peacekeeping Operations — UN Mandates & Rules of Engagement", "VIDEO"),
      tactics("Intelligence & Security", "VIDEO"),
      tactics("Advanced Tactics Scenario Exercise", "QUIZ")
    ]
  },
  {
    phaseNumber: 2,
    title: "Military Administration & Law",
    subjectArea: "TACTICS_ADMIN",
    lessons: [
      administration("Administration in War & Peace", "VIDEO"),
      administration("Training — Methods and Doctrine", "VIDEO"),
      administration("Leadership & Man Management", "VIDEO"),
      administration("Organization of Nepali Army", "PDF"),
      militaryLaw("Military Act, Laws & Regulations", "TEXT"),
      administration("Logistic System in Nepali Army", "VIDEO"),
      lesson("Admin & Law Quiz", "QUIZ")
    ]
  },
  {
    phaseNumber: 2,
    title: "20th Century Wars & Nepali Military History",
    subjectArea: "MILITARY_HISTORY_STRATEGY",
    lessons: [
      lesson("World Wars — Key Turning Points", "VIDEO"),
      lesson("Cold War & Modern Insurgencies", "VIDEO"),
      lesson("Gurkha Campaigns & UN Peacekeeping History", "VIDEO"),
      lesson("Strategic Thinkers — Clausewitz & Jomini", "VIDEO"),
      lesson("Strategic Thinkers — Mao Zedong", "VIDEO"),
      lesson("Live: Strategic Thinkers Discussion", "LIVE"),
      lesson("History Essay Practice", "QUIZ")
    ]
  },
  {
    phaseNumber: 2,
    title: "Appreciation Simulations",
    subjectArea: "APPRECIATION_PLANS",
    lessons: [
      lesson("Platoon Attack — Appreciation Exercise", "QUIZ"),
      lesson("Company Defense — Appreciation Exercise", "QUIZ"),
      lesson("Live: Appreciation Workshop", "LIVE")
    ]
  },
  {
    phaseNumber: 2,
    title: "Structured Presentations — 10 Minutes",
    subjectArea: "LECTURETTE",
    lessons: [
      lesson("Delivering a 10-minute Lecturette", "VIDEO"),
      lesson("Voice Modulation & Body Language", "TEXT"),
      lesson("Live: Peer Feedback Presentation Class", "LIVE")
    ]
  },
  {
    phaseNumber: 2,
    title: "Mock Exam I — All Subjects",
    lessons: [lesson("Mock Exam I", "QUIZ", { durationMinutes: 180 })]
  },
  {
    phaseNumber: 3,
    title: "Tactics Essay Writing & Exam Technique",
    subjectArea: "TACTICS_ADMIN",
    lessons: [
      tactics("Essay Writing for Tactics Questions", "TEXT"),
      tactics("Tactical Scenario Essay Practice", "QUIZ"),
      tactics("Live: Tactics Essay Review", "LIVE")
    ]
  },
  {
    phaseNumber: 3,
    title: "Contemporary Affairs — System & Method",
    subjectArea: "CURRENT_AFFAIRS",
    lessons: [
      lesson("How to Follow Current Affairs Daily", "TEXT"),
      lesson("Structured Note-Making System", "TEXT"),
      nationalAffairs("National Security & Defence — Key Topics", "VIDEO"),
      regionalAffairs("Regional Affairs — South Asia, China, India", "VIDEO"),
      internationalAffairs("Global Affairs — UN, NATO, Conflicts", "VIDEO"),
      militaryTechnology("Military Technology Trends", "VIDEO"),
      lesson("PEEL Essay Method for Current Affairs", "TEXT"),
      lesson("Current Affairs Quiz", "QUIZ"),
      lesson("Live: Current Affairs Briefing", "LIVE")
    ]
  },
  {
    phaseNumber: 3,
    title: "Military History — Comparative Essays",
    subjectArea: "MILITARY_HISTORY_STRATEGY",
    lessons: [
      lesson("Comparing Leadership Across Battles", "TEXT"),
      lesson("Case Study: Battle of Nalapani (1814)", "VIDEO"),
      lesson("Comparative Essay Practice", "QUIZ"),
      lesson("Live: History Essay Workshop", "LIVE")
    ]
  },
  {
    phaseNumber: 3,
    title: "Full-Length Appreciation Exercises",
    subjectArea: "APPRECIATION_PLANS",
    lessons: [
      lesson("Full Appreciation — Written Exercise 1", "QUIZ"),
      lesson("Full Plan — Written Exercise 2", "QUIZ"),
      lesson("Military Plans Format — SMEAC Deep Dive", "VIDEO"),
      lesson("Live: Appreciation Full Exercise Review", "LIVE")
    ]
  },
  {
    phaseNumber: 3,
    title: "Formal Presentations with Q&A",
    subjectArea: "LECTURETTE",
    lessons: [
      lesson("Handling Q&A After a Presentation", "VIDEO"),
      lesson("Exam-Condition Presentation Practice", "TEXT"),
      lesson("Live: Formal Presentation with Panel Q&A", "LIVE")
    ]
  },
  {
    phaseNumber: 3,
    title: "Mock Exam II — All Subjects",
    lessons: [lesson("Mock Exam II", "QUIZ", { durationMinutes: 180 })]
  },
  {
    phaseNumber: 4,
    title: "Weak Area Targeted Review",
    lessons: [
      tactics("Tactics Weak Area Review", "VIDEO", { subjectArea: "TACTICS_ADMIN" }),
      lesson("Current Affairs Weak Area Review", "VIDEO", { subjectArea: "CURRENT_AFFAIRS" }),
      lesson("History Weak Area Review", "VIDEO", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      lesson("Appreciation Weak Area Review", "VIDEO", { subjectArea: "APPRECIATION_PLANS" }),
      lesson("Live: Faculty Weak Area Clinic", "LIVE")
    ]
  },
  {
    phaseNumber: 4,
    title: "Mixed Format Practice — MCQ + Essays",
    lessons: [
      lesson("Mixed MCQ Drill — All Subjects", "QUIZ"),
      lesson("Timed Essay Practice — All Subjects", "QUIZ"),
      lesson("Live: Essay Marking Workshop", "LIVE")
    ]
  },
  {
    phaseNumber: 4,
    title: "Presentation Rehearsals with Faculty",
    subjectArea: "LECTURETTE",
    lessons: [
      lesson("Live: Faculty-Reviewed Presentation 1", "LIVE", { durationMinutes: 60 }),
      lesson("Live: Faculty-Reviewed Presentation 2", "LIVE", { durationMinutes: 60 })
    ]
  },
  {
    phaseNumber: 5,
    title: "Final Revision Before Simulation",
    lessons: [
      lesson("Revision: Tactics & Admin Summary Notes", "PDF", { subjectArea: "TACTICS_ADMIN" }),
      lesson("Revision: Current Affairs Key Points", "PDF", { subjectArea: "CURRENT_AFFAIRS" }),
      lesson("Revision: Military History Summary", "PDF", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      lesson("Revision: Appreciation Templates", "PDF", { subjectArea: "APPRECIATION_PLANS" }),
      lesson("Revision: Oral Technique Cue Card", "PDF", { subjectArea: "LECTURETTE" })
    ]
  },
  {
    phaseNumber: 5,
    title: "Mock Exam III — Full Simulation",
    lessons: [lesson("Mock Exam III", "QUIZ", { durationMinutes: 180 })]
  },
  {
    phaseNumber: 5,
    title: "Post-Exam Faculty Review",
    lessons: [
      lesson("Live: Mock Exam III Debrief Session 1", "LIVE"),
      lesson("Live: Mock Exam III Debrief Session 2", "LIVE"),
      lesson("Individualized Feedback Report", "TEXT")
    ]
  },
  {
    phaseNumber: 5,
    title: "Panel Presentation Evaluation",
    subjectArea: "LECTURETTE",
    lessons: [lesson("Live: Panel Presentation — Evaluated", "LIVE", { durationMinutes: 60 })]
  },
  {
    phaseNumber: 6,
    title: "Quick Revision — All Subjects",
    lessons: [
      lesson("Final Summary: Tactics & Admin", "PDF", { subjectArea: "TACTICS_ADMIN" }),
      lesson("Final Summary: Current Affairs", "PDF", { subjectArea: "CURRENT_AFFAIRS" }),
      lesson("Final Summary: Military History & Strategy", "PDF", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      lesson("Final Summary: Appreciation & Plans", "PDF", {
        subjectArea: "APPRECIATION_PLANS"
      }),
      lesson("Final Summary: Lecturette Technique", "PDF", { subjectArea: "LECTURETTE" }),
      tactics("Daily Short Quiz — Tactics", "QUIZ", { subjectArea: "TACTICS_ADMIN" }),
      lesson("Daily Short Quiz — Current Affairs", "QUIZ", { subjectArea: "CURRENT_AFFAIRS" }),
      lesson("Daily Short Quiz — History", "QUIZ", {
        subjectArea: "MILITARY_HISTORY_STRATEGY"
      }),
      lesson("Daily Short Quiz — Appreciation", "QUIZ", {
        subjectArea: "APPRECIATION_PLANS"
      })
    ]
  },
  {
    phaseNumber: 6,
    title: "Exam Readiness",
    lessons: [
      lesson("Stress Management Techniques", "TEXT"),
      lesson("Time Management in the Exam Hall", "TEXT"),
      lesson("Exam Format Reference Card", "TEXT"),
      lesson("Live: Final Q&A with Faculty", "LIVE")
    ]
  },
  {
    phaseNumber: 6,
    title: "Final Self-Assessment + Counselling",
    lessons: [
      lesson("Final Self-Assessment Quiz", "QUIZ", { durationMinutes: 45 }),
      lesson("Live: 1-on-1 Counselling with DS", "LIVE", { durationMinutes: 45 })
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

        return {
          ...lessonSeed,
          phaseNumber: moduleSeed.phaseNumber,
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
          synopsis:
            lessonSeed.synopsis ??
            defaultSynopsis(moduleSeed.title, lessonSeed.title, lessonSeed.contentType),
          accessKind: lessonSeed.accessKind ?? defaultAccessKind(lessonSeed.contentType),
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
