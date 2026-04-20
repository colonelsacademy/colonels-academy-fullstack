-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "assessmentWeighting" JSONB;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "componentCode" TEXT,
ADD COLUMN     "componentLabel" TEXT;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "componentCode" TEXT,
ADD COLUMN     "componentLabel" TEXT;
