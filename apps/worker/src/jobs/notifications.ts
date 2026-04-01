import type { Job } from "bullmq";

import type { NotificationJob } from "@colonels-academy/contracts";

export async function handleNotification(job: Job<NotificationJob>) {
  return {
    delivered: true,
    kind: job.data.kind,
    audience: job.data.audience
  };
}
