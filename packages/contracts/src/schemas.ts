import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const courseTrackSchema = z.enum(["army", "police", "apf", "staff", "mission"]);

export const contentTypeSchema = z.enum(["VIDEO", "PDF", "LIVE", "QUIZ", "TEXT"]);

export const lessonAccessKindSchema = z.enum([
  "PREVIEW",
  "STANDARD",
  "LIVE_REPLAY",
  "DOWNLOADABLE",
]);

export const enrollmentStatusSchema = z.enum([
  "ACTIVE",
  "PENDING",
  "EXPIRED",
  "REFUNDED",
]);

// ─── Instructor ───────────────────────────────────────────────────────────────

export const instructorProfileSchema = z.object({
  slug: z.string(),
  name: z.string(),
  branch: z.string(),
  experience: z.string(),
  specialization: z.string(),
  bio: z.string(),
  avatarUrl: z.string().url().optional(),
});

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const quizOptionSchema = z.object({
  text: z.string().min(1),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(quizOptionSchema).min(2).max(6),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().optional(),
  position: z.number().int().min(0),
});

// ─── Lesson ───────────────────────────────────────────────────────────────────

export const lessonDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  moduleId: z.string().optional(),
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
});

// ─── Module ───────────────────────────────────────────────────────────────────

export const moduleDetailSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string().min(1),
  position: z.number().int().min(0),
  lessons: z.array(lessonDetailSchema),
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
  syllabus: z.array(z.string()),
});

// ─── API Responses ────────────────────────────────────────────────────────────

export const catalogCoursesResponseSchema = z.object({
  items: z.array(courseDetailSchema),
});

export const catalogInstructorsResponseSchema = z.object({
  items: z.array(instructorProfileSchema),
});

export const courseLessonsResponseSchema = z.object({
  courseSlug: z.string(),
  modules: z.array(moduleDetailSchema),
  /** Flat list for courses that have not been organised into modules yet */
  unorganisedLessons: z.array(lessonDetailSchema),
});

export const enrollmentGuardResponseSchema = z.object({
  enrolled: z.boolean(),
  status: enrollmentStatusSchema.nullable(),
  courseSlug: z.string(),
  meetingUrl: z.string().url().optional(),
});

export const authSessionUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  role: z.string().optional(),
});

export const authSessionResponseSchema = z.object({
  authenticated: z.boolean(),
  user: authSessionUserSchema.nullable(),
  authMethod: z.enum(["session", "bearer", "none"]),
});

// ─── Inferred Types (use these instead of hand-written interfaces) ────────────

export type CourseTrackSchema = z.infer<typeof courseTrackSchema>;
export type ContentTypeSchema = z.infer<typeof contentTypeSchema>;
export type LessonDetailSchema = z.infer<typeof lessonDetailSchema>;
export type ModuleDetailSchema = z.infer<typeof moduleDetailSchema>;
export type CourseDetailSchema = z.infer<typeof courseDetailSchema>;
export type InstructorProfileSchema = z.infer<typeof instructorProfileSchema>;
export type EnrollmentGuardResponseSchema = z.infer<typeof enrollmentGuardResponseSchema>;
export type CourseLessonsResponseSchema = z.infer<typeof courseLessonsResponseSchema>;
