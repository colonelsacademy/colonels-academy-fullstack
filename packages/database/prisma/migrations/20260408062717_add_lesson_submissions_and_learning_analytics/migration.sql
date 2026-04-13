-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('LECTURETTE', 'ESSAY', 'APPRECIATION_PLAN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'REVISION_REQUESTED');

-- CreateTable
CREATE TABLE "LessonSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "phaseNumber" INTEGER,
    "subjectArea" "SubjectArea",
    "submissionType" "SubmissionType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "assetUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" INTEGER,
    "maxScore" INTEGER,
    "rubricScores" JSONB,
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSubmission_userId_courseId_idx" ON "LessonSubmission"("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonSubmission_courseId_status_idx" ON "LessonSubmission"("courseId", "status");

-- CreateIndex
CREATE INDEX "LessonSubmission_courseId_phaseNumber_subjectArea_idx" ON "LessonSubmission"("courseId", "phaseNumber", "subjectArea");

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSubmission" ADD CONSTRAINT "LessonSubmission_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
