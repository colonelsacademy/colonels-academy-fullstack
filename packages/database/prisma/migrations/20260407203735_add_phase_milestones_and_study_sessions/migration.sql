-- CreateEnum
CREATE TYPE "SubjectArea" AS ENUM ('TACTICS_ADMIN', 'CURRENT_AFFAIRS', 'MILITARY_HISTORY_STRATEGY', 'APPRECIATION_PLANS', 'LECTURETTE');

-- CreateEnum
CREATE TYPE "StudySessionSource" AS ENUM ('WEB', 'MOBILE', 'MANUAL');

-- CreateEnum
CREATE TYPE "MilestoneCompletionStatus" AS ENUM ('PENDING_REVIEW', 'PASSED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "phaseNumber" INTEGER,
ADD COLUMN     "subjectArea" "SubjectArea";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "phaseNumber" INTEGER,
ADD COLUMN     "subjectArea" "SubjectArea";

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "source" "StudySessionSource" NOT NULL DEFAULT 'WEB',
    "deviceSessionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "heartbeatAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseMilestone" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseMilestoneCompletion" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "MilestoneCompletionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "passedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseMilestoneCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_courseId_idx" ON "StudySession"("userId", "courseId");

-- CreateIndex
CREATE INDEX "StudySession_courseId_startedAt_idx" ON "StudySession"("courseId", "startedAt");

-- CreateIndex
CREATE INDEX "StudySession_userId_endedAt_idx" ON "StudySession"("userId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseMilestone_courseId_phaseNumber_key" ON "PhaseMilestone"("courseId", "phaseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseMilestone_courseId_slug_key" ON "PhaseMilestone"("courseId", "slug");

-- CreateIndex
CREATE INDEX "PhaseMilestoneCompletion_userId_courseId_idx" ON "PhaseMilestoneCompletion"("userId", "courseId");

-- CreateIndex
CREATE INDEX "PhaseMilestoneCompletion_courseId_status_idx" ON "PhaseMilestoneCompletion"("courseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseMilestoneCompletion_userId_milestoneId_key" ON "PhaseMilestoneCompletion"("userId", "milestoneId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseMilestone" ADD CONSTRAINT "PhaseMilestone_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseMilestoneCompletion" ADD CONSTRAINT "PhaseMilestoneCompletion_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "PhaseMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseMilestoneCompletion" ADD CONSTRAINT "PhaseMilestoneCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseMilestoneCompletion" ADD CONSTRAINT "PhaseMilestoneCompletion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseMilestoneCompletion" ADD CONSTRAINT "PhaseMilestoneCompletion_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
