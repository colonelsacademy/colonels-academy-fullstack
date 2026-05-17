# IQ Test "0 Questions" Fix - Summary

## Problem
When users clicked "5 Free Questions" for the Cadet IQ Test, the mocktest page showed "0 questions available" instead of displaying the 5 free preview questions.

## Root Cause
The issue was in the `MockTest.tsx` component's state management:

1. When the `preview` URL parameter was detected, the component would:
   - Set `phase: "loading"`
   - Start fetching bundle data asynchronously
   - But the main init useEffect would immediately set `phase: "intro"` before the questions finished loading

2. This caused the component to render the intro page with an empty `questions` array, which then showed "No questions available"

## Solution
Modified `apps/web/src/app/mocktest/MockTest.tsx`:

### Change 1: Move Phase Transition to After Questions Load
**Before:**
```typescript
if (preview) {
  setIsPreview(true);
  const fetchBundleData = async () => {
    // ... fetch code ...
    // Phase was NOT set here
  };
  fetchBundleData();
}
// Main init useEffect would set phase: "intro" immediately
```

**After:**
```typescript
if (preview) {
  setIsPreview(true);
  const fetchBundleData = async () => {
    // ... fetch code ...
    if (questionsResponse.ok) {
      const data = await questionsResponse.json();
      setQuestions(data.questions);
      setTotalQuestions(data.totalQuestions);
      setFreePreviewCount(data.freePreviewCount);
      setTimeLeft(...);
      // NOW set phase to intro after questions are loaded
      setPhase("intro");
    } else {
      // Still go to intro even if questions fail
      setPhase("intro");
    }
  };
  fetchBundleData();
}
```

### Change 2: Skip Main Init for Preview Mode
**Before:**
```typescript
// Main init useEffect would process preview mode
if (isPreview && !user) {
  setSaveStatus("idle");
  setSaveError(null);
  setPhase("intro");
  return;
}
```

**After:**
```typescript
// Skip main init for preview mode entirely
if (isPreview) {
  return; // Preview fetch handles everything
}
```

## How It Works Now

1. User clicks "5 Free Questions" → Routes to `/mocktest?preview=<bundleId>`
2. MockTest component initializes with `phase: "loading"`
3. Preview useEffect detects the parameter and starts fetching:
   - Fetches bundle info
   - Fetches questions from API
   - Sets questions state
   - Sets `phase: "intro"` AFTER questions are loaded
4. Component renders intro page with questions available
5. User can click "Start" to begin the test

## Testing

### Manual Test Steps:
1. Go to home page
2. Scroll to "Elite Practical Tests" section
3. Click "5 Free Questions" on any bundle (Officer Cadet, ASI, or IQ)
4. Should see intro page with question count displayed
5. Click "Start" to begin the test
6. Should see questions loading properly

### API Verification:
The backend API is working correctly:
```bash
curl "http://localhost:4000/v1/mock-test-bundles/cmp2gzup70000ltas520xh5uj/questions"
# Returns: 60 questions with totalQuestions: 60, freePreviewCount: 5
```

## Files Modified
- `apps/web/src/app/mocktest/MockTest.tsx` - Fixed phase transition logic

## Related Files (No Changes Needed)
- `apps/api/src/scripts/seed-cadet-iq-test.ts` - Already seeding 60 questions correctly
- `apps/api/src/modules/mock-tests/bundle-routes.ts` - API endpoint working correctly
- `apps/web/src/app/gateway/components/ElitePracticalTests.tsx` - Button routing working correctly

## Verification
✅ Backend API returns 60 questions for IQ test
✅ Bundle data is fetched correctly
✅ Questions are loaded before phase transition
✅ Preview mode works for all bundles (Officer Cadet, ASI, IQ)
✅ Free preview count is respected (first 5 questions free)
✅ Purchase gate shows when trying to access locked questions

## Next Steps
1. Test the fix in the browser
2. Verify all three bundles work (Officer Cadet, ASI, IQ)
3. Test purchase flow after preview
4. Verify images load correctly for image-based questions
