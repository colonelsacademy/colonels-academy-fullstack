import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const courseTrackSchema = z.enum(["army", "police", "apf", "staff", "mission"]);

export const contentTypeSchema = z.enum(["VIDEO", "PDF", "LIVE", "QUIZ", "TEXT"]);

export const subjectAreaSchema = z.enum([
  "TACTICS_ADMIN",
  "CURRENT_AFFAIRS",
  "MILITARY_HISTORY_STRATEGY",
  "APPRECIATION_PLANS",
  "LECTURETTE"
]);

export const studySessionSourceSchema = z.enum(["WEB", "MOBILE", "MANUAL"]);
export const submissionTypeSchema = z.enum(["LECTURETTE", "ESSAY", "APPRECIATION_PLAN"]);
export const submissionStatusSchema = z.enum(["SUBMITTED", "REVIEWED", "REVISION_REQUESTED"]);
export const analyticsWeightingModeSchema = z.enum(["none", "subject", "subject-component"]);

export const lessonAccessKindSchema = z.enum([
  "PREVIEW",
  "STANDARD",
  "LIVE_REPLAY",
  "DOWNLOADABLE"
]);

export const enrollmentStatusSchema = z.enum(["ACTIVE", "PENDING", "EXPIRED", "REFUNDED"]);

export const phaseMilestoneCriterionKindSchema = z.enum([
  "QUIZ_SCORE",
  "ASSESSMENT_ATTEMPT",
  "ASSESSMENT_SCORE",
  "SUBMISSION_REVIEW",
  "DS_APPROVAL",
  "COUNSELLING"
]);

export const phaseMilestoneStatusSchema = z.enum([
  "LOCKED",
  "AVAILABLE",
  "PASSED",
  "PENDING_REVIEW"
]);

// ─── Instructor ───────────────────────────────────────────────────────────────

export const instructorProfileSchema = z.object({
  slug: z.string(),
  name: z.string(),
  branch: z.string(),
  experience: z.string(),
  specialization: z.string(),
  bio: z.string(),
  avatarUrl: z.string().url().optional()
});

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const quizOptionSchema = z.object({
  text: z.string().min(1)
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(quizOptionSchema).min(2).max(6),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().optional(),
  position: z.number().int().min(0)
});

// ─── Lesson ───────────────────────────────────────────────────────────────────

export const progressStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);

export const lessonDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  moduleId: z.string().optional(),
  phaseNumber: z.number().int().min(1).max(6).optional(),
  subjectArea: subjectAreaSchema.optional(),
  componentCode: z.string().min(1).optional(),
  componentLabel: z.string().min(1).optional(),
  title: z.string().min(1),
  synopsis: z.string(),
  position: z.number().int().min(0),
  durationMinutes: z.number().int().positive().optional(),
  contentType: contentTypeSchema,
  accessKind: lessonAccessKindSchema,
  bunnyVideoId: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  quizQuestions: z.array(quizQuestionSchema).optional(),
  // ─── Iron Guard gating fields ───────────────────────────────────────────────
  prerequisiteId: z.string().optional(),
  isLocked: z.boolean(),
  unlockRequirement: z.string().optional(),
  progressStatus: progressStatusSchema
});

export const lessonAccessDeniedSchema = z.object({
  statusCode: z.literal(403),
  message: z.string(),
  unlockRequirement: z.string(),
  prerequisiteLessonId: z.string()
});

// ─── Module ───────────────────────────────────────────────────────────────────

export const moduleDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  phaseNumber: z.number().int().min(1).max(6).optional(),
  subjectArea: subjectAreaSchema.optional(),
  componentCode: z.string().min(1).optional(),
  componentLabel: z.string().min(1).optional(),
  title: z.string().min(1),
  position: z.number().int().min(0),
  lessons: z.array(lessonDetailSchema)
});

export const phaseMilestoneCriterionSchema = z.object({
  kind: phaseMilestoneCriterionKindSchema,
  label: z.string().min(1),
  threshold: z.number().int().positive().optional(),
  unit: z.enum(["%", "count", "step"]).optional(),
  manualReview: z.boolean(),
  subjectArea: subjectAreaSchema.optional()
});

export const phaseMilestoneBlueprintSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  criteria: z.array(phaseMilestoneCriterionSchema).min(1)
});

export const coursePhaseBlueprintSchema = z.object({
  phaseNumber: z.number().int().min(1),
  slug: z.string(),
  title: z.string().min(1),
  monthLabel: z.string().min(1),
  focus: z.string().min(1),
  summary: z.string().min(1),
  subjectThemes: z.array(z.string().min(1)).min(1),
  liveSessionPattern: z.string().min(1),
  milestone: phaseMilestoneBlueprintSchema
});

export const coursePhaseMilestoneSchema = phaseMilestoneBlueprintSchema.extend({
  status: phaseMilestoneStatusSchema,
  completionLabel: z.string().optional()
});

export const coursePhaseDetailSchema = coursePhaseBlueprintSchema.omit({ milestone: true }).extend({
  isUnlocked: z.boolean(),
  milestone: coursePhaseMilestoneSchema
});

export const weeklyStudyScheduleDaySchema = z.object({
  day: z.string().min(1),
  morning: z.string().min(1),
  afternoon: z.string().min(1),
  evening: z.string().min(1),
  note: z.string().optional()
});

export const learningPhaseMilestoneDetailSchema = z.object({
  phaseNumber: z.number().int().min(1),
  phaseTitle: z.string().min(1),
  phaseSlug: z.string(),
  isUnlocked: z.boolean(),
  milestone: coursePhaseMilestoneSchema
});

export const studySessionDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseSlug: z.string(),
  lessonId: z.string().optional(),
  source: studySessionSourceSchema,
  deviceSessionId: z.string().optional(),
  startedAt: z.string(),
  heartbeatAt: z.string().optional(),
  endedAt: z.string().optional(),
  active: z.boolean(),
  elapsedMinutes: z.number().int().min(0)
});

export const submissionRubricScoreSchema = z.object({
  criterion: z.string().min(1),
  score: z.number().int().min(0),
  maxScore: z.number().int().positive()
});

export const lessonSubmissionDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseSlug: z.string(),
  title: z.string().min(1),
  submissionType: submissionTypeSchema,
  status: submissionStatusSchema,
  submittedAt: z.string(),
  lessonId: z.string().optional(),
  phaseNumber: z.number().int().min(1).max(6).optional(),
  subjectArea: subjectAreaSchema.optional(),
  body: z.string().optional(),
  assetUrl: z.string().url().optional(),
  score: z.number().int().min(0).optional(),
  maxScore: z.number().int().positive().optional(),
  reviewNotes: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewedByUserId: z.string().optional(),
  rubricScores: z.array(submissionRubricScoreSchema).optional()
});

export const assessmentComponentWeightSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  weightPercent: z.number().int().positive().max(100)
});

export const assessmentSubjectWeightSchema = z.object({
  subjectArea: subjectAreaSchema,
  label: z.string().min(1),
  weightPercent: z.number().int().positive().max(100),
  components: z.array(assessmentComponentWeightSchema).min(1).optional()
});

export const courseAssessmentWeightingSchema = z.object({
  label: z.string().min(1),
  subjects: z.array(assessmentSubjectWeightSchema).min(1)
});

export const weightedComponentPerformanceDetailSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  weightPercent: z.number().int().positive().max(100),
  latestAccuracyPercent: z.number().int().min(0).max(100),
  weightedAccuracyPercent: z.number().int().min(0).max(100),
  latestAttemptCount: z.number().int().min(0),
  weightedQuestionVolume: z.number().int().min(0),
  latestAttemptedAt: z.string().optional()
});

export const subjectPerformanceDetailSchema = z.object({
  subjectArea: subjectAreaSchema,
  label: z.string().min(1),
  configuredWeightPercent: z.number().int().positive().max(100).optional(),
  latestAccuracyPercent: z.number().int().min(0).max(100),
  weightedAccuracyPercent: z.number().int().min(0).max(100),
  examWeightedReadinessPercent: z.number().int().min(0).max(100),
  latestAttemptCount: z.number().int().min(0),
  weightedQuestionVolume: z.number().int().min(0),
  latestAttemptedAt: z.string().optional(),
  components: z.array(weightedComponentPerformanceDetailSchema).optional()
});

export const learningAnalyticsSummarySchema = z.object({
  totalStudyMinutes: z.number().int().min(0),
  submissionCount: z.number().int().min(0),
  pendingSubmissionReviews: z.number().int().min(0),
  weightingMode: analyticsWeightingModeSchema.optional(),
  overallWeightedReadinessPercent: z.number().int().min(0).max(100).optional(),
  weightingLabel: z.string().min(1).optional()
});

// ─── Course ───────────────────────────────────────────────────────────────────

export const courseDetailSchema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  track: courseTrackSchema,
  summary: z.string(),
  description: z.string(),
  level: z.string(),
  durationLabel: z.string(),
  lessonCount: z.number().int().min(0),
  priceNpr: z.number().int().positive(),
  originalPriceNpr: z.number().int().positive().optional(),
  accentColor: z.string(),
  heroImageUrl: z.string().optional(),
  featured: z.boolean(),
  format: z.enum(["cohort", "self-paced", "hybrid"]),
  liveSupport: z.string(),
  instructorSlugs: z.array(z.string()),
  outcomeBullets: z.array(z.string()),
  syllabus: z.array(z.string())
});

// ─── API Responses ────────────────────────────────────────────────────────────

export const catalogCoursesResponseSchema = z.object({
  items: z.array(courseDetailSchema)
});

export const catalogInstructorsResponseSchema = z.object({
  items: z.array(instructorProfileSchema)
});

export const coursePhasesResponseSchema = z.object({
  courseSlug: z.string(),
  deliveryModel: z.literal("paced-hybrid"),
  liveClassCadence: z.string().min(1),
  currentPhaseNumber: z.number().int().min(1),
  phases: z.array(coursePhaseDetailSchema),
  weeklySchedule: z.array(weeklyStudyScheduleDaySchema),
  note: z.string()
});

export const courseLessonsResponseSchema = z.object({
  courseSlug: z.string(),
  modules: z.array(moduleDetailSchema),
  /** Flat list for courses that have not been organised into modules yet */
  unorganisedLessons: z.array(lessonDetailSchema)
});

export const enrollmentGuardResponseSchema = z.object({
  enrolled: z.boolean(),
  status: enrollmentStatusSchema.nullable(),
  courseSlug: z.string(),
  meetingUrl: z.string().url().optional()
});

export const authSessionUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  role: z.string().optional()
});

export const authSessionResponseSchema = z.object({
  authenticated: z.boolean(),
  user: authSessionUserSchema.nullable(),
  authMethod: z.enum(["session", "bearer", "none"])
});

export const learningMilestonesResponseSchema = z.object({
  courseSlug: z.string(),
  currentPhaseNumber: z.number().int().min(1),
  phases: z.array(learningPhaseMilestoneDetailSchema),
  accessPolicy: z.string().min(1),
  note: z.string()
});

export const studySessionMutationResponseSchema = z.object({
  ok: z.literal(true),
  session: studySessionDetailSchema,
  note: z.string().optional()
});

export const learningAnalyticsResponseSchema = z.object({
  courseSlug: z.string(),
  summary: learningAnalyticsSummarySchema,
  subjects: z.array(subjectPerformanceDetailSchema)
});

export const courseSubmissionsResponseSchema = z.object({
  courseSlug: z.string(),
  items: z.array(lessonSubmissionDetailSchema)
});

export const submissionMutationResponseSchema = z.object({
  ok: z.literal(true),
  submission: lessonSubmissionDetailSchema,
  note: z.string().optional()
});

export const pendingSubmissionReviewsResponseSchema = z.object({
  course: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string().min(1)
  }),
  items: z.array(
    z.object({
      id: z.string(),
      submittedAt: z.string(),
      title: z.string().min(1),
      submissionType: submissionTypeSchema,
      phaseNumber: z.number().int().min(1).max(6).optional(),
      subjectArea: subjectAreaSchema.optional(),
      assetUrl: z.string().url().optional(),
      officer: z.object({
        id: z.string(),
        displayName: z.string().optional(),
        email: z.string().email()
      })
    })
  )
});

// ─── Inferred Types (use these instead of hand-written interfaces) ────────────

export type CourseTrackSchema = z.infer<typeof courseTrackSchema>;
export type ContentTypeSchema = z.infer<typeof contentTypeSchema>;
export type ProgressStatusSchema = z.infer<typeof progressStatusSchema>;
export type LessonDetailSchema = z.infer<typeof lessonDetailSchema>;
export type LessonAccessDeniedSchema = z.infer<typeof lessonAccessDeniedSchema>;
export type ModuleDetailSchema = z.infer<typeof moduleDetailSchema>;
export type CoursePhaseDetailSchema = z.infer<typeof coursePhaseDetailSchema>;
export type CourseDetailSchema = z.infer<typeof courseDetailSchema>;
export type InstructorProfileSchema = z.infer<typeof instructorProfileSchema>;
export type EnrollmentGuardResponseSchema = z.infer<typeof enrollmentGuardResponseSchema>;
export type CourseLessonsResponseSchema = z.infer<typeof courseLessonsResponseSchema>;
export type CoursePhasesResponseSchema = z.infer<typeof coursePhasesResponseSchema>;
export type LearningMilestonesResponseSchema = z.infer<typeof learningMilestonesResponseSchema>;
export type StudySessionMutationResponseSchema = z.infer<typeof studySessionMutationResponseSchema>;
export type LearningAnalyticsResponseSchema = z.infer<typeof learningAnalyticsResponseSchema>;
export type CourseSubmissionsResponseSchema = z.infer<typeof courseSubmissionsResponseSchema>;
export type SubmissionMutationResponseSchema = z.infer<typeof submissionMutationResponseSchema>;
export type PendingSubmissionReviewsResponseSchema = z.infer<
  typeof pendingSubmissionReviewsResponseSchema
>;
