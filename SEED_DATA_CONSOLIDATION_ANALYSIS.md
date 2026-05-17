# Seed Data Consolidation Strategy Analysis

**Date**: May 15, 2026  
**Status**: Comprehensive Analysis Complete  
**Task**: Consolidate ASI, Officer Cadet, and IQ test questions into centralized Prisma seed system

---

## Executive Summary

Your project currently has **fragmented seed data** across three locations:
1. **Army Command** (centralized in `packages/database/prisma/seeds/`)
2. **ASI & Officer Cadet** (local scripts in `apps/api/src/scripts/`)
3. **IQ Test** (hardcoded in local script with CDN URLs)

This creates **production risk**: If you deploy to a new VPS or clear the production database, running only `npx prisma db seed` from `packages/database` will **NOT** seed ASI/Officer Cadet/IQ questions—they'll be missing.

---

## Analysis of Your 4 Key Questions

### Question 1: What happens to ASI/Officer Cadet questions if moving to new VPS or clearing production database?

**Answer: They disappear.**

**Current Flow:**
```
Production Database
├── Army Command questions (seeded by: packages/database/prisma/seed.ts)
├── ASI questions (seeded by: apps/api/src/scripts/seed-asi-questions.ts)
├── Officer Cadet questions (seeded by: apps/api/src/scripts/seed-officer-cadet-questions.ts)
└── IQ Test questions (seeded by: apps/api/src/scripts/seed-cadet-iq-test.ts)
```

**On New VPS or DB Clear:**
- CI/CD runs: `npx prisma db seed` (from `packages/database`)
- ✅ Army Command questions are seeded
- ❌ ASI questions are NOT seeded (script not called)
- ❌ Officer Cadet questions are NOT seeded (script not called)
- ❌ IQ Test questions are NOT seeded (script not called)

**Result**: Users see empty tests for ASI, Officer Cadet, and IQ.

---

### Question 2: Can production site show empty tests if CI/CD only runs `npx prisma db seed` from `packages/database`?

**Answer: Yes, absolutely.**

**Current CI/CD Assumption:**
Your CI/CD pipeline likely only runs:
```bash
cd packages/database
npx prisma db seed
```

This calls `packages/database/prisma/seed.ts`, which:
1. Seeds courses (Army Command, Police Inspector, etc.)
2. Seeds mock test bundles (Officer Cadet, ASI)
3. Calls `seedMockTestBundles()` which creates **empty bundle records**
4. Does NOT call the local scripts that populate questions

**What Users See:**
- ✅ Mock test bundles exist (Officer Cadet, ASI, IQ)
- ❌ But they have 0 questions
- ❌ Users click "5 Free Questions" → "0 questions available"

---

### Question 3: Why is it better to move all tests to `packages/database/prisma/data/` before adding Set 2 & Set 3?

**Answer: Centralization prevents data loss and enables scalability.**

**Current Problems with Local Scripts:**
1. **Fragmentation**: Questions live in 3 different locations
2. **No version control**: If you delete `apps/api/src/scripts/seed-asi-questions.ts`, data is lost
3. **Deployment risk**: New team members don't know to run local scripts
4. **Scaling pain**: Adding Set 2 & Set 3 means creating 3 more scripts (Set 2 ASI, Set 2 Officer Cadet, Set 2 IQ)
5. **Maintenance nightmare**: 6 separate seed scripts to maintain

**Benefits of Centralization:**
1. **Single source of truth**: All test data in `packages/database/prisma/data/`
2. **Version controlled**: Git tracks all question changes
3. **Automatic deployment**: `npx prisma db seed` handles everything
4. **Scalable**: Adding Set 2 & Set 3 is just adding more JSON files
5. **Auditable**: Easy to see what changed and when

**Proposed Structure:**
```
packages/database/prisma/data/
├── mock-tests/
│   ├── officer-cadet/
│   │   ├── set-1-gk.json (60 questions)
│   │   ├── set-2-gk.json (60 questions) ← NEW
│   │   ├── set-3-gk.json (60 questions) ← NEW
│   │   ├── set-1-nepali.json (50 questions)
│   │   ├── set-2-nepali.json (50 questions) ← NEW
│   │   └── set-3-nepali.json (50 questions) ← NEW
│   ├── asi/
│   │   ├── set-1-gk.json (25 questions)
│   │   ├── set-2-gk.json (25 questions) ← NEW
│   │   ├── set-3-gk.json (25 questions) ← NEW
│   │   ├── set-1-reasoning.json (25 questions)
│   │   ├── set-2-reasoning.json (25 questions) ← NEW
│   │   └── set-3-reasoning.json (25 questions) ← NEW
│   └── iq/
│       ├── set-1.json (60 questions)
│       ├── set-2.json (60 questions) ← NEW
│       └── set-3.json (60 questions) ← NEW
└── seed-mock-tests.ts (unified seed script)
```

---

### Question 4: What's the plan to consolidate everything into Prisma "Vault" without losing current data?

**Answer: 3-phase migration with zero data loss.**

---

## Consolidation Plan: 3-Phase Migration

### Phase 1: Prepare (No Data Loss)

**Goal**: Export current data, create new structure, verify integrity

**Steps:**

1. **Export Current Data**
   ```bash
   # Run this script to export all questions from production
   npx ts-node apps/api/src/scripts/export-mock-test-data.ts
   ```
   Output:
   ```
   packages/database/prisma/data/mock-tests/
   ├── officer-cadet/
   │   ├── set-1-gk.json (exported from DB)
   │   └── set-1-nepali.json (exported from DB)
   ├── asi/
   │   ├── set-1-gk.json (exported from DB)
   │   └── set-1-reasoning.json (exported from DB)
   └── iq/
       └── set-1.json (exported from DB)
   ```

2. **Create Unified Seed Script**
   ```typescript
   // packages/database/prisma/seeds/seed-mock-tests.ts
   export async function seedMockTests(prisma: PrismaClient) {
     // Load all JSON files from packages/database/prisma/data/mock-tests/
     // Seed Officer Cadet, ASI, IQ tests
     // Idempotent: safe to run multiple times
   }
   ```

3. **Integrate into Main Seed**
   ```typescript
   // packages/database/prisma/seed.ts
   import { seedMockTests } from "./seeds/seed-mock-tests";
   
   async function main() {
     // ... existing code ...
     await seedMockTests(prisma);
   }
   ```

4. **Verify Data Integrity**
   ```bash
   # Count questions before and after
   npm run seed:verify
   ```
   Expected output:
   ```
   Officer Cadet GK: 60 questions ✓
   Officer Cadet Nepali: 50 questions ✓
   ASI GK: 25 questions ✓
   ASI Reasoning: 25 questions ✓
   IQ Test: 60 questions ✓
   Total: 220 questions ✓
   ```

---

### Phase 2: Deploy (Gradual Rollout)

**Goal**: Test new seed system in staging, then production

**Steps:**

1. **Deploy to Staging**
   ```bash
   # Staging environment
   git push origin feature/consolidate-seeds
   # CI/CD runs: npx prisma db seed
   # Verify all tests appear in staging UI
   ```

2. **Run Parallel Verification**
   - Old scripts still work (backward compatible)
   - New unified seed also works
   - Both produce identical data

3. **Production Deployment**
   ```bash
   # Merge to main
   git merge feature/consolidate-seeds
   # CI/CD runs: npx prisma db seed
   # All tests seeded automatically
   ```

---

### Phase 3: Cleanup (Remove Old Scripts)

**Goal**: Remove local scripts, consolidate codebase

**Steps:**

1. **Delete Old Scripts** (after 1 week in production)
   ```bash
   rm apps/api/src/scripts/seed-officer-cadet-questions.ts
   rm apps/api/src/scripts/seed-asi-questions.ts
   rm apps/api/src/scripts/seed-cadet-iq-test.ts
   rm apps/api/src/scripts/seed-asi-mock-tests.ts
   ```

2. **Update Documentation**
   - Update README: "All test data is in `packages/database/prisma/data/`"
   - Add guide: "How to add new test sets"

3. **Archive Old Scripts** (optional)
   ```bash
   git tag archive/old-seed-scripts
   ```

---

## Implementation Details

### File Structure After Consolidation

```
packages/database/
├── prisma/
│   ├── seed.ts (main entry point - calls seedMockTests)
│   ├── seeds/
│   │   ├── seed-mock-test-bundles.ts (existing)
│   │   ├── seed-mock-tests.ts (NEW - unified)
│   │   └── seed-army-command-staff-2083.ts (existing)
│   └── data/
│       └── mock-tests/
│           ├── officer-cadet/
│           │   ├── set-1-gk.json
│           │   ├── set-1-nepali.json
│           │   ├── set-2-gk.json (future)
│           │   └── set-2-nepali.json (future)
│           ├── asi/
│           │   ├── set-1-gk.json
│           │   ├── set-1-reasoning.json
│           │   ├── set-2-gk.json (future)
│           │   └── set-2-reasoning.json (future)
│           └── iq/
│               ├── set-1.json
│               └── set-2.json (future)
```

### JSON Format for Question Sets

```json
{
  "testId": "test_officer_cadet_gk_set_1",
  "title": "Officer Cadet GK - Set 1",
  "position": "Officer Cadet",
  "subject": "GK",
  "description": "General Knowledge - 60 questions, 90 minutes",
  "timeLimitMinutes": 90,
  "totalQuestions": 60,
  "passingScore": 60,
  "accessType": "PAID",
  "priceNpr": 500,
  "freePreviewCount": 5,
  "questions": [
    {
      "position": 1,
      "questionText": "Who is known as the founder of modern Nepal?",
      "options": ["Bhimsen Thapa", "Prithvi Narayan Shah", "Jung Bahadur Rana", "Tribhuvan"],
      "correctAnswer": "B",
      "explanation": "Prithvi Narayan Shah is known as the founder of modern Nepal.",
      "difficulty": 1,
      "isImageBased": false,
      "imageUrl": null
    },
    {
      "position": 2,
      "questionText": "What is the capital city of Nepal?",
      "options": ["Pokhara", "Lalitpur", "Kathmandu", "Biratnagar"],
      "correctAnswer": "C",
      "explanation": "Kathmandu is the capital city of Nepal.",
      "difficulty": 1,
      "isImageBased": false,
      "imageUrl": null
    }
    // ... 58 more questions
  ]
}
```

### Unified Seed Script

```typescript
// packages/database/prisma/seeds/seed-mock-tests.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export async function seedMockTests(prisma: PrismaClient) {
  console.log("🎖️  Seeding Mock Tests from centralized data...");

  const dataDir = path.join(__dirname, "../data/mock-tests");
  const positions = ["officer-cadet", "asi", "iq"];

  for (const position of positions) {
    const positionDir = path.join(dataDir, position);
    if (!fs.existsSync(positionDir)) continue;

    const files = fs.readdirSync(positionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(positionDir, file);
      const testData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Create or update subject
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
          description: testData.description
        }
      });

      // Create or update mock test
      const mockTest = await prisma.mockTest.upsert({
        where: { id: testData.testId },
        update: {
          title: testData.title,
          description: testData.description,
          timeLimitMinutes: testData.timeLimitMinutes,
          totalQuestions: testData.totalQuestions,
          passingScore: testData.passingScore
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

      // Seed questions
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
            isImageBased: question.isImageBased,
            imageUrl: question.imageUrl
          },
          create: {
            mockTestId: mockTest.id,
            position: question.position,
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            isImageBased: question.isImageBased,
            imageUrl: question.imageUrl
          }
        });
      }

      console.log(`✓ Seeded ${testData.title} (${testData.questions.length} questions)`);
    }
  }

  console.log("✅ Mock tests seeded successfully!");
}
```

---

## Adding Set 2 & Set 3 (Future)

Once consolidated, adding new question sets is trivial:

1. **Create new JSON files**
   ```
   packages/database/prisma/data/mock-tests/
   ├── officer-cadet/
   │   ├── set-1-gk.json (existing)
   │   ├── set-2-gk.json (NEW - 60 questions from Docx)
   │   └── set-3-gk.json (NEW - 60 questions from Docx)
   ```

2. **Run seed**
   ```bash
   npx prisma db seed
   ```

3. **Done** ✓ All 3 sets are now in the database

No code changes needed. Just add JSON files.

---

## CI/CD Implications

### Before Consolidation
```yaml
# .github/workflows/deploy.yml
- name: Seed database
  run: |
    cd packages/database
    npx prisma db seed
    # ❌ ASI/Officer Cadet/IQ questions NOT seeded
```

### After Consolidation
```yaml
# .github/workflows/deploy.yml
- name: Seed database
  run: |
    cd packages/database
    npx prisma db seed
    # ✅ ALL tests seeded (Army Command, ASI, Officer Cadet, IQ)
```

**No CI/CD changes needed.** The unified seed script is called automatically.

---

## Risk Mitigation

### Data Loss Prevention
- ✅ Export current data before migration
- ✅ Verify question counts match
- ✅ Test in staging first
- ✅ Keep old scripts for 1 week (rollback option)

### Deployment Safety
- ✅ Idempotent seed (safe to run multiple times)
- ✅ No destructive operations
- ✅ Gradual rollout (staging → production)

### Maintenance
- ✅ Single source of truth (JSON files)
- ✅ Version controlled (Git)
- ✅ Easy to audit (see all changes)

---

## Summary Table

| Aspect | Current | After Consolidation |
|--------|---------|---------------------|
| **Data Location** | 3 places (fragmented) | 1 place (centralized) |
| **Seed Entry Point** | Multiple scripts | Single `npx prisma db seed` |
| **CI/CD Risk** | High (missing data) | Low (automatic) |
| **Adding Set 2** | Create 3 new scripts | Add 3 JSON files |
| **Version Control** | Partial (code only) | Complete (data + code) |
| **Deployment Time** | Manual + scripts | Automatic |
| **Maintenance** | Complex | Simple |

---

## Next Steps

1. **Create export script** to extract current questions from DB
2. **Create JSON files** in `packages/database/prisma/data/mock-tests/`
3. **Create unified seed script** `seed-mock-tests.ts`
4. **Test in staging** environment
5. **Deploy to production**
6. **Remove old scripts** after 1 week
7. **Add Set 2 & Set 3** by creating new JSON files

---

## Questions?

This analysis addresses:
- ✅ What happens to ASI/Officer Cadet questions on new VPS
- ✅ Can production show empty tests
- ✅ Why consolidate before adding Set 2 & Set 3
- ✅ Step-by-step consolidation plan with zero data loss

Ready to implement Phase 1 (export + prepare)?
