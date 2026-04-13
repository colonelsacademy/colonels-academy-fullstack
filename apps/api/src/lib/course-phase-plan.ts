import type { FastifyBaseLogger } from "fastify";

import type {
  CoursePhaseBlueprint,
  CoursePhaseDetail,
  CoursePhaseMilestone,
  CoursePhasesResponse,
  LearningMilestonesResponse,
  PhaseMilestoneCriterion,
  PhaseMilestoneStatus
} from "@colonels-academy/contracts";
import {
  staffCollegeCommandPhaseBlueprints,
  staffCollegeCommandWeeklySchedule
} from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { parseCriteria } from "./milestone-progress";

const STAFF_COLLEGE_COMMAND_SLUG = "staff-college-command";

export interface CoursePhaseAccessContext {
  courseId?: string;
  currentPhaseNumber: number;
  isAdminOrDs: boolean;
  isEnrolled: boolean;
  completedPhaseNumbers: Set<number>;
  pendingPhaseNumbers: Set<number>;
  completionLabelsByPhase: Map<number, string>;
  note: string;
}

function getPhasePlanConfig(courseSlug: string) {
  if (courseSlug !== STAFF_COLLEGE_COMMAND_SLUG) {
    return null;
  }

  return {
    deliveryModel: "paced-hybrid" as const,
    liveClassCadence:
      "Live kickoff, twice-weekly instructor sessions, and optional mock-review clinics supported by self-paced lessons, drills, and DS review.",
    phases: staffCollegeCommandPhaseBlueprints,
    weeklySchedule: staffCollegeCommandWeeklySchedule
  };
}

function getCurrentPhaseNumber(totalPhases: number, completedPhaseNumbers: Set<number>) {
  for (let phaseNumber = 1; phaseNumber <= totalPhases; phaseNumber += 1) {
    if (!completedPhaseNumbers.has(phaseNumber)) {
      return phaseNumber;
    }
  }

  return totalPhases;
}

function formatCompletionLabel(passedAt?: Date | null) {
  if (!passedAt) {
    return "Passed";
  }

  return `Passed on ${passedAt.toISOString().slice(0, 10)}`;
}

async function loadPersistedPhases(
  prisma: DatabaseClient,
  courseId: string | undefined,
  fallbackPhases: CoursePhaseBlueprint[]
): Promise<CoursePhaseBlueprint[]> {
  if (!courseId) {
    return fallbackPhases;
  }

  const milestoneRecords = await prisma.phaseMilestone.findMany({
    where: { courseId },
    orderBy: { phaseNumber: "asc" },
    select: {
      id: true,
      phaseNumber: true,
      title: true,
      description: true,
      criteria: true
    }
  });

  if (milestoneRecords.length === 0) {
    return fallbackPhases;
  }

  const recordsByPhase = new Map(milestoneRecords.map((record) => [record.phaseNumber, record]));

  return fallbackPhases.map((phase) => {
    const persisted = recordsByPhase.get(phase.phaseNumber);

    if (!persisted) {
      return phase;
    }

    const criteria = parseCriteria(persisted.criteria, phase.milestone.criteria);

    return {
      ...phase,
      milestone: {
        ...phase.milestone,
        id: persisted.id,
        title: persisted.title,
        description: persisted.description,
        criteria
      }
    };
  });
}

export async function resolveCoursePhaseAccess(
  prisma: DatabaseClient,
  log: FastifyBaseLogger,
  courseSlug: string,
  userId?: string,
  userRole?: string
): Promise<CoursePhaseAccessContext | null> {
  const config = getPhasePlanConfig(courseSlug);

  if (!config) {
    return null;
  }

  const isAdminOrDs = userRole?.toLowerCase() === "admin" || userRole?.toLowerCase() === "ds";

  if (isAdminOrDs) {
    return {
      currentPhaseNumber: 1,
      isAdminOrDs: true,
      isEnrolled: true,
      completedPhaseNumbers: new Set<number>(),
      pendingPhaseNumbers: new Set<number>(),
      completionLabelsByPhase: new Map<number, string>(),
      note: "DS/Admin access bypasses learner milestone locks while still surfacing real milestone definitions."
    };
  }

  if (!userId) {
    return {
      currentPhaseNumber: 1,
      isAdminOrDs: false,
      isEnrolled: false,
      completedPhaseNumbers: new Set<number>(),
      pendingPhaseNumbers: new Set<number>(),
      completionLabelsByPhase: new Map<number, string>(),
      note: "Preview mode shows the 6-month command-track structure. Enrollment-aware milestone progress is only shown to signed-in officers."
    };
  }

  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true }
    });

    if (!course) {
      return {
        currentPhaseNumber: 1,
        isAdminOrDs: false,
        isEnrolled: false,
        completedPhaseNumbers: new Set<number>(),
        pendingPhaseNumbers: new Set<number>(),
        completionLabelsByPhase: new Map<number, string>(),
        note: "Fallback phase data is available even though the course record is not yet present in the database."
      };
    }

    const [enrollment, completionRecords] = await Promise.all([
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id
          }
        },
        select: { status: true }
      }),
      prisma.phaseMilestoneCompletion.findMany({
        where: {
          userId,
          courseId: course.id
        },
        select: {
          status: true,
          passedAt: true,
          milestone: {
            select: { phaseNumber: true }
          }
        }
      })
    ]);

    const completedPhaseNumbers = new Set<number>();
    const pendingPhaseNumbers = new Set<number>();
    const completionLabelsByPhase = new Map<number, string>();

    for (const completion of completionRecords) {
      const phaseNumber = completion.milestone.phaseNumber;

      if (completion.status === "PASSED") {
        completedPhaseNumbers.add(phaseNumber);
        completionLabelsByPhase.set(phaseNumber, formatCompletionLabel(completion.passedAt));
        continue;
      }

      pendingPhaseNumbers.add(phaseNumber);
    }

    const isEnrolled = enrollment?.status === "ACTIVE";

    return {
      courseId: course.id,
      currentPhaseNumber: isEnrolled
        ? getCurrentPhaseNumber(config.phases.length, completedPhaseNumbers)
        : 1,
      isAdminOrDs: false,
      isEnrolled,
      completedPhaseNumbers,
      pendingPhaseNumbers,
      completionLabelsByPhase,
      note: isEnrolled
        ? "Milestone status is now driven by persisted phase completions. Officers stay inside the current unlocked phase until the previous milestone is passed."
        : "This officer is not actively enrolled, so the response is limited to preview-style phase visibility."
    };
  } catch (error) {
    log.error(
      { err: error, courseSlug, userId },
      "coursePhasePlan.resolveCoursePhaseAccess: failed to inspect enrollment and milestone completion state"
    );

    return {
      currentPhaseNumber: 1,
      isAdminOrDs: false,
      isEnrolled: false,
      completedPhaseNumbers: new Set<number>(),
      pendingPhaseNumbers: new Set<number>(),
      completionLabelsByPhase: new Map<number, string>(),
      note: "Enrollment or milestone lookup failed, so the phase plan is being served in preview mode."
    };
  }
}

export function getPhaseMilestoneStatus(
  phaseNumber: number,
  access: CoursePhaseAccessContext
): PhaseMilestoneStatus {
  if (access.completedPhaseNumbers.has(phaseNumber)) {
    return "PASSED";
  }

  if (access.pendingPhaseNumbers.has(phaseNumber)) {
    return "PENDING_REVIEW";
  }

  if (
    access.isAdminOrDs ||
    phaseNumber === 1 ||
    access.completedPhaseNumbers.has(phaseNumber - 1)
  ) {
    return "AVAILABLE";
  }

  return "LOCKED";
}

export function isPhaseUnlocked(access: CoursePhaseAccessContext, phaseNumber?: number | null) {
  if (!phaseNumber) {
    return true;
  }

  return (
    access.isAdminOrDs || phaseNumber === 1 || access.completedPhaseNumbers.has(phaseNumber - 1)
  );
}

function buildMilestoneState(
  phase: CoursePhaseBlueprint,
  access: CoursePhaseAccessContext
): CoursePhaseMilestone {
  const completionLabel = access.completionLabelsByPhase.get(phase.phaseNumber);
  const status = getPhaseMilestoneStatus(phase.phaseNumber, access);

  if (completionLabel) {
    return {
      ...phase.milestone,
      status,
      completionLabel
    };
  }

  return {
    ...phase.milestone,
    status
  };
}

export async function getCoursePhasePlan(
  prisma: DatabaseClient,
  log: FastifyBaseLogger,
  courseSlug: string,
  userId?: string,
  userRole?: string
): Promise<CoursePhasesResponse | null> {
  const config = getPhasePlanConfig(courseSlug);

  if (!config) {
    return null;
  }

  const access = await resolveCoursePhaseAccess(prisma, log, courseSlug, userId, userRole);

  if (!access) {
    return null;
  }

  const persistedPhases = await loadPersistedPhases(prisma, access.courseId, config.phases);
  const phases: CoursePhaseDetail[] = persistedPhases.map((phase) => ({
    ...phase,
    isUnlocked: isPhaseUnlocked(access, phase.phaseNumber),
    milestone: buildMilestoneState(phase, access)
  }));

  return {
    courseSlug,
    deliveryModel: config.deliveryModel,
    liveClassCadence: config.liveClassCadence,
    currentPhaseNumber: access.currentPhaseNumber,
    phases,
    weeklySchedule: config.weeklySchedule,
    note: access.note
  };
}

export async function getCourseMilestones(
  prisma: DatabaseClient,
  log: FastifyBaseLogger,
  courseSlug: string,
  userId?: string,
  userRole?: string
): Promise<LearningMilestonesResponse | null> {
  const config = getPhasePlanConfig(courseSlug);

  if (!config) {
    return null;
  }

  const access = await resolveCoursePhaseAccess(prisma, log, courseSlug, userId, userRole);

  if (!access) {
    return null;
  }

  const persistedPhases = await loadPersistedPhases(prisma, access.courseId, config.phases);

  return {
    courseSlug,
    currentPhaseNumber: access.currentPhaseNumber,
    phases: persistedPhases.map((phase) => ({
      phaseNumber: phase.phaseNumber,
      phaseTitle: phase.title,
      phaseSlug: phase.slug,
      isUnlocked: isPhaseUnlocked(access, phase.phaseNumber),
      milestone: buildMilestoneState(phase, access)
    })),
    accessPolicy:
      "Officers work self-paced inside the active phase. The next phase remains locked until the previous phase milestone is passed. DS and Admin can inspect all phases and bypass learner locks.",
    note: access.note
  };
}
