# Quick Start Guide for Next Developer

## What Just Happened?

The IQ test "0 questions" bug was fixed. When users clicked "5 Free Questions", they were seeing "0 questions available" instead of the 5 free preview questions.

**Fix Location**: `apps/web/src/app/mocktest/MockTest.tsx`

**What Changed**: 
- Phase transition now happens AFTER questions are loaded from API
- Main init useEffect skips processing for preview mode

---

## How to Test the Fix

### 1. Start the Application
```bash
cd c:\ca
pnpm dev
```

### 2. Test the IQ Preview
1. Go to http://localhost:3000
2. Scroll to "Elite Practical Tests" section
3. Click "5 Free Questions" on the IQ test card
4. Should see intro page with "60 Questions" displayed
5. Click "Start" to begin the test
6. Should see questions loading

### 3. Test All Bundles
- Officer Cadet: Click "5 Free Questions" → Should show questions
- ASI: Click "5 Free Questions" → Should show questions
- IQ: Click "5 Free Questions" → Should show questions

### 4. Test Purchase Flow
1. Click "Buy" on any bundle
2. Complete the 2-step purchase
3. Should see "Continue" button instead of "Buy"
4. Click "Continue" → Should go to test selection

---

## Key Files to Know

### Frontend
- `apps/web/src/app/mocktest/MockTest.tsx` - Main test component (JUST FIXED)
- `apps/web/src/app/gateway/components/ElitePracticalTests.tsx` - Bundle cards
- `apps/web/src/app/api/mock-test-bundles/` - API proxy routes

### Backend
- `apps/api/src/modules/mock-tests/bundle-routes.ts` - Bundle API endpoints
- `apps/api/src/scripts/seed-cadet-iq-test.ts` - IQ test seed script

### Database
- `packages/database/prisma/schema.prisma` - Database schema

---

## Common Tasks

### Seed the Database
```bash
# Seed all bundles and tests
pnpm --filter @colonels-academy/api run seed:mock-test-bundles
pnpm --filter @colonels-academy/api run seed:cadet-iq-test
pnpm --filter @colonels-academy/api run seed:asi-mock-tests
pnpm --filter @colonels-academy/api run seed:asi-questions
pnpm --filter @colonels-academy/api run seed:officer-cadet-questions
```

### Check Database
```bash
# Open Prisma Studio
pnpm --filter @colonels-academy/database exec prisma studio
```

### Test API Endpoints
```bash
# Get all bundles
curl "http://localhost:4000/v1/mock-test-bundles" \
  -H "Authorization: Bearer test"

# Get IQ bundle questions
curl "http://localhost:4000/v1/mock-test-bundles/cmp2gzup70000ltas520xh5uj/questions" \
  -H "Authorization: Bearer test"
```

---

## Understanding the Fix

### Before (Broken)
```
1. User clicks "5 Free Questions"
2. Routes to /mocktest?preview=<bundleId>
3. Component starts fetching questions (async)
4. Main init useEffect immediately sets phase: "intro"
5. Component renders with empty questions array
6. Shows "0 questions available"
```

### After (Fixed)
```
1. User clicks "5 Free Questions"
2. Routes to /mocktest?preview=<bundleId>
3. Component starts fetching questions (async)
4. Questions finish loading
5. THEN sets phase: "intro"
6. Component renders with questions array populated
7. Shows "60 Questions" and intro page
```

---

## Troubleshooting

### Issue: Still seeing "0 questions"
- Clear browser cache
- Restart dev server
- Check browser console for errors
- Verify API is returning questions: `curl http://localhost:4000/v1/mock-test-bundles/<bundleId>/questions`

### Issue: Images not loading
- Check Bunny CDN URL in database: `SELECT imageUrl FROM "MockTestQuestion" WHERE imageUrl IS NOT NULL;`
- Verify images exist on CDN
- Check browser network tab for 404 errors

### Issue: Purchase not working
- Check user is authenticated
- Verify bundle exists in database
- Check API logs for errors
- Verify payment status in database

---

## Next Steps

### Immediate
1. ✅ Test the fix in browser
2. ✅ Verify all 3 bundles work
3. ✅ Verify images load correctly

### Short Term
1. Add multiple IQ test sets
2. Implement real payment integration
3. Add question explanations

### Long Term
1. Add analytics dashboard
2. Implement offline mode
3. Add more question types

---

## Important Notes

### Bundle IDs
- Database IDs: `cmp0w3uad0000ltcgvc167zxa` (Officer Cadet), `cmp0w3ubs0001ltcgxx2otvci` (ASI), `cmp2gzup70000ltas520xh5uj` (IQ)
- Hardcoded IDs: `bundle-1` (Officer Cadet), `bundle-2` (ASI), `cadet-iq` (IQ)
- Backend supports both types

### Free Preview
- First 5 questions are free for all bundles
- Questions 6-60 are locked until purchase
- Purchase gate modal appears when trying to access locked questions

### Image Questions
- 11 out of 60 IQ questions have images
- Images stored on Bunny CDN
- URLs set in database: `imageUrl` field

---

## Documentation Files

- `CONTEXT_DUMP.md` - Complete project architecture
- `CURRENT_STATUS.md` - Current feature status
- `FIX_VERIFICATION.md` - Details about the fix
- `IQ_TEST_FIX_SUMMARY.md` - Summary of the fix

---

## Questions?

1. Check the documentation files above
2. Review the code comments in MockTest.tsx
3. Check the database schema in schema.prisma
4. Review the API routes in bundle-routes.ts

---

**Last Updated**: May 15, 2026  
**Status**: Ready for Testing
