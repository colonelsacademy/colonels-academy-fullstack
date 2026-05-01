# QUICK ACTION PLAN - The Colonel's Academy
## Evidence-Based Production Readiness Roadmap

**Created:** April 29, 2026  
**Based On:** Principal Architect Audit (Evidence-Based)  
**Timeline:** 5-7 weeks to production

---

## 🚨 WEEK 1: CRITICAL BLOCKERS (5 days)

### Day 1: Fix Enrollment Bug ✅
**File:** `packages/database/scripts/fix-enrollment-atomicity.ts`

```bash
# Run the fix script
pnpm --filter @colonels-academy/database exec tsx scripts/fix-enrollment-atomicity.ts

# Verify fix
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Enrollment\" WHERE status = 'ACTIVE';"
```

**Expected Output:** All paid orders should have corresponding enrollments

---

### Day 1: Remove Console.log (1 hour) ✅
**Files to fix:**
1. `apps/web/src/app/admin/page.tsx` (line ~650)
2. `apps/web/src/app/api/auth/session-login/route.ts`

**Find & Replace:**
```typescript
// BEFORE
console.log("BunnyVideoPicker onChange called:", { id, title, duration });

// AFTER
if (process.env.NODE_ENV === 'development') {
  console.log("BunnyVideoPicker onChange called:", { id, title, duration });
}
```

**Verification:**
```bash
# Search for remaining console.log
grep -r "console.log" apps/web/src --exclude-dir=node_modules
```

---

### Day 2: Set Up Sentry Error Monitoring ✅

**Install:**
```bash
pnpm add @sentry/nextjs @sentry/node
```

**Configure:**

1. **Frontend** (`apps/web/sentry.client.config.ts`):
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

2. **Backend** (`apps/api/src/plugins/sentry.ts`):
```typescript
import * as Sentry from "@sentry/node";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });

  fastify.addHook("onError", async (request, reply, error) => {
    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      },
    });
  });
});
```

3. **Environment Variables:**
```bash
# .env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Verification:**
```bash
# Trigger test error
curl -X POST http://localhost:3001/api/test-error

# Check Sentry dashboard
```

---

### Day 3: Configure Database Backups ✅

**Option 1: Railway Automatic Backups**
1. Go to Railway dashboard
2. Select PostgreSQL service
3. Enable automatic backups (daily)
4. Set retention period (7 days minimum)

**Option 2: Manual Backup Script**
```bash
# Create backup script
mkdir -p scripts
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3 or Railway storage
aws s3 cp ${BACKUP_FILE}.gz s3://colonels-academy-backups/

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x scripts/backup-db.sh
```

**Automated Daily Backups** (`.github/workflows/backup.yml`):
```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup Database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
          gzip backup-*.sql
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 cp backup-*.sql.gz s3://colonels-academy-backups/
```

**Verification:**
```bash
# Test backup
./scripts/backup-db.sh

# Test restore
gunzip backup_20260429_120000.sql.gz
psql $DATABASE_URL_TEST < backup_20260429_120000.sql
```

---

### Day 4-5: Write Critical Tests ✅

**Install Testing Framework:**
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Configure Vitest** (`apps/api/vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Test 1: Payment Flow** (`apps/api/src/modules/orders/routes.test.ts`):
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../app';

describe('Orders API', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create order and enrollment atomically', async () => {
    // 1. Create order
    const orderRes = await app.inject({
      method: 'POST',
      url: '/v1/orders',
      headers: { authorization: 'Bearer test-token' },
      payload: {
        items: [{ courseSlug: 'army-officer' }],
        provider: 'mock',
      },
    });

    expect(orderRes.statusCode).toBe(200);
    const order = JSON.parse(orderRes.body);

    // 2. Confirm order
    const confirmRes = await app.inject({
      method: 'POST',
      url: `/v1/orders/${order.orderId}/confirm`,
      headers: { authorization: 'Bearer test-token' },
    });

    expect(confirmRes.statusCode).toBe(200);

    // 3. Verify enrollment created
    const enrollmentRes = await app.inject({
      method: 'GET',
      url: '/v1/learning/enrollments',
      headers: { authorization: 'Bearer test-token' },
    });

    const enrollments = JSON.parse(enrollmentRes.body);
    expect(enrollments.items).toHaveLength(1);
    expect(enrollments.items[0].courseSlug).toBe('army-officer');
  });
});
```

**Test 2: Authentication** (`apps/api/src/plugins/auth.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { buildApp } from '../app';

describe('Authentication', () => {
  it('should reject requests without token', async () => {
    const app = await buildApp();
    
    const res = await app.inject({
      method: 'GET',
      url: '/v1/learning/enrollments',
    });

    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it('should accept valid session cookie', async () => {
    const app = await buildApp();
    
    // Create session
    const loginRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/session-login',
      headers: { 'x-csrf-token': 'test-token' },
      cookies: { 'csrf-token': 'test-token' },
      payload: { idToken: 'valid-firebase-token' },
    });

    const cookies = loginRes.cookies;
    
    // Use session
    const res = await app.inject({
      method: 'GET',
      url: '/v1/learning/enrollments',
      cookies,
    });

    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
```

**Run Tests:**
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run in watch mode
pnpm test --watch
```

**Target Coverage:** 60% minimum for critical paths

---

## 📊 WEEK 2: INPUT VALIDATION (5 days)

### Add Zod Schemas for All Endpoints

**Install:**
```bash
pnpm add zod
```

**Create Schemas** (`apps/api/src/schemas/orders.ts`):
```typescript
import { z } from 'zod';

export const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      courseSlug: z.string().min(1),
    })
  ).min(1, "At least one item required"),
  provider: z.enum(['esewa', 'khalti', 'mock']),
});

export const ConfirmOrderSchema = z.object({
  orderId: z.string().cuid(),
});

export const CreateChapterPurchaseSchema = z.object({
  moduleId: z.string().cuid(),
  paymentMethod: z.enum(['ESEWA', 'KHALTI']),
});
```

**Use in Routes** (`apps/api/src/modules/orders/routes.ts`):
```typescript
import { CreateOrderSchema } from '../../schemas/orders';

fastify.post("/", async (request, reply) => {
  // Validate input
  const body = CreateOrderSchema.parse(request.body);
  
  // ... rest of logic
});
```

**Add Validation Plugin** (`apps/api/src/plugins/validation.ts`):
```typescript
import fp from 'fastify-plugin';
import { ZodError } from 'zod';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    
    throw error;
  });
});
```

**Files to Update:**
- `apps/api/src/modules/orders/routes.ts`
- `apps/api/src/modules/learning/routes.ts`
- `apps/api/src/modules/auth/routes.ts`
- `apps/api/src/modules/admin/routes.ts`

---

## 🔒 WEEK 3: SECURITY HARDENING (5 days)

### Day 1-2: Audit Logging

**Create Audit Log Table** (`packages/database/prisma/schema.prisma`):
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "USER_ROLE_CHANGED", "COURSE_CREATED", etc.
  resource  String   // "User:abc123", "Course:army-officer"
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([resource])
}
```

**Audit Middleware** (`apps/api/src/plugins/audit.ts`):
```typescript
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.decorate('auditLog', async (action: string, resource: string, metadata?: any) => {
    const request = fastify.request;
    const authUser = request.authUser;
    
    if (!authUser) return;
    
    await fastify.prisma.auditLog.create({
      data: {
        userId: authUser.uid,
        action,
        resource,
        metadata,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  });
});
```

**Use in Admin Routes:**
```typescript
// apps/api/src/modules/admin/routes.ts
fastify.patch("/users/:id/role", async (request, reply) => {
  const updated = await fastify.prisma.user.update({
    where: { id: request.params.id },
    data: { role: newRole },
  });

  // Audit log
  await fastify.auditLog('USER_ROLE_CHANGED', `User:${updated.id}`, {
    oldRole: 'STUDENT',
    newRole: updated.role,
  });

  return updated;
});
```

---

### Day 3: Payment Webhook Verification

**eSewa Webhook** (`apps/api/src/modules/webhooks/esewa.ts`):
```typescript
import crypto from 'crypto';

function verifyEsewaSignature(payload: any, signature: string): boolean {
  const secret = process.env.ESEWA_SECRET_KEY;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}

fastify.post("/webhooks/esewa", async (request, reply) => {
  const signature = request.headers['x-esewa-signature'] as string;
  
  if (!verifyEsewaSignature(request.body, signature)) {
    return reply.forbidden("Invalid webhook signature");
  }
  
  // Process payment...
});
```

---

### Day 4-5: Per-Endpoint Rate Limiting

**Update Rate Limits** (`apps/api/src/app.ts`):
```typescript
// Global rate limit (keep existing)
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
});

// Auth endpoints - stricter limits
app.register(async (authRoutes) => {
  authRoutes.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute"
  });
  
  authRoutes.post("/session-login", loginHandler);
  authRoutes.post("/session-logout", logoutHandler);
});

// Admin endpoints - very strict
app.register(async (adminRoutes) => {
  adminRoutes.register(rateLimit, {
    max: 30,
    timeWindow: "1 minute"
  });
  
  adminRoutes.patch("/users/:id/role", roleChangeHandler);
  adminRoutes.delete("/courses/:slug", deleteCourseHandler);
});
```

---

## 🧪 WEEK 4: INTEGRATION & E2E TESTS (5 days)

### Integration Tests

**Test Database Setup** (`apps/api/test/setup.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

export async function setupTestDb() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TEST,
      },
    },
  });

  // Clear all tables
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  return prisma;
}
```

**Full Flow Test** (`apps/api/test/integration/payment-flow.test.ts`):
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app';
import { setupTestDb } from '../setup';

describe('Payment Flow Integration', () => {
  let app, prisma;

  beforeAll(async () => {
    prisma = await setupTestDb();
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should complete full payment flow', async () => {
    // 1. Create user
    const user = await prisma.user.create({
      data: {
        firebaseUid: 'test-uid',
        email: 'test@example.com',
        role: 'STUDENT',
      },
    });

    // 2. Create order
    const orderRes = await app.inject({
      method: 'POST',
      url: '/v1/orders',
      headers: { authorization: 'Bearer test-token' },
      payload: {
        items: [{ courseSlug: 'army-officer' }],
        provider: 'mock',
      },
    });

    const order = JSON.parse(orderRes.body);

    // 3. Confirm payment
    const confirmRes = await app.inject({
      method: 'POST',
      url: `/v1/orders/${order.orderId}/confirm`,
      headers: { authorization: 'Bearer test-token' },
    });

    expect(confirmRes.statusCode).toBe(200);

    // 4. Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id },
    });

    expect(enrollment).toBeTruthy();
    expect(enrollment.status).toBe('ACTIVE');

    // 5. Verify order status
    const dbOrder = await prisma.purchaseOrder.findUnique({
      where: { id: order.orderId },
    });

    expect(dbOrder.status).toBe('PAID');
  });
});
```

---

## 🚀 WEEK 5: LOAD TESTING & OPTIMIZATION (5 days)

### Load Testing with k6

**Install:**
```bash
brew install k6  # macOS
# or
choco install k6  # Windows
```

**Load Test Script** (`tests/load/payment-flow.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% failure rate
  },
};

export default function () {
  // 1. Create order
  const orderRes = http.post(
    'https://api.thecolonelsacademy.com/v1/orders',
    JSON.stringify({
      items: [{ courseSlug: 'army-officer' }],
      provider: 'mock',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    }
  );

  check(orderRes, {
    'order created': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Confirm order
  const order = JSON.parse(orderRes.body);
  const confirmRes = http.post(
    `https://api.thecolonelsacademy.com/v1/orders/${order.orderId}/confirm`,
    null,
    {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    }
  );

  check(confirmRes, {
    'order confirmed': (r) => r.status === 200,
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run tests/load/payment-flow.js
```

**Expected Results:**
- ✅ P95 latency < 500ms
- ✅ Error rate < 1%
- ✅ Throughput > 100 req/s

---

## 📋 WEEK 6-7: STAGING & PRODUCTION DEPLOYMENT

### Week 6: Staging Environment

1. **Create Staging Environment on Railway**
   - Clone production setup
   - Use separate database
   - Enable debug logging

2. **Deploy to Staging**
   ```bash
   git push staging main
   ```

3. **Run Smoke Tests**
   ```bash
   pnpm test:e2e --env=staging
   ```

4. **Manual QA Testing**
   - Payment flow
   - Enrollment
   - Progress tracking
   - Admin panel

---

### Week 7: Production Deployment

**Pre-Deployment Checklist:**
- [ ] All tests passing (60%+ coverage)
- [ ] Load tests passed
- [ ] Sentry configured
- [ ] Database backups enabled
- [ ] Environment variables set
- [ ] SSL certificates valid
- [ ] CDN configured
- [ ] Monitoring dashboards ready

**Deployment Steps:**
1. **Database Migration**
   ```bash
   pnpm --filter @colonels-academy/database prisma migrate deploy
   ```

2. **Deploy API**
   ```bash
   git push production main
   ```

3. **Deploy Frontend**
   ```bash
   cd apps/web
   pnpm build
   pnpm deploy
   ```

4. **Verify Deployment**
   ```bash
   curl https://api.thecolonelsacademy.com/health
   curl https://thecolonelsacademy.com
   ```

5. **Monitor for 24 Hours**
   - Check Sentry for errors
   - Monitor Railway metrics
   - Watch database performance
   - Review logs

---

## 📊 SUCCESS METRICS

### Week 1
- [ ] Enrollment bug fixed (0 complaints)
- [ ] Console.log removed (0 instances)
- [ ] Sentry receiving errors
- [ ] Database backups running daily

### Week 2
- [ ] All endpoints have Zod validation
- [ ] 400 errors for invalid input
- [ ] No unhandled validation errors

### Week 3
- [ ] Audit logs for all admin actions
- [ ] Payment webhooks verified
- [ ] Rate limits per endpoint

### Week 4
- [ ] 60%+ test coverage
- [ ] All critical paths tested
- [ ] CI/CD running tests

### Week 5
- [ ] Load test passed (100 concurrent users)
- [ ] P95 latency < 500ms
- [ ] Error rate < 1%

### Week 6-7
- [ ] Staging environment stable
- [ ] Production deployment successful
- [ ] Zero critical errors in 24 hours

---

## 🎯 FINAL CHECKLIST

### Before Production Launch
- [ ] All 5 critical blockers fixed
- [ ] Test coverage > 60%
- [ ] Load testing passed
- [ ] Security audit completed
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Documentation updated
- [ ] Incident response plan ready
- [ ] Team trained on monitoring
- [ ] Rollback plan documented

---

## 📞 SUPPORT

**Questions?**
- Review `PRINCIPAL_ARCHITECT_AUDIT.md` for detailed findings
- Check `AUDIT_COMPARISON.md` for evidence-based analysis
- Contact Principal Architect for clarification

**Progress Tracking:**
- Create GitHub issues for each task
- Use project board for visibility
- Weekly progress reviews
- Daily standups during critical weeks

---

**Let's ship this! 🚀**
