import {
  type DashboardOverviewResponse,
  type LiveSessionsResponse,
  dashboardSnapshot,
  upcomingSessions
} from "@colonels-academy/contracts";
import type { FastifyPluginAsync } from "fastify";

const learningRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/dashboard/overview", async (request) => {
    const { user: authUser } = await fastify.authenticateRequest(request);
    const user = authUser
      ? {
          uid: authUser.uid,
          role: authUser.role ?? "student",
          ...(authUser.email ? { email: authUser.email } : {})
        }
      : null;

    const response: DashboardOverviewResponse = {
      authenticated: Boolean(authUser),
      user,
      overview: dashboardSnapshot,
      note: authUser
        ? "Replace the starter snapshot with course progress queries once enrollment writes are live."
        : "Public placeholder snapshot. Switch to protected access after login flows are in place."
    };

    return response;
  });

  fastify.get("/live-sessions", async () => {
    const response: LiveSessionsResponse = {
      items: upcomingSessions,
      transport:
        "Use HTTP plus scheduled revalidation first. Add WebSockets only if class presence or chat demands it."
    };

    return response;
  });
};

export default learningRoutes;
