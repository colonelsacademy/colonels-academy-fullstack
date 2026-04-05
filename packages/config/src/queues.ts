export const queueNames = {
  videoSync: "video-sync",
  notifications: "notifications",
  progressRecalc: "progress-recalc",
  quizMastery: "quiz-mastery"
} as const;

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 2_000
  },
  removeOnComplete: 50,
  removeOnFail: 100
};
