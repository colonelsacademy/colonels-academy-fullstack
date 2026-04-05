import { Worker } from "bullmq";
import Redis from "ioredis";

import { defaultJobOptions, loadWorkerEnv, queueNames } from "@colonels-academy/config";
import type {
  NotificationJob,
  ProgressRecalcJob,
  QuizAttemptJob,
  VideoSyncJob
} from "@colonels-academy/contracts";
import { db } from "@colonels-academy/database";

import { handleNotification } from "./jobs/notifications";
import { handleProgressRecalc } from "./jobs/progress-recalc";
import { handleQuizMastery } from "./jobs/quiz-mastery";
import { handleVideoSync } from "./jobs/video-sync";

function logWorker(level: "info" | "error", event: string, metadata: Record<string, unknown> = {}) {
  const payload = {
    level,
    event,
    service: "worker",
    time: new Date().toISOString(),
    ...metadata
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.info(line);
}

async function start() {
  const env = loadWorkerEnv();
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

  const videoSyncWorker = new Worker<VideoSyncJob>(
    queueNames.videoSync,
    async (job) => {
      logWorker("info", "video-sync.started", {
        bunnyVideoId: job.data.bunnyVideoId,
        jobId: job.id
      });
      return handleVideoSync(job, env.BUNNY_STREAM_LIBRARY_ID);
    },
    {
      connection,
      concurrency: env.WORKER_CONCURRENCY
    }
  );

  const notificationWorker = new Worker<NotificationJob>(
    queueNames.notifications,
    async (job) => {
      logWorker("info", "notifications.started", {
        audience: job.data.audience,
        jobId: job.id,
        kind: job.data.kind
      });
      return handleNotification(job);
    },
    {
      connection,
      concurrency: env.WORKER_CONCURRENCY
    }
  );

  const progressRecalcWorker = new Worker<ProgressRecalcJob>(
    queueNames.progressRecalc,
    async (job) => {
      logWorker("info", "progress-recalc.started", {
        userId: job.data.userId,
        courseId: job.data.courseId,
        jobId: job.id
      });
      return handleProgressRecalc(job);
    },
    {
      connection,
      concurrency: env.WORKER_CONCURRENCY
    }
  );

  const quizMasteryWorker = new Worker<QuizAttemptJob>(
    queueNames.quizMastery,
    async (job) => {
      logWorker("info", "quiz-mastery.started", {
        userId: job.data.userId,
        courseId: job.data.courseId,
        questionId: job.data.questionId,
        jobId: job.id
      });
      return handleQuizMastery(job);
    },
    {
      connection,
      concurrency: env.WORKER_CONCURRENCY
    }
  );

  async function close(signal: string) {
    logWorker("info", "worker.shutdown", {
      signal
    });
    await Promise.all([
      videoSyncWorker.close(),
      notificationWorker.close(),
      progressRecalcWorker.close(),
      quizMasteryWorker.close()
    ]);
    await connection.quit().catch(() => {
      connection.disconnect();
    });
    await db.$disconnect();
    process.exit(0);
  }

  process.on("SIGINT", () => {
    void close("SIGINT");
  });

  process.on("SIGTERM", () => {
    void close("SIGTERM");
  });

  await Promise.all([
    videoSyncWorker.waitUntilReady(),
    notificationWorker.waitUntilReady(),
    progressRecalcWorker.waitUntilReady(),
    quizMasteryWorker.waitUntilReady()
  ]);

  videoSyncWorker.on("completed", (job) => {
    logWorker("info", "video-sync.completed", {
      bunnyVideoId: job.data.bunnyVideoId,
      jobId: job.id
    });
  });

  notificationWorker.on("completed", (job) => {
    logWorker("info", "notifications.completed", {
      audience: job.data.audience,
      jobId: job.id,
      kind: job.data.kind
    });
  });

  progressRecalcWorker.on("completed", (job) => {
    logWorker("info", "progress-recalc.completed", {
      userId: job.data.userId,
      courseId: job.data.courseId,
      jobId: job.id
    });
  });

  quizMasteryWorker.on("completed", (job) => {
    logWorker("info", "quiz-mastery.completed", {
      userId: job.data.userId,
      courseId: job.data.courseId,
      questionId: job.data.questionId,
      jobId: job.id
    });
  });

  videoSyncWorker.on("failed", (job, error) => {
    logWorker("error", "video-sync.failed", {
      bunnyVideoId: job?.data.bunnyVideoId,
      error: error.message,
      jobId: job?.id
    });
  });

  notificationWorker.on("failed", (job, error) => {
    logWorker("error", "notifications.failed", {
      audience: job?.data.audience,
      error: error.message,
      jobId: job?.id,
      kind: job?.data.kind
    });
  });

  progressRecalcWorker.on("failed", (job, error) => {
    logWorker("error", "progress-recalc.failed", {
      userId: job?.data.userId,
      courseId: job?.data.courseId,
      error: error.message,
      jobId: job?.id
    });
  });

  quizMasteryWorker.on("failed", (job, error) => {
    logWorker("error", "quiz-mastery.failed", {
      userId: job?.data.userId,
      courseId: job?.data.courseId,
      questionId: job?.data.questionId,
      error: error.message,
      jobId: job?.id
    });
  });

  logWorker("info", "worker.ready", {
    concurrency: env.WORKER_CONCURRENCY,
    queues: [
      queueNames.videoSync,
      queueNames.notifications,
      queueNames.progressRecalc,
      queueNames.quizMastery
    ],
    retryAttempts: defaultJobOptions.attempts
  });
}

void start().catch(async (error) => {
  logWorker("error", "worker.start_failed", {
    error: error instanceof Error ? error.message : String(error)
  });
  await db.$disconnect();
  process.exit(1);
});
