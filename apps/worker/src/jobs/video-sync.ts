import type { Job } from "bullmq";

import type { VideoSyncJob } from "@colonels-academy/contracts";
import { db } from "@colonels-academy/database";

export async function handleVideoSync(job: Job<VideoSyncJob>, libraryId?: string) {
  const title = `Bunny asset ${job.data.bunnyVideoId}`;
  const status = libraryId ? "PROCESSING" : "DRAFT";

  await db.videoAsset.upsert({
    where: {
      bunnyVideoId: job.data.bunnyVideoId
    },
    update: {
      title,
      libraryId: libraryId ?? "unconfigured",
      status
    },
    create: {
      bunnyVideoId: job.data.bunnyVideoId,
      title,
      libraryId: libraryId ?? "unconfigured",
      status
    }
  });

  return {
    bunnyVideoId: job.data.bunnyVideoId,
    status,
    requestedBy: job.data.requestedBy
  };
}
