import type { FastifyBaseLogger } from "fastify";

import type { DatabaseClient } from "@colonels-academy/database";
import type { AuthUser } from "../../plugins/auth";

export async function syncUserWithPostgres(
  prisma: DatabaseClient,
  authUser: AuthUser,
  log: FastifyBaseLogger
) {
  const { uid, email, claims } = authUser;

  try {
    const displayName = (claims.name as string) || undefined;
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        ...(email ? { email } : {}),
        ...(displayName ? { displayName } : {})
      },
      create: {
        firebaseUid: uid,
        ...(email ? { email } : {}),
        ...(displayName ? { displayName } : {}),
        role: "STUDENT"
      }
    });

    // Sync Postgres role back onto the authUser so the session response includes it
    if (user.role) {
      authUser.role = user.role.toLowerCase();
    }

    return user;
  } catch (error) {
    log.warn({ err: error, uid }, "user-sync: failed to sync user with Postgres");
    return null;
  }
}
