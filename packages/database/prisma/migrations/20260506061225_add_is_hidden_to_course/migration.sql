-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "difficultyModes" TEXT NOT NULL DEFAULT 'MIXED',
    "accessType" TEXT NOT NULL DEFAULT 'FREE',
    "priceNpr" INTEGER,
    "freePreviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestQuestion" (
    "id" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "isImageBased" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeTakenSeconds" INTEGER,
    "score" INTEGER,
    "totalMarks" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "answers" JSONB NOT NULL,
    "difficultyMode" TEXT NOT NULL DEFAULT 'MIXED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockTestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTestPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSessionAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "chapterPurchaseId" TEXT,
    "bundlePurchaseId" TEXT,
    "mockTestPurchaseId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'INITIATED',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "transactionId" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subject_position_idx" ON "Subject"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_position_key" ON "Subject"("name", "position");

-- CreateIndex
CREATE INDEX "MockTest_position_subjectId_status_accessType_idx" ON "MockTest"("position", "subjectId", "status", "accessType");

-- CreateIndex
CREATE INDEX "MockTestQuestion_mockTestId_idx" ON "MockTestQuestion"("mockTestId");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestQuestion_mockTestId_position_key" ON "MockTestQuestion"("mockTestId", "position");

-- CreateIndex
CREATE INDEX "MockTestAttempt_userId_mockTestId_idx" ON "MockTestAttempt"("userId", "mockTestId");

-- CreateIndex
CREATE INDEX "MockTestAttempt_userId_submittedAt_idx" ON "MockTestAttempt"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "MockTestPurchase_userId_paymentStatus_idx" ON "MockTestPurchase"("userId", "paymentStatus");

-- CreateIndex
CREATE INDEX "MockTestPurchase_mockTestId_paymentStatus_idx" ON "MockTestPurchase"("mockTestId", "paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestPurchase_userId_mockTestId_key" ON "MockTestPurchase"("userId", "mockTestId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "LiveSessionAttendance_sessionId_idx" ON "LiveSessionAttendance"("sessionId");

-- CreateIndex
CREATE INDEX "LiveSessionAttendance_userId_joinedAt_idx" ON "LiveSessionAttendance"("userId", "joinedAt" DESC);

-- CreateIndex
CREATE INDEX "LiveSessionAttendance_sessionId_userId_idx" ON "LiveSessionAttendance"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_userId_attemptedAt_idx" ON "PaymentAttempt"("userId", "attemptedAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentAttempt_orderId_idx" ON "PaymentAttempt"("orderId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_chapterPurchaseId_idx" ON "PaymentAttempt"("chapterPurchaseId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_bundlePurchaseId_idx" ON "PaymentAttempt"("bundlePurchaseId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_mockTestPurchaseId_idx" ON "PaymentAttempt"("mockTestPurchaseId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_idx" ON "PaymentAttempt"("status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_idx" ON "PaymentAttempt"("provider");

-- CreateIndex
CREATE INDEX "PaymentAttempt_attemptedAt_idx" ON "PaymentAttempt"("attemptedAt" DESC);

-- AddForeignKey
ALTER TABLE "MockTest" ADD CONSTRAINT "MockTest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestQuestion" ADD CONSTRAINT "MockTestQuestion_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestAttempt" ADD CONSTRAINT "MockTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestAttempt" ADD CONSTRAINT "MockTestAttempt_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestPurchase" ADD CONSTRAINT "MockTestPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestPurchase" ADD CONSTRAINT "MockTestPurchase_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionAttendance" ADD CONSTRAINT "LiveSessionAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionAttendance" ADD CONSTRAINT "LiveSessionAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_chapterPurchaseId_fkey" FOREIGN KEY ("chapterPurchaseId") REFERENCES "ChapterPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_bundlePurchaseId_fkey" FOREIGN KEY ("bundlePurchaseId") REFERENCES "BundlePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_mockTestPurchaseId_fkey" FOREIGN KEY ("mockTestPurchaseId") REFERENCES "MockTestPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
