import type { Job } from "bullmq";

import type { StudySessionReconcileJob } from "@colonels-academy/contracts";
import { db } from "@colonels-academy/database";

const DEFAULT_BATCH_SIZE = 200;
const DEFAULT_STALE_AFTER_MS = 5 * 60_000;
const MAX_BATCH_SIZE = 500;

function resolveEndedAt(session: { startedAt: Date; heartbeatAt: Date | null }) {
  return session.heartbeatAt ?? session.startedAt;
}

export async function handleStudySessionReconcile(
  job: Job<StudySessionReconcileJob>
): Promise<void> {
  const batchSize = Math.min(Math.max(1, job.data.batchSize ?? DEFAULT_BATCH_SIZE), MAX_BATCH_SIZE);
  const staleAfterMs = Math.max(60_000, job.data.staleAfterMs ?? DEFAULT_STALE_AFTER_MS);
  const cutoff = new Date(Date.now() - staleAfterMs);

  const staleSessions = await db.studySession.findMany({
    where: {
      endedAt: null,
      OR: [
        { heartbeatAt: { lt: cutoff } },
        {
          heartbeatAt: null,
          startedAt: { lt: cutoff }
        }
      ]
    },
    orderBy: [{ heartbeatAt: "asc" }, { startedAt: "asc" }],
    take: batchSize,
    select: {
      id: true,
      startedAt: true,
      heartbeatAt: true,
      userId: true,
      courseId: true
    }
  });

  if (staleSessions.length === 0) {
    console.info(
      JSON.stringify({
        level: "info",
        event: "study-session-reconcile.completed",
        service: "worker",
        time: new Date().toISOString(),
        reconciledCount: 0,
        staleAfterMs,
        batchSize
      })
    );
    return;
  }

  await db.$transaction(
    staleSessions.map((session) =>
      db.studySession.update({
        where: { id: session.id },
        data: {
          endedAt: resolveEndedAt(session),
          heartbeatAt: session.heartbeatAt ?? resolveEndedAt(session)
        }
      })
    )
  );

  console.info(
    JSON.stringify({
      level: "info",
      event: "study-session-reconcile.completed",
      service: "worker",
      time: new Date().toISOString(),
      reconciledCount: staleSessions.length,
      staleAfterMs,
      batchSize,
      sampleSessionIds: staleSessions.slice(0, 5).map((session) => session.id)
    })
  );
}
