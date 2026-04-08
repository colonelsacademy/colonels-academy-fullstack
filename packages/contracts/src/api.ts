import type {
  CourseDetail,
  CoursePhaseDetail,
  DashboardSnapshot,
  EnrollmentGuardResponse,
  InstructorProfile,
  LessonDetail,
  LearningPhaseMilestoneDetail,
  LiveSessionPreview,
  LearningAnalyticsSummary,
  LessonSubmissionDetail,
  ModuleDetail,
  SubjectPerformanceDetail,
  StudySessionDetail,
  WeeklyStudyScheduleDay
} from "./types";

export interface AuthSessionUser {
  uid: string;
  email?: string;
  displayName?: string;
  role?: string;
}

export interface AuthCsrfResponse {
  csrfToken: string;
  cookieName: string;
  headerName: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: AuthSessionUser | null;
  authMethod: "session" | "bearer" | "none";
}

export interface AuthSessionLoginRequest {
  idToken: string;
}

export interface CatalogCoursesResponse {
  items: CourseDetail[];
}

export interface CatalogInstructorsResponse {
  items: InstructorProfile[];
}

export interface CoursePhasesResponse {
  courseSlug: string;
  deliveryModel: "paced-hybrid";
  liveClassCadence: string;
  currentPhaseNumber: number;
  phases: CoursePhaseDetail[];
  weeklySchedule: WeeklyStudyScheduleDay[];
  note: string;
}

export interface DashboardOverviewResponse {
  authenticated: boolean;
  user: AuthSessionUser | null;
  overview: DashboardSnapshot;
  note: string;
}

export interface LearningMilestonesResponse {
  courseSlug: string;
  currentPhaseNumber: number;
  phases: LearningPhaseMilestoneDetail[];
  accessPolicy: string;
  note: string;
}

export interface StudySessionMutationResponse {
  ok: true;
  session: StudySessionDetail;
  note?: string;
}

export interface LearningAnalyticsResponse {
  courseSlug: string;
  summary: LearningAnalyticsSummary;
  subjects: SubjectPerformanceDetail[];
}

export interface CourseSubmissionsResponse {
  courseSlug: string;
  items: LessonSubmissionDetail[];
}

export interface SubmissionMutationResponse {
  ok: true;
  submission: LessonSubmissionDetail;
  note?: string;
}

export interface PendingSubmissionReviewsResponse {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  items: Array<{
    id: string;
    submittedAt: string;
    title: string;
    submissionType: string;
    phaseNumber?: number;
    subjectArea?: string;
    assetUrl?: string;
    officer: {
      id: string;
      displayName?: string;
      email: string;
    };
  }>;
}

export interface LiveSessionsResponse {
  items: LiveSessionPreview[];
  transport: string;
}

export interface CourseLessonsResponse {
  courseSlug: string;
  modules: ModuleDetail[];
  unorganisedLessons: LessonDetail[];
}

export type { EnrollmentGuardResponse };

export interface QueueDepthSnapshot {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
}

export interface LivenessStatusResponse {
  status: "ok";
  requestId: string;
  time: string;
}

export interface HealthStatusResponse {
  status: "ok" | "degraded";
  requestId: string;
  services: {
    database: "connected" | "unavailable";
    redis: "configured" | "disabled" | "unavailable";
    queues: Record<string, QueueDepthSnapshot> | null;
    firebaseAuth: "configured" | "pending";
    bunnyStream: "configured" | "pending";
  };
  policy: string;
}

export interface BunnyPlaybackResponse {
  bunnyVideoId: string;
  libraryId?: string;
  playbackUrl: string | null;
  embedUrl: string | null;
  queueBackedSync: boolean;
}

export interface MediaSyncResponse {
  accepted: boolean;
  deduplicated?: boolean;
  jobId?: string;
  reason?: string;
  message?: string;
}
