export type CourseTrack = "army" | "police" | "apf" | "staff" | "mission";

export type ContentType = "VIDEO" | "PDF" | "LIVE" | "QUIZ" | "TEXT";

export type SubjectArea =
  | "TACTICS_ADMIN"
  | "CURRENT_AFFAIRS"
  | "MILITARY_HISTORY_STRATEGY"
  | "APPRECIATION_PLANS"
  | "LECTURETTE";

export type StudySessionSource = "WEB" | "MOBILE" | "MANUAL";
export type SubmissionType = "LECTURETTE" | "ESSAY" | "APPRECIATION_PLAN";
export type SubmissionStatus = "SUBMITTED" | "REVIEWED" | "REVISION_REQUESTED";
export type AnalyticsWeightingMode = "none" | "subject" | "subject-component";

export type PhaseMilestoneCriterionKind =
  | "QUIZ_SCORE"
  | "ASSESSMENT_ATTEMPT"
  | "ASSESSMENT_SCORE"
  | "SUBMISSION_REVIEW"
  | "DS_APPROVAL"
  | "COUNSELLING";

export type PhaseMilestoneStatus = "LOCKED" | "AVAILABLE" | "PASSED" | "PENDING_REVIEW";

export interface PhaseMilestoneCriterion {
  kind: PhaseMilestoneCriterionKind;
  label: string;
  threshold?: number;
  unit?: "%" | "count" | "step";
  manualReview: boolean;
  subjectArea?: SubjectArea;
}

export interface PhaseMilestoneBlueprint {
  id: string;
  title: string;
  description: string;
  criteria: PhaseMilestoneCriterion[];
}

export interface CoursePhaseBlueprint {
  phaseNumber: number;
  slug: string;
  title: string;
  monthLabel: string;
  focus: string;
  summary: string;
  subjectThemes: string[];
  liveSessionPattern: string;
  milestone: PhaseMilestoneBlueprint;
}

export interface CoursePhaseMilestone extends PhaseMilestoneBlueprint {
  status: PhaseMilestoneStatus;
  completionLabel?: string;
}

export interface CoursePhaseDetail extends Omit<CoursePhaseBlueprint, "milestone"> {
  isUnlocked: boolean;
  milestone: CoursePhaseMilestone;
}

export interface WeeklyStudyScheduleDay {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
  note?: string;
}

export interface LearningPhaseMilestoneDetail {
  phaseNumber: number;
  phaseTitle: string;
  phaseSlug: string;
  isUnlocked: boolean;
  milestone: CoursePhaseMilestone;
}

export interface StudySessionDetail {
  id: string;
  courseId: string;
  courseSlug: string;
  lessonId?: string;
  source: StudySessionSource;
  deviceSessionId?: string;
  startedAt: string;
  heartbeatAt?: string;
  endedAt?: string;
  active: boolean;
  elapsedMinutes: number;
}

export interface SubmissionRubricScore {
  criterion: string;
  score: number;
  maxScore: number;
}

export interface AssessmentComponentWeight {
  code: string;
  label: string;
  weightPercent: number;
}

export interface AssessmentSubjectWeight {
  subjectArea: SubjectArea;
  label: string;
  weightPercent: number;
  components?: AssessmentComponentWeight[];
}

export interface CourseAssessmentWeighting {
  label: string;
  subjects: AssessmentSubjectWeight[];
}

export interface WeightedComponentPerformanceDetail {
  code: string;
  label: string;
  weightPercent: number;
  latestAccuracyPercent: number;
  weightedAccuracyPercent: number;
  latestAttemptCount: number;
  weightedQuestionVolume: number;
  latestAttemptedAt?: string;
}

export interface LessonSubmissionDetail {
  id: string;
  courseId: string;
  courseSlug: string;
  title: string;
  submissionType: SubmissionType;
  status: SubmissionStatus;
  submittedAt: string;
  lessonId?: string;
  phaseNumber?: number;
  subjectArea?: SubjectArea;
  body?: string;
  assetUrl?: string;
  score?: number;
  maxScore?: number;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  rubricScores?: SubmissionRubricScore[];
}

export interface SubjectPerformanceDetail {
  subjectArea: SubjectArea;
  label: string;
  configuredWeightPercent?: number;
  latestAccuracyPercent: number;
  weightedAccuracyPercent: number;
  examWeightedReadinessPercent: number;
  latestAttemptCount: number;
  weightedQuestionVolume: number;
  latestAttemptedAt?: string;
  components?: WeightedComponentPerformanceDetail[];
}

export interface LearningAnalyticsSummary {
  totalStudyMinutes: number;
  submissionCount: number;
  pendingSubmissionReviews: number;
  weightingMode?: AnalyticsWeightingMode;
  overallWeightedReadinessPercent?: number;
  weightingLabel?: string;
}

export interface QuizOption {
  text: string;
}

export interface QuizQuestionDetail {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionIndex: number;
  explanation?: string;
  position: number;
}

export interface LessonDetail {
  id: string;
  courseId: string;
  moduleId?: string;
  phaseNumber?: number;
  subjectArea?: SubjectArea;
  componentCode?: string;
  componentLabel?: string;
  title: string;
  synopsis: string;
  position: number;
  durationMinutes?: number;
  contentType: ContentType;
  accessKind: "PREVIEW" | "STANDARD" | "LIVE_REPLAY" | "DOWNLOADABLE";
  bunnyVideoId?: string;
  meetingUrl?: string;
  pdfUrl?: string;
  quizQuestions?: QuizQuestionDetail[];
  // ─── Iron Guard gating fields ───────────────────────────────────────────────
  prerequisiteId?: string;
  isLocked: boolean;
  unlockRequirement?: string; // human-readable e.g. "Complete 'Tactical Basics' first"
  progressStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface ModuleDetail {
  id: string;
  courseId: string;
  phaseNumber?: number;
  subjectArea?: SubjectArea;
  componentCode?: string;
  componentLabel?: string;
  title: string;
  position: number;
  lessons: LessonDetail[];
}

export interface EnrollmentGuardResponse {
  enrolled: boolean;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "REFUNDED" | null;
  courseSlug: string;
  /** Only present when enrolled and lesson contentType is LIVE */
  meetingUrl?: string;
}

export interface InstructorProfile {
  slug: string;
  name: string;
  branch: string;
  experience: string;
  specialization: string;
  bio: string;
  avatarUrl?: string;
}

export interface CourseDetail {
  slug: string;
  title: string;
  track: CourseTrack;
  summary: string;
  description: string;
  level: string;
  durationLabel: string;
  lessonCount: number;
  priceNpr: number;
  originalPriceNpr?: number;
  accentColor: string;
  heroImageUrl?: string;
  featured: boolean;
  format: "cohort" | "self-paced" | "hybrid";
  liveSupport: string;
  instructorSlugs: string[];
  outcomeBullets: string[];
  syllabus: string[];
}

export interface LiveSessionPreview {
  id: string;
  courseSlug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: "zoom" | "in-app" | "hybrid";
  replayAvailable: boolean;
}

export interface DashboardSnapshot {
  progressPercent: number;
  enrolledCourses: number;
  upcomingSessionCount: number;
  pendingTasks: number;
  completionTarget: string;
}

export interface SiteMetric {
  label: string;
  value: string;
  context: string;
}

export interface ArchitectureDecision {
  layer: string;
  choice: string;
  note: string;
}
