import { Queue } from "bullmq";
import fp from "fastify-plugin";
import Redis from "ioredis";

import { defaultJobOptions, loadApiEnv, queueNames } from "@colonels-academy/config";
import type {
  NotificationJob,
  StudySessionReconcileJob,
  VideoSyncJob
} from "@colonels-academy/contracts";

export interface QueueRegistry {
  videoSync: Queue<VideoSyncJob>;
  notifications: Queue<NotificationJob>;
  studySessionReconcile: Queue<StudySessionReconcileJob>;
}

export interface BunnyConfig {
  libraryId?: string;
  pullZone?: string;
  cdnHostname?: string;
  hasApiKey: boolean;
}

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis | null;
    queues: QueueRegistry | null;
    bunny: BunnyConfig;
  }
}

export default fp(async (fastify) => {
  const env = loadApiEnv();
  const redis = env.REDIS_URL
    ? new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null
      })
    : null;

  const queues = redis
    ? {
        videoSync: new Queue<VideoSyncJob>(queueNames.videoSync, {
          connection: redis,
          defaultJobOptions
        }),
        notifications: new Queue<NotificationJob>(queueNames.notifications, {
          connection: redis,
          defaultJobOptions
        }),
        studySessionReconcile: new Queue<StudySessionReconcileJob>(
          queueNames.studySessionReconcile,
          {
            connection: redis,
            defaultJobOptions
          }
        )
      }
    : null;

  const bunny: BunnyConfig = {
    hasApiKey: Boolean(env.BUNNY_STREAM_API_KEY)
  };

  if (env.BUNNY_STREAM_LIBRARY_ID) {
    bunny.libraryId = env.BUNNY_STREAM_LIBRARY_ID;
  }

  if (env.BUNNY_STREAM_PULL_ZONE) {
    bunny.pullZone = env.BUNNY_STREAM_PULL_ZONE;
  }

  if (env.BUNNY_STREAM_CDN_HOSTNAME) {
    bunny.cdnHostname = env.BUNNY_STREAM_CDN_HOSTNAME;
  }

  fastify.decorate("redis", redis);
  fastify.decorate("queues", queues);
  fastify.decorate("bunny", bunny);

  fastify.addHook("onClose", async () => {
    if (queues) {
      await Promise.all([
        queues.videoSync.close(),
        queues.notifications.close(),
        queues.studySessionReconcile.close()
      ]);
    }

    if (redis) {
      await redis.quit().catch(() => {
        redis.disconnect();
      });
    }
  });
});
