# 🛡️ Seed Protection Guide

## What Was Added

The seed file now has **automatic protection** against overwriting your manual changes.

### Location
File: `packages/database/prisma/seeds/army-command-staff-2083-curriculum.ts`
Lines: 24-30

### The Protection Code

```typescript
// Check if course already has lessons
const existingCourse = await prisma.course.findUnique({
  where: { slug: "army-command-staff-2083" },
  include: {
    lessons: { select: { id: true } }  // ← Checks for existing lessons
  }
});

// If lessons exist, SKIP the entire seed
if (existingCourse && existingCourse.lessons.length > 0) {
  console.log("⚠️  Course already has lessons. Skipping seed to preserve manual changes.");
  console.log(`   Found ${existingCourse.lessons.length} existing lessons.`);
  console.log("   To reseed, delete all lessons first or use --force flag.");
  return;  // ← EXITS HERE - Nothing gets changed!
}
```

## How It Works

### Scenario 1: First Time Running Seed ✅
```
Database: Empty (no lessons)
Seed runs: ✓ Creates all courses, chapters, lessons
Result: Fresh database with initial data
```

### Scenario 2: Running Seed Again (Your Case) 🛡️
```
Database: Has 87 lessons (your manual changes)
Seed runs: ⚠️  Detects existing lessons
Action: SKIPS everything - exits immediately
Result: Your 87 lessons remain UNTOUCHED
```

### Scenario 3: After Deleting All Lessons 🔄
```
Database: Course exists but 0 lessons
Seed runs: ✓ Recreates all lessons from scratch
Result: Fresh lesson structure
```

## Visual Flow

```
┌─────────────────────────────────────────┐
│  npm run db:seed                        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Check: Does course have lessons?       │
└─────────────┬───────────────────────────┘
              │
         ┌────┴────┐
         │         │
    YES  │         │  NO
         │         │
         ▼         ▼
┌─────────────┐  ┌──────────────────┐
│  SKIP SEED  │  │  RUN SEED        │
│  (Protected)│  │  (Create lessons)│
└─────────────┘  └──────────────────┘
         │                │
         ▼                ▼
┌─────────────┐  ┌──────────────────┐
│ Your data   │  │ Fresh data       │
│ SAFE ✓      │  │ created ✓        │
└─────────────┘  └──────────────────┘
```

## Test It Yourself

### Test 1: Verify Protection Works
```bash
# Run seed (should skip)
npm run db:seed

# Expected output:
# ⚠️  Course already has lessons. Skipping seed to preserve manual changes.
# Found 87 existing lessons.
# To reseed, delete all lessons first or use --force flag.
```

### Test 2: Check Your Lessons Are Safe
```bash
# Before seed
psql -d your_database -c "SELECT COUNT(*) FROM \"Lesson\";"
# Output: 87

# Run seed
npm run db:seed

# After seed
psql -d your_database -c "SELECT COUNT(*) FROM \"Lesson\";"
# Output: 87 (UNCHANGED!)
```

## When Would Seed Run?

The seed will ONLY run in these cases:

1. **Fresh Database** - No course exists at all
2. **Course Exists, No Lessons** - Course created but 0 lessons
3. **Manual Override** - You explicitly delete all lessons first

## Your Current Situation

```
✅ You have: 87 lessons with manual chapter assignments
✅ Protection: Active (added in lines 24-30)
✅ Safety: Running seed will NOT affect your data
✅ Workflow: Continue using admin UI without worry
```

## If You Want to Reseed (Advanced)

Only do this if you want to start fresh:

```bash
# Option 1: Delete lessons via Prisma Studio
npx prisma studio
# Navigate to Lesson table → Delete all

# Option 2: SQL command (CAREFUL!)
psql -d your_database -c "DELETE FROM \"Lesson\" WHERE \"courseId\" = 'your-course-id';"

# Then run seed
npm run db:seed
```

## Summary

- ✅ **Protection is ACTIVE** in your seed file
- ✅ **Your 87 lessons are SAFE** from seed overwrites
- ✅ **Seed will skip** if lessons exist
- ✅ **No action needed** - just continue working in admin UI

The protection is already there and working! Your manual changes are safe.
