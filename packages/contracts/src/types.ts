export type CourseTrack = "army" | "police" | "apf" | "staff" | "mission";

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
