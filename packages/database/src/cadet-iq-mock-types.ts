/**
 * Prisma delegate shape for model `CadetIqMockResult`.
 * Declared here so `DatabaseClient` stays accurate when local `prisma generate` is stale or blocked (e.g. Windows file locks).
 * After `pnpm --filter @colonels-academy/database db:generate`, runtime matches these calls.
 */
export type CadetIqMockResultRow = {
  id: string;
  userId: string;
  score: number | null;
  totalMarks: number | null;
  timeTaken: number | null;
  passed: boolean | null;
  answers: unknown;
  isCleared: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CadetIqMockResultDelegate = {
  findFirst: (args: {
    where: {
      id?: string;
      userId?: string;
      isCleared?: boolean;
      score?: { not: null };
    };
    orderBy?: { createdAt: "desc" };
  }) => Promise<CadetIqMockResultRow | null>;
  create: (args: {
    data: {
      userId: string;
      score: number;
      totalMarks: number;
      timeTaken: number;
      passed: boolean;
      answers: Record<string, string>;
      isCleared: boolean;
    };
  }) => Promise<CadetIqMockResultRow>;
  update: (args: {
    where: { id: string };
    data: {
      score: null;
      totalMarks: null;
      timeTaken: null;
      passed: null;
      answers: Record<string, unknown>;
      isCleared: boolean;
    };
  }) => Promise<CadetIqMockResultRow>;
};
