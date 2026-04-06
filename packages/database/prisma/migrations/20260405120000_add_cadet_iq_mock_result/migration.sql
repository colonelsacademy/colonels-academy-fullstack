-- CreateTable
CREATE TABLE "CadetIqMockResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER,
    "totalMarks" INTEGER,
    "timeTaken" INTEGER,
    "passed" BOOLEAN,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadetIqMockResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CadetIqMockResult_userId_isCleared_createdAt_idx" ON "CadetIqMockResult"("userId", "isCleared", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "CadetIqMockResult" ADD CONSTRAINT "CadetIqMockResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
