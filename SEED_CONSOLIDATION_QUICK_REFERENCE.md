# Seed Data Consolidation - Quick Reference

## The Problem (In 30 Seconds)

Your test questions are in 3 places. If you deploy to a new server, only Army Command questions get seeded. ASI, Officer Cadet, and IQ tests will be empty.

```
Current Setup:
├── Army Command questions → packages/database/prisma/seeds/ ✓
├── ASI questions → apps/api/src/scripts/ ✗
├── Officer Cadet questions → apps/api/src/scripts/ ✗
└── IQ questions → apps/api/src/scripts/ ✗

New VPS or DB Clear:
npx prisma db seed
├── Army Command ✓ (seeded)
├── ASI ✗ (NOT seeded)
├── Officer Cadet ✗ (NOT seeded)
└── IQ ✗ (NOT seeded)
```

## The Solution (In 30 Seconds)

Move all questions to `packages/database/prisma/data/mock-tests/` as JSON files. Then `npx prisma db seed` handles everything automatically.

```
After Consolidation:
packages/database/prisma/data/mock-tests/
├── officer-cadet/
│   ├── set-1-gk.json
│   └── set-1-nepali.json
├── asi/
│   ├── set-1-gk.json
│   └── set-1-reasoning.json
└── iq/
    └── set-1.json

npx prisma db seed
├── Army Command ✓
├── ASI ✓
├── Officer Cadet ✓
└── IQ ✓
```

## Your 4 Questions Answered

| Question | Answer |
|----------|--------|
| What happens to ASI/Officer Cadet questions on new VPS? | They disappear (not seeded) |
| Can production show empty tests? | Yes, if only `npx prisma db seed` runs |
| Why consolidate before Set 2 & Set 3? | Avoid creating 6 separate scripts; just add JSON files |
| How to consolidate without losing data? | 3-phase migration: Export → Seed → Verify |

## 3-Phase Migration

### Phase 1: Prepare (1-2 hours)
1. Create export script → extracts questions to JSON
2. Create unified seed script → loads JSON and seeds DB
3. Integrate into main seed → `npx prisma db seed` calls it
4. Verify data integrity → counts match

### Phase 2: Deploy (1-2 hours)
1. Deploy to staging
2. Run `npx prisma db seed`
3. Verify all tests appear
4. Merge to main
5. Production auto-deploys

### Phase 3: Cleanup (30 minutes)
1. Delete old scripts
2. Update documentation
3. Done ✓

## File Locations

**Current (Fragmented)**:
- `apps/api/src/scripts/seed-officer-cadet-questions.ts`
- `apps/api/src/scripts/seed-asi-questions.ts`
- `apps/api/src/scripts/seed-cadet-iq-test.ts`
- `apps/api/src/scripts/seed-asi-mock-tests.ts`

**After Consolidation (Centralized)**:
- `packages/database/prisma/data/mock-tests/officer-cadet/set-1-gk.json`
- `packages/database/prisma/data/mock-tests/officer-cadet/set-1-nepali.json`
- `packages/database/prisma/data/mock-tests/asi/set-1-gk.json`
- `packages/database/prisma/data/mock-tests/asi/set-1-reasoning.json`
- `packages/database/prisma/data/mock-tests/iq/set-1.json`
- `packages/database/prisma/seeds/seed-mock-tests.ts` (NEW)

## Adding Set 2 & Set 3 (Future)

**Before Consolidation** (Complex):
```bash
# Create 3 new scripts
touch apps/api/src/scripts/seed-officer-cadet-questions-set-2.ts
touch apps/api/src/scripts/seed-asi-questions-set-2.ts
touch apps/api/src/scripts/seed-cadet-iq-test-set-2.ts
# Write code for each...
# Update CI/CD to call them...
```

**After Consolidation** (Simple):
```bash
# Just add JSON files
touch packages/database/prisma/data/mock-tests/officer-cadet/set-2-gk.json
touch packages/database/prisma/data/mock-tests/asi/set-2-gk.json
touch packages/database/prisma/data/mock-tests/iq/set-2.json
# Run seed
npx prisma db seed
# Done ✓
```

## Data Counts

**Current Database**:
- Officer Cadet GK: 60 questions
- Officer Cadet Nepali: 50 questions
- ASI GK: 25 questions
- ASI Reasoning: 25 questions
- IQ Test: 60 questions
- **Total: 220 questions**

**After Consolidation**:
- Same 220 questions (no loss)
- Just in different location (JSON files)
- Automatically seeded by `npx prisma db seed`

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data loss during migration | Low | High | Export first, verify counts |
| Seed script fails | Low | Medium | Test in staging first |
| CI/CD doesn't call new seed | Low | High | Integrate into main seed.ts |
| Production downtime | Very Low | High | Idempotent design, gradual rollout |

## Success Metrics

- ✅ All 220 questions exported to JSON
- ✅ Unified seed script works
- ✅ `npx prisma db seed` seeds all tests
- ✅ No data loss
- ✅ Staging verified
- ✅ Production deployed
- ✅ Ready for Set 2 & Set 3

## Next Steps

1. **Read full analysis**: `SEED_DATA_CONSOLIDATION_ANALYSIS.md`
2. **Review spec**: `.kiro/specs/seed-consolidation.md`
3. **Start Phase 1**: Create export script
4. **Test locally**: Verify JSON files
5. **Deploy to staging**: Test full cycle
6. **Production**: Merge and deploy

## Questions?

See `SEED_DATA_CONSOLIDATION_ANALYSIS.md` for detailed answers to:
- What happens to ASI/Officer Cadet questions on new VPS?
- Can production show empty tests?
- Why consolidate before Set 2 & Set 3?
- How to consolidate without losing data?
