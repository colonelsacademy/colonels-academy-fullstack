import { type DatabaseClient } from "@colonels-academy/database";
import { type AuthUser } from "../../plugins/auth";

export async function syncUserWithPostgres(prisma: DatabaseClient, authUser: AuthUser) {
  const { uid, email, claims } = authUser;

  // UPSERT: Create user if not exists, otherwise update
  // We use firebaseUid as the unique identifier.
  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        // email || undefined: If email is missing in the token, Prisma will ignore this field
        // in the update, preserving any existing email in the database.
        email: email || undefined,
        displayName: (claims.name as string) || undefined,
      },
      create: {
        firebaseUid: uid,
        email: email || undefined,
        displayName: (claims.name as string) || undefined,
        role: "STUDENT", // Default role
      },
    });
    return user;
  } catch (error) {
    // Non-fatal error: Postgres sync failure shouldn't block Firebase login.
    console.warn(`[UserSync] Failed to sync user ${uid} with Postgres:`, error);
    return null;
  }
}
