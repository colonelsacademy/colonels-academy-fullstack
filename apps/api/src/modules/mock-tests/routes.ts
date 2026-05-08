import type { FastifyPluginAsync } from "fastify";
import adminMockTestRoutes from "./admin-routes";
import userMockTestRoutes from "./user-routes";

const mockTestRoutes: FastifyPluginAsync = async (fastify) => {
  // Admin routes
  void fastify.register(adminMockTestRoutes, { prefix: "/admin" });

  // User routes
  void fastify.register(userMockTestRoutes);
};

export default mockTestRoutes;
