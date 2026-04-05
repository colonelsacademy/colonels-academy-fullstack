import type {
  CourseDetail,
  DashboardSnapshot,
  EnrollmentGuardResponse,
  EnrollmentsResponse,
  InstructorProfile,
  LessonDetail,
  LiveSessionPreview,
  ModuleDetail
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

export interface DashboardOverviewResponse {
  authenticated: boolean;
  user: AuthSessionUser | null;
  overview: DashboardSnapshot;
  note: string;
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

export interface EnrollmentsApiResponse extends EnrollmentsResponse {}


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
