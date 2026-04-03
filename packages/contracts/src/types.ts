export type CourseTrack = "army" | "police" | "apf" | "staff" | "mission";

export type ContentType = "VIDEO" | "PDF" | "LIVE" | "QUIZ" | "TEXT";

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
