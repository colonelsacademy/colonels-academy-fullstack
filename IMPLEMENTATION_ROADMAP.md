# Seed Data Consolidation - Implementation Roadmap

**Status**: Ready to Start  
**Estimated Duration**: 4-6 hours  
**Complexity**: Medium  
**Risk Level**: Low (with proper testing)

---

## Overview

This roadmap breaks down the consolidation into concrete, actionable steps with code examples.

---

## Phase 1: Export & Prepare (1-2 hours)

### Step 1.1: Create Export Script

**File**: `apps/api/src/scripts/export-mock-test-data.ts`

**Purpose**: Extract all questions from database and create JSON files

**Code Template**:
```typescript
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("📤 Exporting mock test data...");

  // 1. Get all mock tests
  const mockTests = await prisma.mockTest.findMany({
    include: {
      subject: true,
      questions: {
        orderBy: { position: "asc" }
      }
    }
  });

  // 2. Group by position
  const byPosition: Record<string, any[]> = {};
  for (const test of mockTests) {
    if (!byPosition[test.position]) {
      byPosition[test.position] = [];
    }
    byPosition[test.position].push(test);
  }

  // 3. Create output directory
  const outputDir = path.join(__dirname, "../../packages/database/prisma/data/mock-tests");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 4. Write JSON files
  let totalQuestions = 0;
  for (const [position, tests] of Object.entries(byPosition)) {
    const posDir = path.join(outputDir, position.toLowerCase().replace(/\s+/g, "-"));
    if (!fs.existsSync(posDir)) {
      fs.mkdirSync(posDir, { recursive: true });
    }

    for (const test of tests) {
      const filename = `${test.subject.name.toLowerCase()}.json`;
      const filepath = path.join(posDir, filename);

      const data = {
        testId: test.id,
        title: test.title,
        position: test.position,
        subject: test.subject.name,
        description: test.description,
        timeLimitMinutes: test.timeLimitMinutes,
        totalQuestions: test.totalQuestions,
        passingScore: test.passingScore,
        accessType: test.accessType,
        priceNpr: test.priceNpr,
        freePreviewCount: test.freePreviewCount,
        questions: test.questions.map((q) => ({
          position: q.position,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          isImageBased: q.isImageBased,
          imageUrl: q.imageUrl
        }))
      };

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`✓ Exported ${test.title} (${test.questions.length} questions)`);
      totalQuestions += test.questions.length;
    }
  }

  console.log(`\n✅ Export complete! Total questions: ${totalQuestions}`);
  console.log(`📁 Files created in: ${outputDir}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run**:
```bash
npx ts-node apps/api/src/scripts/export-mock-test-data.ts
```

**Expected Output**:
```
📤 Exporting mock test data...
✓ Exported Officer Cadet GK Test (60 questions)
✓ Exported Officer Cadet Nepali Test (50 questions)
✓ Exported ASI GK Test (25 questions)
✓ Exported ASI Reasoning Test (25 questions)
✓ Exported IQ Mock Examination (60 questions)

✅ Export complete! Total questions: 220
📁 Files created in: packages/database/prisma/data/mock-tests
```

**Verify**:
```bash
# Check files were created
ls -la packages/database/prisma/data/mock-tests/
# Should show: officer-cadet/, asi/, iq/

ls -la packages/database/prisma/data/mock-tests/officer-cadet/
# Should show: gk.json, nepali.json

# Check file content
cat packages/database/prisma/data/mock-tests/officer-cadet/gk.json | head -20
```

---

### Step 1.2: Create Unified Seed Script

**File**: `packages/database/prisma/seeds/seed-mock-tests.ts`

**Purpose**: Load JSON files and seed database

**Code Template**:
```typescript
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export async function seedMockTests(prisma: PrismaClient) {
  console.log("🎖️  Seeding Mock Tests from centralized data...");

  const dataDir = path.join(__dirname, "../data/mock-tests");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    console.log("⚠️  Data directory not found. Skipping mock test seed.");
    return;
  }

  const positions = fs.readdirSync(dataDir).filter((f) => {
    return fs.statSync(path.join(dataDir, f)).isDirectory();
  });

  let totalTests = 0;
  let totalQuestions = 0;

  for (const position of positions) {
    const positionDir = path.join(dataDir, position);
    const files = fs.readdirSync(positionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(positionDir, file);
      const testData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // 1. Create or update subject
      const subject = await prisma.subject.upsert({
        where: {
          name_position: {
            name: testData.subject,
            position: testData.position
          }
        },
        update: {},
        create: {
          name: testData.subject,
          position: testData.position,
          description: testData.description || ""
        }
      });

      // 2. Create or update mock test
      const mockTest = await prisma.mockTest.upsert({
        where: { id: testData.testId },
        update: {
          title: testData.title,
          description: testData.description,
          timeLimitMinutes: testData.timeLimitMinutes,
          totalQuestions: testData.totalQuestions,
          passingScore: testData.passingScore,
          accessType: testData.accessType,
          priceNpr: testData.priceNpr,
          freePreviewCount: testData.freePreviewCount,
          status: "PUBLISHED"
        },
        create: {
          id: testData.testId,
          title: testData.title,
          description: testData.description,
          position: testData.position,
          subjectId: subject.id,
          timeLimitMinutes: testData.timeLimitMinutes,
          totalQuestions: testData.totalQuestions,
          passingScore: testData.passingScore,
          accessType: testData.accessType,
          priceNpr: testData.priceNpr,
          freePreviewCount: testData.freePreviewCount,
          status: "PUBLISHED",
          createdBy: "system"
        }
      });

      // 3. Seed questions (upsert for idempotency)
      for (const question of testData.questions) {
        await prisma.mockTestQuestion.upsert({
          where: {
            mockTestId_position: {
              mockTestId: mockTest.id,
              position: question.position
            }
          },
          update: {
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            isImageBased: question.isImageBased || false,
            imageUrl: question.imageUrl || null
          },
          create: {
            mockTestId: mockTest.id,
            position: question.position,
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            isImageBased: question.isImageBased || false,
            imageUrl: question.imageUrl || null
          }
        });
      }

      console.log(`✓ Seeded ${testData.title} (${testData.questions.length} questions)`);
      totalTests++;
      totalQuestions += testData.questions.length;
    }
  }

  console.log(`\n✅ Mock tests seeded successfully!`);
  console.log(`   Tests: ${totalTests}`);
  console.log(`   Questions: ${totalQuestions}`);
}
```

---

### Step 1.3: Integrate into Main Seed

**File**: `packages/database/prisma/seed.ts`

**Change**: Add import and call

```typescript
// At the top, add import
import { seedMockTests } from "./seeds/seed-mock-tests";

// In main() function, add this before the final console.log
console.log("\n🎖️  Seeding Mock Tests...");
try {
  await seedMockTests(prisma);
} catch (error) {
  console.error("❌ Error seeding mock tests:", error);
  throw error;
}
```

---

### Step 1.4: Verify Data Integrity

**File**: `apps/api/src/scripts/verify-seed-data.ts`

**Purpose**: Ensure no data loss

**Code Template**:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying seed data integrity...\n");

  const tests = await prisma.mockTest.findMany({
    include: {
      questions: true,
      subject: true
    }
  });

  const expected: Record<string, number> = {
    "Officer Cadet - GK": 60,
    "Officer Cadet - Nepali": 50,
    "ASI - GK": 25,
    "ASI - Reasoning": 25,
    "IQ Test": 60
  };

  let totalQuestions = 0;
  let allMatch = true;

  for (const test of tests) {
    const key = `${test.position} - ${test.subject.name}`;
    const count = test.questions.length;
    const expectedCount = expected[key];

    if (expectedCount !== undefined) {
      const match = count === expectedCount ? "✓" : "✗";
      console.log(`${match} ${key}: ${count} questions (expected ${expectedCount})`);
      if (count !== expectedCount) allMatch = false;
    } else {
      console.log(`? ${key}: ${count} questions (no expectation set)`);
    }

    totalQuestions += count;
  }

  console.log(`\n📊 Total: ${totalQuestions} questions`);

  if (allMatch) {
    console.log("✅ All data verified successfully!");
    process.exit(0);
  } else {
    console.log("❌ Data mismatch detected!");
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run**:
```bash
npx ts-node apps/api/src/scripts/verify-seed-data.ts
```

**Expected Output**:
```
🔍 Verifying seed data integrity...

✓ Officer Cadet - GK: 60 questions (expected 60)
✓ Officer Cadet - Nepali: 50 questions (expected 50)
✓ ASI - GK: 25 questions (expected 25)
✓ ASI - Reasoning: 25 questions (expected 25)
✓ IQ Test: 60 questions (expected 60)

📊 Total: 220 questions

✅ All data verified successfully!
```

---

## Phase 2: Test Locally (30 minutes)

### Step 2.1: Run Export Script
```bash
npx ts-node apps/api/src/scripts/export-mock-test-data.ts
```

### Step 2.2: Verify JSON Files
```bash
# Check structure
tree packages/database/prisma/data/mock-tests/

# Check file content
cat packages/database/prisma/data/mock-tests/officer-cadet/gk.json | jq '.questions | length'
# Should output: 60
```

### Step 2.3: Run Seed Locally
```bash
cd packages/database
npx prisma db seed
```

### Step 2.4: Verify Database
```bash
npx ts-node ../../apps/api/src/scripts/verify-seed-data.ts
```

---

## Phase 3: Deploy to Staging (1-2 hours)

### Step 3.1: Create Pull Request
```bash
git checkout -b feature/consolidate-mock-test-seeds
git add packages/database/prisma/data/mock-tests/
git add packages/database/prisma/seeds/seed-mock-tests.ts
git add packages/database/prisma/seed.ts
git commit -m "feat: consolidate mock test seed data

- Export all questions to JSON files
- Create unified seed script
- Integrate into main seed
- Fixes production risk of missing tests on new VPS"
git push -u origin feature/consolidate-mock-test-seeds
```

### Step 3.2: Deploy to Staging
```bash
# Merge PR to staging branch
git checkout staging
git merge feature/consolidate-mock-test-seeds
git push origin staging
# CI/CD deploys to staging
```

### Step 3.3: Test in Staging
```bash
# SSH into staging
ssh staging-server

# Run seed
cd /app/packages/database
npx prisma db seed

# Verify
npx ts-node ../../apps/api/src/scripts/verify-seed-data.ts

# Test UI
# Open browser: https://staging.colonels-academy.com
# Navigate to mock tests
# Verify all tests appear
# Try free preview
# Try purchase flow
```

---

## Phase 4: Production Deployment (30 minutes)

### Step 4.1: Merge to Main
```bash
git checkout main
git merge feature/consolidate-mock-test-seeds
git push origin main
# CI/CD auto-deploys to production
```

### Step 4.2: Monitor Deployment
```bash
# Watch CI/CD logs
# Verify seed runs successfully
# Check for errors
```

### Step 4.3: Verify Production
```bash
# Test UI
# Open browser: https://colonels-academy.com
# Navigate to mock tests
# Verify all tests appear
# Try free preview
# Try purchase flow

# Check logs
# Verify no errors
```

---

## Phase 5: Cleanup (Optional, 30 minutes)

### Step 5.1: Delete Old Scripts (After 1 week)
```bash
rm apps/api/src/scripts/seed-officer-cadet-questions.ts
rm apps/api/src/scripts/seed-asi-questions.ts
rm apps/api/src/scripts/seed-cadet-iq-test.ts
rm apps/api/src/scripts/seed-asi-mock-tests.ts
```

### Step 5.2: Update Documentation
```bash
# Update README.md
# Add section: "Mock Test Data Structure"
# Explain: "All test data is in packages/database/prisma/data/mock-tests/"
# Add guide: "How to add new test sets"
```

### Step 5.3: Commit Cleanup
```bash
git add -A
git commit -m "chore: remove old mock test seed scripts

- Consolidated into packages/database/prisma/seeds/seed-mock-tests.ts
- All data now in packages/database/prisma/data/mock-tests/
- Simplifies maintenance and deployment"
git push origin main
```

---

## Rollback Plan

If issues occur:

### Option 1: Revert Commit
```bash
git revert <commit-hash>
git push origin main
# CI/CD auto-deploys
```

### Option 2: Restore Old Scripts
```bash
git checkout <old-commit> -- apps/api/src/scripts/seed-*.ts
git commit -m "revert: restore old seed scripts"
git push origin main
```

---

## Success Checklist

- [ ] Export script creates JSON files
- [ ] JSON files have correct structure
- [ ] Unified seed script loads JSON files
- [ ] Main seed.ts calls unified seed
- [ ] Local seed runs without errors
- [ ] Verification script passes
- [ ] Staging deployment successful
- [ ] All tests appear in staging UI
- [ ] Free preview works in staging
- [ ] Purchase flow works in staging
- [ ] Production deployment successful
- [ ] All tests appear in production UI
- [ ] No errors in production logs
- [ ] Old scripts deleted (optional)
- [ ] Documentation updated (optional)

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Export & Prepare | 1-2 hours | Ready |
| Phase 2: Test Locally | 30 minutes | Ready |
| Phase 3: Deploy to Staging | 1-2 hours | Ready |
| Phase 4: Production Deployment | 30 minutes | Ready |
| Phase 5: Cleanup | 30 minutes | Optional |
| **Total** | **4-6 hours** | **Ready to Start** |

---

## Next Steps

1. **Start Phase 1, Step 1.1**: Create export script
2. **Run export**: Extract questions to JSON
3. **Create unified seed**: Load JSON and seed DB
4. **Test locally**: Verify everything works
5. **Deploy to staging**: Test in staging environment
6. **Production**: Merge and deploy
7. **Cleanup**: Remove old scripts (optional)

Ready to begin?
