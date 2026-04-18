-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ESEWA', 'KHALTI', 'BANK_TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BundleType" AS ENUM ('STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "completionWeight" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "referencePages" TEXT;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "chapterNumber" INTEGER,
ADD COLUMN     "chapterPrice" INTEGER,
ADD COLUMN     "completionCriteria" JSONB,
ADD COLUMN     "isFreeIntro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChapterPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "bundleId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBundleOffer" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "bundleType" "BundleType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "includedChapters" JSONB NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "bundlePrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "includesMentorAccess" BOOLEAN NOT NULL DEFAULT false,
    "includesMockExams" BOOLEAN NOT NULL DEFAULT false,
    "includesCertificate" BOOLEAN NOT NULL DEFAULT false,
    "includesLiveClasses" BOOLEAN NOT NULL DEFAULT false,
    "mockExamCount" INTEGER,
    "liveClassCount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBundleOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundlePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bundleOfferId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "chaptersUnlocked" JSONB NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundlePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL,
    "videosWatched" INTEGER NOT NULL DEFAULT 0,
    "totalVideos" INTEGER NOT NULL,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzes" INTEGER NOT NULL,
    "assignmentsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "totalAssignments" INTEGER NOT NULL,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isChapterCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionDate" TIMESTAMP(3),
    "allVideosWatched" BOOLEAN NOT NULL DEFAULT false,
    "allQuizzesPassed" BOOLEAN NOT NULL DEFAULT false,
    "allAssignmentsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "chapterAssessmentPassed" BOOLEAN NOT NULL DEFAULT false,
    "nextChapterUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "achievementType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeIcon" TEXT,
    "earnedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChapterPurchase_userId_courseId_idx" ON "ChapterPurchase"("userId", "courseId");

-- CreateIndex
CREATE INDEX "ChapterPurchase_courseId_chapterNumber_idx" ON "ChapterPurchase"("courseId", "chapterNumber");

-- CreateIndex
CREATE INDEX "ChapterPurchase_paymentStatus_idx" ON "ChapterPurchase"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterPurchase_userId_moduleId_key" ON "ChapterPurchase"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "CourseBundleOffer_courseId_isActive_idx" ON "CourseBundleOffer"("courseId", "isActive");

-- CreateIndex
CREATE INDEX "CourseBundleOffer_bundleType_idx" ON "CourseBundleOffer"("bundleType");

-- CreateIndex
CREATE INDEX "BundlePurchase_userId_courseId_idx" ON "BundlePurchase"("userId", "courseId");

-- CreateIndex
CREATE INDEX "BundlePurchase_paymentStatus_idx" ON "BundlePurchase"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "BundlePurchase_userId_bundleOfferId_key" ON "BundlePurchase"("userId", "bundleOfferId");

-- CreateIndex
CREATE INDEX "ChapterProgress_userId_courseId_idx" ON "ChapterProgress"("userId", "courseId");

-- CreateIndex
CREATE INDEX "ChapterProgress_courseId_chapterNumber_idx" ON "ChapterProgress"("courseId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_userId_moduleId_key" ON "ChapterProgress"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "ChapterAchievement_userId_courseId_idx" ON "ChapterAchievement"("userId", "courseId");

-- CreateIndex
CREATE INDEX "ChapterAchievement_courseId_chapterNumber_idx" ON "ChapterAchievement"("courseId", "chapterNumber");

-- CreateIndex
CREATE INDEX "Module_courseId_chapterNumber_idx" ON "Module"("courseId", "chapterNumber");

-- CreateIndex
CREATE INDEX "Module_courseId_isFreeIntro_idx" ON "Module"("courseId", "isFreeIntro");

-- AddForeignKey
ALTER TABLE "ChapterPurchase" ADD CONSTRAINT "ChapterPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterPurchase" ADD CONSTRAINT "ChapterPurchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterPurchase" ADD CONSTRAINT "ChapterPurchase_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterPurchase" ADD CONSTRAINT "ChapterPurchase_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BundlePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBundleOffer" ADD CONSTRAINT "CourseBundleOffer_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePurchase" ADD CONSTRAINT "BundlePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePurchase" ADD CONSTRAINT "BundlePurchase_bundleOfferId_fkey" FOREIGN KEY ("bundleOfferId") REFERENCES "CourseBundleOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePurchase" ADD CONSTRAINT "BundlePurchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterAchievement" ADD CONSTRAINT "ChapterAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterAchievement" ADD CONSTRAINT "ChapterAchievement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
