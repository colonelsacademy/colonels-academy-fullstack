import type { FastifyPluginAsync } from "fastify";
import type { BunnyPlaybackResponse, MediaSyncResponse } from "@colonels-academy/contracts";

const mediaRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { bunnyVideoId: string } }>("/video-assets/:bunnyVideoId/playback", async (request) => {
    const libraryId = fastify.bunny.libraryId;
    const bunnyVideoId = request.params.bunnyVideoId;
    const cdnHostname =
      fastify.bunny.cdnHostname ??
      (fastify.bunny.pullZone ? `${fastify.bunny.pullZone}.b-cdn.net` : undefined);

    const response: BunnyPlaybackResponse = {
      bunnyVideoId,
      ...(libraryId ? { libraryId } : {}),
      playbackUrl: cdnHostname ? `https://${cdnHostname}/${bunnyVideoId}/playlist.m3u8` : null,
      embedUrl: libraryId ? `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}` : null,
      queueBackedSync: Boolean(fastify.queues?.videoSync)
    };

    return response;
  });

  fastify.post<{ Params: { bunnyVideoId: string } }>("/video-assets/:bunnyVideoId/sync", async (request) => {
    const authUser = await fastify.requireRole(request, ["admin", "instructor"]);

    if (!fastify.queues?.videoSync) {
      const response: MediaSyncResponse = {
        accepted: false,
        reason: "Redis or BullMQ is not configured."
      };

      return response;
    }

    const bunnyVideoId = request.params.bunnyVideoId;
    const jobId = `video-sync:${bunnyVideoId}`;
    const existingJob = await fastify.queues.videoSync.getJob(jobId);

    if (existingJob) {
      const response: MediaSyncResponse = {
        accepted: true,
        deduplicated: true,
        jobId,
        message: "Video sync job already queued."
      };

      return response;
    }

    await fastify.queues.videoSync.add(
      "sync-bunny-asset",
      {
        bunnyVideoId,
        requestedBy: authUser.uid
      },
      {
        jobId
      }
    );

    const response: MediaSyncResponse = {
      accepted: true,
      deduplicated: false,
      jobId,
      message: "Video sync job enqueued."
    };

    return response;
  });
};

export default mediaRoutes;
