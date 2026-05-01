import fp from "fastify-plugin";

import { type DatabaseClient, createDatabaseClient } from "@colonels-academy/database";

declare module "fastify" {
  interface FastifyInstance {
    prisma: DatabaseClient;
  }
}

export default fp(async (fastify) => {
  const prisma = createDatabaseClient();

  // ✅ OPTIMIZED: Connect to database immediately (eager connection)
  await prisma.$connect();
  fastify.log.info("Database connected");

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
