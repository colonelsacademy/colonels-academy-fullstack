# 🚀 Deployment Checklist - Railway

## Pre-Deployment Checklist ✅

### 1. Code Review & Testing
- [ ] All tests passing locally
- [ ] No console errors in browser
- [ ] Mobile responsive design tested
- [ ] All new features working as expected
- [ ] Database migrations tested locally

### 2. Environment Variables Check
- [ ] All required env vars documented
- [ ] No sensitive data in code
- [ ] `.env.example` updated with new variables
- [ ] Railway environment variables configured

### 3. Database Preparation
- [ ] Migration files created and tested
- [ ] Seed scripts ready (but not auto-run)
- [ ] Backup plan in place
- [ ] Rollback strategy documented

---

## Railway Deployment Process 🚂

### Step 1: Merge to Main/Dev Branch

```bash
# 1. Ensure you're on your feature branch
git checkout sushant_feature

# 2. Pull latest changes from main
git checkout main
git pull origin main

# 3. Merge your feature branch
git checkout main
git merge sushant_feature

# 4. Push to trigger Railway deployment
git push origin main
```

**What happens automatically:**
- ✅ Railway detects the push
- ✅ Builds the application
- ✅ Runs database migrations (`prisma migrate deploy`)
- ✅ Deploys the new version
- ✅ Zero-downtime deployment

---

## Post-Deployment Steps (CRITICAL) ⚠️

### Step 2: Verify Deployment

**2.1 Check Railway Dashboard**
1. Go to [Railway Dashboard](https://railway.app)
2. Select your project: `colonels-academy-fullstack`
3. Check deployment status:
   - ✅ Build successful
   - ✅ Deploy successful
   - ✅ No errors in logs

**2.2 Check Application Health**
```bash
# Visit your production URL
https://your-app.railway.app

# Check these pages:
- Homepage loads ✅
- Login works ✅
- Admin panel accessible ✅
- API responding ✅
```

**2.3 Check Database Migrations**
```bash
# In Railway dashboard, open database service
# Click "Connect" → "Postgres CLI"

# Or use Railway CLI:
railway run psql $DATABASE_URL

# Verify migrations ran:
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;

# Should see:
# - 20260418091807_add_chapter_based_purchase_system
```

---

### Step 3: Run Seed Script (ONE-TIME ONLY)

**⚠️ IMPORTANT: Only run this ONCE after deploying the new schema**

**Option A: Using Railway CLI (Recommended)**
```bash
# 1. Install Railway CLI (if not installed)
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link to your project
railway link

# 4. Run seed command
railway run npm run seed

# Or specifically for database package:
railway run --service database npm run seed
```

**Option B: Using Railway Dashboard**
```bash
# 1. Go to Railway Dashboard
# 2. Select your project
# 3. Click on "database" service
# 4. Go to "Settings" → "Deploy"
# 5. Add custom start command (temporary):
#    npm run seed
# 6. Trigger manual deploy
# 7. IMPORTANT: Remove custom command after seeding
```

**Option C: Using Database Connection**
```bash
# 1. Get database URL from Railway
railway variables

# 2. Run seed locally against production DB
DATABASE_URL="postgresql://..." npm run seed

# ⚠️ BE CAREFUL: This runs against production!
```

---

### Step 4: Verify Army Command & Staff Course 2083

**4.1 Check Course Exists**
```sql
-- In Railway Postgres CLI
SELECT id, slug, title, "lessonCount" 
FROM "Course" 
WHERE slug = 'army-command-staff-2083';

-- Should return:
-- id | slug | title | lessonCount
-- ... | army-command-staff-2083 | Army Command & Staff Course... | 89
```

**4.2 Check Modules Created**
```sql
SELECT id, title, "chapterNumber", "chapterPrice", "isFreeIntro"
FROM "Module"
WHERE "courseId" = (
  SELECT id FROM "Course" WHERE slug = 'army-command-staff-2083'
)
ORDER BY position;

-- Should return 6 modules:
-- Module 0: Introduction (free)
-- Module 1-5: Paid chapters
```

**4.3 Check Bundle Offers**
```sql
SELECT id, "bundleType", title, "bundlePrice", "originalPrice"
FROM "CourseBundleOffer"
WHERE "courseId" = (
  SELECT id FROM "Course" WHERE slug = 'army-command-staff-2083'
);

-- Should return 2 bundles:
-- STANDARD: NPR 18,000
-- PREMIUM: NPR 25,000
```

**4.4 Check Lessons Created**
```sql
SELECT COUNT(*) as total_lessons
FROM "Lesson"
WHERE "courseId" = (
  SELECT id FROM "Course" WHERE slug = 'army-command-staff-2083'
);

-- Should return: 89 lessons
```

---

### Step 5: Test User Flows

**5.1 Test Free Introduction Access**
- [ ] Visit course page
- [ ] Free introduction module visible
- [ ] Can access introduction lessons without purchase
- [ ] Introduction lessons play correctly

**5.2 Test Chapter Purchase Flow**
- [ ] Chapter 1 shows "Purchase" button
- [ ] Price displayed correctly (NPR 5,000)
- [ ] Chapters 2-5 are locked
- [ ] Bundle offers visible

**5.3 Test Bundle Purchase Flow**
- [ ] Standard Bundle shows NPR 18,000
- [ ] Premium Bundle shows NPR 25,000
- [ ] Feature comparison table displays correctly
- [ ] "Save NPR X" badges visible

**5.4 Test Sequential Progression**
- [ ] Lesson 1 is unlocked
- [ ] Lesson 2 is locked until Lesson 1 complete
- [ ] Chapter 2 locked until Chapter 1 complete
- [ ] Lock icons display correctly

---

## Rollback Plan 🔄

### If Something Goes Wrong

**Option 1: Rollback Deployment**
```bash
# In Railway Dashboard:
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "Redeploy"
```

**Option 2: Rollback Database Migration**
```bash
# ⚠️ DANGEROUS - Only if absolutely necessary

# 1. Connect to Railway database
railway run psql $DATABASE_URL

# 2. Check migration history
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;

# 3. Manually rollback (if needed)
# This requires custom SQL - contact dev team
```

**Option 3: Hotfix**
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Make minimal fix
# ... fix code ...

# 3. Push directly to main
git push origin hotfix/critical-fix

# 4. Railway auto-deploys
```

---

## Monitoring & Verification 📊

### Check These After Deployment

**1. Application Logs**
```bash
# Using Railway CLI
railway logs

# Or in Railway Dashboard:
# Project → Service → Logs tab
```

**2. Error Tracking**
- [ ] Check for 500 errors
- [ ] Check for database connection errors
- [ ] Check for missing environment variables
- [ ] Check for API failures

**3. Performance Metrics**
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance
- [ ] No memory leaks

**4. User Reports**
- [ ] Monitor user feedback
- [ ] Check support tickets
- [ ] Review error reports
- [ ] Test critical user flows

---

## Environment Variables Checklist 🔐

### Required for Army Command & Staff Course 2083

**Existing Variables (Should already be set):**
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
BUNNY_STREAM_LIBRARY_ID=...
BUNNY_STORAGE_API_KEY=...
```

**New Variables (If needed):**
```bash
# Optional: Control seeding
SEED_ARMY_COURSE=false  # Set to 'true' only when seeding

# Optional: Feature flags
ENABLE_CHAPTER_PURCHASE=true
ENABLE_BUNDLE_OFFERS=true
```

---

## Common Issues & Solutions 🔧

### Issue 1: Migration Failed
**Symptoms:** Deployment succeeds but app crashes
**Solution:**
```bash
# Check migration status
railway run npx prisma migrate status

# If needed, manually run migrations
railway run npx prisma migrate deploy
```

### Issue 2: Seed Script Not Run
**Symptoms:** Course doesn't appear in production
**Solution:**
```bash
# Run seed manually (see Step 3 above)
railway run npm run seed
```

### Issue 3: Environment Variables Missing
**Symptoms:** App crashes with "env variable not found"
**Solution:**
```bash
# Check all variables are set
railway variables

# Add missing variables in Railway Dashboard
# Settings → Variables → Add Variable
```

### Issue 4: Database Connection Issues
**Symptoms:** "Can't connect to database"
**Solution:**
```bash
# Verify DATABASE_URL is correct
railway variables | grep DATABASE_URL

# Test connection
railway run npx prisma db pull
```

### Issue 5: Old Course Data Conflicts
**Symptoms:** Duplicate courses or data inconsistencies
**Solution:**
```bash
# Seed script uses upsert, so it's safe to re-run
railway run npm run seed

# If still issues, check for duplicate slugs
railway run psql $DATABASE_URL
SELECT slug, COUNT(*) FROM "Course" GROUP BY slug HAVING COUNT(*) > 1;
```

---

## Post-Deployment Communication 📢

### Notify Team

**Send to Team:**
```
✅ Deployment Complete: Army Command & Staff Course 2083

🚀 What's New:
- New course: Army Command & Staff Course 2083
- Chapter-based purchase system
- Bundle offers (Standard & Premium)
- Free introduction module
- Sequential lesson progression

📊 Stats:
- 89 total lessons
- 6 modules (1 free + 5 paid)
- 2 bundle offers

🔗 Links:
- Production: https://your-app.railway.app
- Course Page: https://your-app.railway.app/courses/army-command-staff-2083

⚠️ Action Required:
- Test the new course
- Verify purchase flows
- Check bundle offers display

🐛 Report Issues:
- Slack: #tech-support
- Email: dev@colonelsacademy.com
```

---

## Success Criteria ✅

### Deployment is Successful When:

- [x] Railway deployment shows "Success"
- [x] No errors in application logs
- [x] Database migrations completed
- [x] Seed script executed successfully
- [x] Course visible on homepage
- [x] Free introduction accessible
- [x] Chapter purchase buttons working
- [x] Bundle offers displaying correctly
- [x] Sequential progression working
- [x] All tests passing
- [x] No user-reported issues

---

## Quick Reference Commands 📝

```bash
# Deploy to Railway
git push origin main

# Check deployment status
railway status

# View logs
railway logs

# Run seed
railway run npm run seed

# Connect to database
railway run psql $DATABASE_URL

# Check environment variables
railway variables

# Rollback deployment
# (Use Railway Dashboard → Deployments → Redeploy previous)
```

---

## Support & Resources 📚

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [Prisma on Railway](https://docs.railway.app/guides/prisma)
- [Environment Variables](https://docs.railway.app/develop/variables)

### Internal Resources
- Deployment Guide: `DEPLOYMENT_CHECKLIST.md` (this file)
- Requirements: `.kiro/specs/army-command-staff-2083/requirements.md`
- Database Schema: `packages/database/prisma/schema.prisma`
- Seed Script: `packages/database/prisma/seeds/army-command-staff-2083-curriculum.ts`

### Emergency Contacts
- DevOps Lead: [Your Name]
- Database Admin: [DBA Name]
- Product Owner: [PO Name]

---

## Notes 📝

### Deployment History
- **Date**: [Fill in deployment date]
- **Deployed By**: [Your name]
- **Branch**: sushant_feature → main
- **Migration**: 20260418091807_add_chapter_based_purchase_system
- **Seed Status**: [Completed / Pending]
- **Issues**: [None / List any issues]

### Next Deployment
- [ ] Plan next feature deployment
- [ ] Review this checklist
- [ ] Update as needed

---

**Remember**: Railway handles most of the deployment automatically. Your main tasks are:
1. ✅ Push code to main branch
2. ✅ Verify deployment succeeded
3. ✅ Run seed script (one-time)
4. ✅ Test the new features

**Good luck with your deployment! 🚀**
