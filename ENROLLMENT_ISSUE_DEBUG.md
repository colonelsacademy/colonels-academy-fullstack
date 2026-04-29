# 🔍 "Enroll Now" Showing for Purchased Course - Debug Guide

## The Issue

You purchased the Staff College course, but it's still showing "Enroll Now" instead of "Continue Learning".

## Possible Causes

### 1. **Purchase Completed But Enrollment Not Created**
- Payment succeeded
- But enrollment record wasn't created in database

### 2. **Enrollment Status is Not "ACTIVE"**
- Enrollment exists but status is PENDING, EXPIRED, or REFUNDED

### 3. **Course Slug Mismatch**
- Purchase uses one slug
- Enrollment check uses different slug

---

## Quick Diagnostic Steps

### Step 1: Check Enrollments in Prisma Studio

```bash
# Open Prisma Studio
npm run db:studio
```

1. Go to `http://localhost:5555`
2. Click on **"Enrollment"** table
3. Look for your user's enrollments
4. Check:
   - ✅ Does enrollment exist for Staff College course?
   - ✅ Is `status` = "ACTIVE"?
   - ✅ Does `courseId` match the course ID?

### Step 2: Check Purchase Orders

1. In Prisma Studio, click **"PurchaseOrder"** table
2. Find your recent purchase
3. Check `status` - should be "PAID"
4. Click on **"PurchaseOrderItem"** to see what was purchased

### Step 3: Check Course Slug

1. In Prisma Studio, click **"Course"** table
2. Find "Staff College Command" course
3. Note the `slug` value (e.g., "staff-college-command")
4. Verify this matches what's in the URL

---

## Common Fixes

### Fix 1: Create Missing Enrollment

If purchase exists but enrollment doesn't:

```sql
-- Run in Prisma Studio or database
INSERT INTO "Enrollment" (
  "id",
  "userId",
  "courseId",
  "status",
  "progressPercent",
  "purchasedAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),  -- or use cuid()
  'YOUR_USER_ID',     -- Get from User table
  'YOUR_COURSE_ID',   -- Get from Course table
  'ACTIVE',
  0,
  NOW(),
  NOW(),
  NOW()
);
```

### Fix 2: Update Enrollment Status

If enrollment exists but status is wrong:

```sql
-- Run in Prisma Studio
UPDATE "Enrollment"
SET "status" = 'ACTIVE'
WHERE "userId" = 'YOUR_USER_ID'
  AND "courseId" = 'YOUR_COURSE_ID';
```

### Fix 3: Clear Browser Cache

Sometimes the enrollment check is cached:

1. Open DevTools (F12)
2. Go to Application tab
3. Clear Site Data
4. Refresh page

---

## Automated Fix Script

I can create a script to automatically sync purchases with enrollments:

```typescript
// packages/database/scripts/sync-enrollments.ts
// This would:
// 1. Find all PAID orders
// 2. Check if enrollments exist
// 3. Create missing enrollments
// 4. Set status to ACTIVE
```

Would you like me to create this script?

---

## Prevention

To prevent this in the future, ensure the payment webhook/callback:

1. ✅ Creates enrollment when payment succeeds
2. ✅ Sets enrollment status to ACTIVE
3. ✅ Links enrollment to correct course
4. ✅ Handles errors gracefully

---

## Quick Test

To verify the component is working:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Run this:**
   ```javascript
   fetch('/api/learning/enrollments', { credentials: 'include' })
     .then(r => r.json())
     .then(d => console.log('Enrollments:', d))
   ```
4. **Check output:**
   - Should show your enrollments
   - Look for Staff College course slug

---

## What to Check Right Now

1. **Open Prisma Studio**: `npm run db:studio`
2. **Check Enrollment table**: Is there an enrollment for your user + Staff College?
3. **Check status**: Is it "ACTIVE"?
4. **If missing**: Use Fix 1 above to create it
5. **If wrong status**: Use Fix 2 above to fix it
6. **Refresh page**: Should now show "Continue Learning"

---

## Need Help?

Share these details:
- User ID (from User table)
- Course ID for Staff College (from Course table)
- Enrollment status (if exists)
- Purchase order status

I can then provide the exact SQL to fix it!
