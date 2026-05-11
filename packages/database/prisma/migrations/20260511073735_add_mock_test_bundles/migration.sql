-- AlterTable
ALTER TABLE "PaymentAttempt" ADD COLUMN     "mockTestBundlePurchaseId" TEXT;

-- CreateTable
CREATE TABLE "MockTestBundle" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceNpr" INTEGER NOT NULL,
    "freePreviewCount" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTestBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTestBundlePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTestBundlePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockTestBundle_position_key" ON "MockTestBundle"("position");

-- CreateIndex
CREATE INDEX "MockTestBundle_position_isActive_idx" ON "MockTestBundle"("position", "isActive");

-- CreateIndex
CREATE INDEX "MockTestBundlePurchase_userId_paymentStatus_idx" ON "MockTestBundlePurchase"("userId", "paymentStatus");

-- CreateIndex
CREATE INDEX "MockTestBundlePurchase_bundleId_paymentStatus_idx" ON "MockTestBundlePurchase"("bundleId", "paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestBundlePurchase_userId_bundleId_key" ON "MockTestBundlePurchase"("userId", "bundleId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_mockTestBundlePurchaseId_idx" ON "PaymentAttempt"("mockTestBundlePurchaseId");

-- AddForeignKey
ALTER TABLE "MockTestBundlePurchase" ADD CONSTRAINT "MockTestBundlePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockTestBundlePurchase" ADD CONSTRAINT "MockTestBundlePurchase_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "MockTestBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_mockTestBundlePurchaseId_fkey" FOREIGN KEY ("mockTestBundlePurchaseId") REFERENCES "MockTestBundlePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
