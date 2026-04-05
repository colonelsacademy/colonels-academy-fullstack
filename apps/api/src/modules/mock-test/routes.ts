import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import type { AuthUser } from "../../plugins/auth";
import { syncUserWithPostgres } from "../auth/user-sync";

/** Matches apps/web/src/data/mockQuestions.ts PASS_MARK_SCORE */
const PASS_MARK_SCORE = 24;

const CADET_IQ_TABLE_HINT =
  "Cadet IQ table is missing. From the repo root run: pnpm db:push (local dev) or apply migrations (pnpm db:deploy), then restart the API.";

function isCadetIqTableMissing(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

async function resolveDbUserId(fastify: FastifyInstance, authUser: AuthUser): Promise<string | null> {
  let dbUser = await fastify.prisma.user.findUnique({
    where: { firebaseUid: authUser.uid },
    select: { id: true }
  });

  if (!dbUser) {
    await syncUserWithPostgres(fastify.prisma, authUser, fastify.log);
    dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });
  }

  return dbUser?.id ?? null;
}

type LatestResponse = {
  result: {
    id: string;
    phone: string;
    score: number | null;
    totalMarks: number | null;
    timeTaken: number | null;
    passed: boolean | null;
    answers: Record<string, string>;
    userId: string | null;
    isGuest: boolean;
    isCleared: boolean;
    createdAt: string;
  } | null;
};

type SubmitBody = {
  score?: unknown;
  totalMarks?: unknown;
  timeTaken?: unknown;
  answers?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeAnswers(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([k, v]) => Number.isFinite(Number(k)) && typeof v === "string")
      .map(([k, v]) => [String(Number(k)), v as string])
  );
}

const mockTestRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/latest", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const userId = await resolveDbUserId(fastify, authUser);

    if (!userId) {
      const body: LatestResponse = { result: null };
      return body;
    }

    let row;
    try {
      row = await fastify.prisma.cadetIqMockResult.findFirst({
        where: {
          userId,
          isCleared: false,
          score: { not: null }
        },
        orderBy: { createdAt: "desc" }
      });
    } catch (err) {
      if (isCadetIqTableMissing(err)) {
        request.log.warn({ err }, "cadetIqMockResult: table missing");
        return reply.serviceUnavailable(CADET_IQ_TABLE_HINT);
      }
      throw err;
    }

    if (!row || row.score === null) {
      const body: LatestResponse = { result: null };
      return body;
    }

    const body: LatestResponse = {
      result: {
        id: row.id,
        phone: "",
        score: row.score,
        totalMarks: row.totalMarks,
        timeTaken: row.timeTaken,
        passed: row.passed,
        answers: row.answers as Record<string, string>,
        userId: authUser.uid,
        isGuest: false,
        isCleared: row.isCleared,
        createdAt: row.createdAt.toISOString()
      }
    };

    return body;
  });

  fastify.post<{ Body: SubmitBody }>("/results", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const userId = await resolveDbUserId(fastify, authUser);

    if (!userId) {
      return reply.serviceUnavailable(
        "Could not sync your account to the database. Check that the API can reach Postgres, then try again."
      );
    }

    const { score, totalMarks, timeTaken, answers } = request.body ?? {};

    if (typeof score !== "number" || !Number.isFinite(score)) {
      return reply.badRequest("A numeric score is required.");
    }
    if (typeof totalMarks !== "number" || !Number.isFinite(totalMarks)) {
      return reply.badRequest("totalMarks is required.");
    }
    if (typeof timeTaken !== "number" || !Number.isFinite(timeTaken) || timeTaken < 0) {
      return reply.badRequest("timeTaken is required.");
    }

    const answersObj = normalizeAnswers(answers);

    let row;
    try {
      row = await fastify.prisma.cadetIqMockResult.create({
        data: {
          userId,
          score,
          totalMarks,
          timeTaken,
          passed: score >= PASS_MARK_SCORE,
          answers: answersObj,
          isCleared: false
        }
      });
    } catch (err) {
      if (isCadetIqTableMissing(err)) {
        request.log.warn({ err }, "cadetIqMockResult.create: table missing");
        return reply.serviceUnavailable(CADET_IQ_TABLE_HINT);
      }
      throw err;
    }

    return {
      result: {
        id: row.id,
        phone: "",
        score: row.score,
        totalMarks: row.totalMarks,
        timeTaken: row.timeTaken,
        passed: row.passed,
        answers: row.answers as Record<string, string>,
        userId: authUser.uid,
        isGuest: false,
        isCleared: row.isCleared,
        createdAt: row.createdAt.toISOString()
      }
    };
  });

  fastify.patch<{ Params: { id: string } }>("/results/:id/clear", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const userId = await resolveDbUserId(fastify, authUser);

    if (!userId) {
      return reply.serviceUnavailable(
        "Could not sync your account to the database. Try again in a moment."
      );
    }

    const id = request.params.id?.trim();
    if (!id) {
      return reply.badRequest("Result id is required.");
    }

    try {
      const existing = await fastify.prisma.cadetIqMockResult.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return reply.notFound("Result not found.");
      }

      await fastify.prisma.cadetIqMockResult.update({
        where: { id: existing.id },
        data: {
          score: null,
          totalMarks: null,
          timeTaken: null,
          passed: null,
          answers: {},
          isCleared: true
        }
      });
    } catch (err) {
      if (isCadetIqTableMissing(err)) {
        request.log.warn({ err }, "cadetIqMockResult: table missing (clear)");
        return reply.serviceUnavailable(CADET_IQ_TABLE_HINT);
      }
      throw err;
    }

    return reply.code(204).send();
  });
};

export default mockTestRoutes;
