# 🎯 Solution: Hide Courses Instead of Deleting

## The Problem

When you **delete** courses to hide them from users:
- ❌ Seed recreates them (because they don't exist)
- ❌ You lose all course data
- ❌ Enrollments and purchases are affected

## The Professional Solution

Add an **"isHidden"** field to hide courses without deleting them.

---

## Step 1: Database Schema Update ✅ (Already Done)

I've added the `isHidden` field to your schema:

```prisma
model Course {
  // ... other fields
  isFeatured           Boolean  @default(false)
  isComingSoon         Boolean  @default(false)
  isHidden             Boolean  @default(false) // ← NEW FIELD
  // ... other fields
}
```

---

## Step 2: Apply Database Changes

### Option A: Using Prisma Push (Recommended for Dev)

```bash
# Make sure your database is running
npm run db:up

# Push the schema change
npm run db:push
```

### Option B: Using Migration (Recommended for Production)

```bash
# Create migration
npm run db:migrate

# When prompted, name it: "add_is_hidden_to_course"
```

---

## Step 3: Update Admin UI

### Add "Hidden" Toggle to Course Form

The admin form already has checkboxes for "Featured" and "Coming Soon". 
I'll add a "Hidden" checkbox next to them.

### Update Course List to Show Hidden Status

Courses will show a badge if they're hidden.

---

## Step 4: Filter Hidden Courses on Public Pages

Update the public course listing to exclude hidden courses.

---

## How It Works

### Admin Panel (You See Everything)
```
✓ Army Command & Staff Course
✓ Mission English Ops [HIDDEN] ← You can see it
✓ Staff College Command [HIDDEN] ← You can see it
```

### Public Page (Users Don't See Hidden)
```
✓ Army Command & Staff Course
(Mission English and Staff College are hidden)
```

### Benefits

✅ **No Data Loss** - Course stays in database
✅ **Seed-Safe** - Seed won't recreate it
✅ **Reversible** - Unhide anytime with one click
✅ **Preserves History** - Enrollments, purchases intact
✅ **Professional** - Industry standard approach

---

## Quick Fix for Your Current Situation

### Immediate Solution (Manual)

1. **Don't delete courses** - They'll keep coming back
2. **Wait for me to add the Hidden feature** (next step)
3. **Then mark them as Hidden** instead

### Temporary Workaround

If you need to hide them RIGHT NOW before I add the UI:

```sql
-- Run this in Prisma Studio or your database
UPDATE "Course" 
SET "isHidden" = true 
WHERE slug IN ('mission-english-ops', 'staff-college-command');
```

---

## What I'll Do Next

1. ✅ Add `isHidden` field to schema (DONE)
2. ⏳ Apply database migration
3. ⏳ Add "Hidden" checkbox to admin form
4. ⏳ Update public pages to filter hidden courses
5. ⏳ Add visual indicator in admin for hidden courses

---

## Alternative: Modify Seed to Skip Specific Courses

If you prefer, I can also modify the seed to skip certain courses:

```typescript
// In seed file
const SKIP_COURSES = ['mission-english-ops', 'staff-college-command'];

if (SKIP_COURSES.includes(courseSlug)) {
  console.log(`⏭️  Skipping ${courseSlug} (in skip list)`);
  return;
}
```

But the **Hidden field is the better solution** because:
- More flexible (toggle in UI)
- No code changes needed
- Industry standard
- Reversible instantly

---

## Summary

**Current Issue:**
- You deleted courses → Seed recreates them

**Solution:**
- Add `isHidden` field
- Mark courses as hidden instead of deleting
- Filter hidden courses on public pages
- Keep them visible in admin

**Next Steps:**
1. Run `npm run db:push` to apply schema change
2. I'll update the admin UI to add Hidden toggle
3. Mark unwanted courses as Hidden
4. They'll stay in database but won't show to users

Would you like me to proceed with adding the Hidden feature to the admin UI?
