export interface VideoSyncJob {
  bunnyVideoId: string;
  requestedBy: string;
}

export interface NotificationJob {
  kind: "live-session-reminder" | "admin-alert";
  audience: string;
}

export interface ProgressRecalcJob {
  userId: string;
  courseId: string;
  triggeredBy: "lesson-completion" | "enrollment-change";
}

export interface QuizAttemptJob {
  userId: string;
  courseId: string;
  questionId: string;
  lessonId: string;
}

export interface StudySessionReconcileJob {
  batchSize?: number;
  staleAfterMs?: number;
}
