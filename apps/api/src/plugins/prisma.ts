import fp from "fastify-plugin";

import { type DatabaseClient, createDatabaseClient } from "@colonels-academy/database";

declare module "fastify" {
  interface FastifyInstance {
    prisma: DatabaseClient;
  }
}

export default fp(async (fastify) => {
  const prisma = createDatabaseClient();

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
