# Database Analytics Audit Report
## The Colonel's Academy - What's Being Tracked vs What Should Be Tracked

**Audit Date:** May 3, 2026  
**Current Coverage:** ~60% of essential LMS analytics  
**Missing Coverage:** ~40% of critical business intelligence

---

## 🎯 EXECUTIVE SUMMARY

Your app is tracking **core learning activities well** but has **critical gaps** in:

1. ❌ **Admin Audit Logging** - No trail of who changed what (CRITICAL)
2. ❌ **Live Session Attendance** - Can't track who attended classes (HIGH)
3. ❌ **Payment Failure Tracking** - Can't analyze payment issues (HIGH)
4. ❌ **Video Engagement** - Can't measure watch time/engagement (HIGH)
5. ❌ **User Engagement Scoring** - Can't identify at-risk students (HIGH)

---

## ✅ WHAT YOU'RE TRACKING WELL

### 1. User Authentication & Profile
- ✅ User registration, login/logout
- ✅ Role management (STUDENT, INSTRUCTOR, DS, ADMIN)
- ✅ Firebase + PostgreSQL sync
- ❌ **Missing:** Login location, device info, failed login attempts

### 2. Course Purchases & Enrollment
- ✅ Full order lifecycle (DRAFT → PAID → REFUNDED)
- ✅ Chapter-based purchases
- ✅ Bundle purchases
- ✅ Enrollment tracking with expiration
- ❌ **Missing:** Payment failures, cart abandonment, coupon usage

### 3. Learning Progress
- ✅ Lesson completion tracking
- ✅ Quiz attempts with detailed scoring
- ✅ Study session timing
- ✅ Assignment submissions with rubric scores
- ✅ Chapter progress with completion percentages
- ✅ Phase milestone tracking
- ❌ **Missing:** Video watch time, time spent per lesson, engagement scoring

### 4. Assessments
- ✅ Quiz attempts with correctness tracking
- ✅ Mock exam results with scores
- ✅ Assignment submissions with reviews
- ❌ **Missing:** Question-level performance analytics, learning gap identification

---

## ❌ CRITICAL GAPS (MUST FIX)

### GAP #1: NO AUDIT LOGGING FOR ADMIN ACTIONS 🚨
**Impact:** Cannot track who made what changes, when, or why  
**Risk:** Compliance issues, security blind spot, can't investigate problems

**What's Not Being Logged:**
- User role changes
- Course creation/updates/deletion
- Lesson modifications
- Live session creation
- Video uploads
- Notification sends

**Solution:** Create `AuditLog` table
```sql
CREATE TABLE AuditLog (
  id CUID PRIMARY KEY,
  userId STRING NOT NULL,
  action STRING NOT NULL,           -- "COURSE_CREATED", "USER_ROLE_CHANGED"
  resourceType STRING NOT NULL,     -- "Course", "User", "Lesson"
  resourceId STRING NOT NULL,
  changes JSON,                     -- { before: {...}, after: {...} }
  ipAddress STRING,
  userAgent STRING,
  createdAt DATETIME DEFAULT now()
);
```

**Effort:** 3-4 days

---

### GAP #2: NO LIVE SESSION ATTENDANCE TRACKING 🚨
**Impact:** Cannot measure live session effectiveness or student engagement  
**Risk:** Can't identify which sessions are valuable, can't track attendance for compliance

**What's Missing:**
- Who attended which sessions
- How long they stayed
- Engagement during session
- Replay views

**Solution:** Create `LiveSessionAttendance` table
```sql
CREATE TABLE LiveSessionAttendance (
  id CUID PRIMARY KEY,
  sessionId STRING NOT NULL,
  userId STRING NOT NULL,
  joinedAt DATETIME,
  leftAt DATETIME,
  durationMinutes INT,
  engagementScore INT,              -- 0-100 based on participation
  createdAt DATETIME DEFAULT now()
);
```

**Effort:** 2-3 days

---

### GAP #3: NO PAYMENT FAILURE TRACKING 🚨
**Impact:** Cannot analyze payment issues, troubleshoot problems, or identify fraud  
**Risk:** Lost revenue, customer support blind spot

**What's Missing:**
- Payment attempt history
- Failure reasons
- Error codes
- Transaction IDs for failed payments

**Solution:** Create `PaymentAttempt` table
```sql
CREATE TABLE PaymentAttempt (
  id CUID PRIMARY KEY,
  orderId STRING,
  userId STRING NOT NULL,
  amount INT NOT NULL,
  provider STRING NOT NULL,         -- "esewa", "khalti", "manual"
  status STRING NOT NULL,           -- "INITIATED", "SUCCESS", "FAILED"
  errorCode STRING,
  errorMessage STRING,
  transactionId STRING,
  attemptedAt DATETIME DEFAULT now()
);
```

**Effort:** 2-3 days

---

### GAP #4: NO VIDEO ENGAGEMENT TRACKING 🚨
**Impact:** Cannot measure which videos are effective, where students drop off  
**Risk:** Can't optimize content, can't identify struggling students

**What's Missing:**
- Actual watch time (not just completion)
- Pause/resume events
- Playback speed
- Rewind/fast-forward behavior

**Solution:** Create `VideoEngagement` table
```sql
CREATE TABLE VideoEngagement (
  id CUID PRIMARY KEY,
  userId STRING NOT NULL,
  lessonId STRING NOT NULL,
  bunnyVideoId STRING NOT NULL,
  watchedSeconds INT,              -- Total seconds watched
  totalSeconds INT,                -- Video duration
  completionPercent INT,           -- 0-100
  playbackRate FLOAT,              -- 0.5, 1.0, 1.5, 2.0
  pauseCount INT,
  rewindCount INT,
  fastForwardCount INT,
  lastWatchedAt DATETIME
);
```

**Effort:** 4-5 days (includes frontend tracking)

---

### GAP #5: NO USER ENGAGEMENT SCORING 🚨
**Impact:** Cannot identify at-risk students, cannot measure learning velocity  
**Risk:** Can't proactively support struggling students

**What's Missing:**
- Engagement score (0-100)
- Learning velocity metrics
- At-risk student identification
- Days since last activity

**Solution:** Create `UserEngagementMetrics` table
```sql
CREATE TABLE UserEngagementMetrics (
  id CUID PRIMARY KEY,
  userId STRING NOT NULL,
  courseId STRING NOT NULL,
  engagementScore INT,             -- 0-100
  lastActivityAt DATETIME,
  daysSinceLastActivity INT,
  lessonsCompletedThisWeek INT,
  averageTimePerLesson INT,
  quizAttemptsThisWeek INT,
  averageQuizScore INT,
  isAtRisk BOOLEAN,
  riskFactors JSON                 -- ["no_activity_7_days", "low_quiz_scores"]
);
```

**Effort:** 3-4 days

---

## ⚠️ HIGH PRIORITY GAPS (SHOULD FIX)

### GAP #6: Content Performance Metrics
- Can't identify which lessons are most/least effective
- Can't optimize curriculum based on data
- **Effort:** 2-3 days

### GAP #7: Failed Login Attempt Tracking
- Security blind spot
- Can't detect brute force attacks
- **Effort:** 1-2 days

### GAP #8: Feature Usage Tracking
- Can't understand which features are used
- Can't optimize UX based on data
- **Effort:** 2-3 days

---

## 📊 MISSING DASHBOARDS & REPORTS

### Student Dashboard Gaps:
- ❌ Engagement score / learning velocity
- ❌ Time spent per course
- ❌ Recommended next steps
- ❌ Weak areas / learning gaps

### Instructor Dashboard Gaps:
- ❌ Student engagement metrics
- ❌ Content performance analytics
- ❌ Student at-risk alerts
- ❌ Live session attendance reports

### Admin Dashboard Gaps:
- ❌ Revenue analytics (by course, by payment method)
- ❌ Conversion funnel (browse → purchase → complete)
- ❌ Payment failure analysis
- ❌ Audit log viewer
- ❌ System health monitoring

---

## 🚀 IMPLEMENTATION ROADMAP

### PHASE 1: CRITICAL (Weeks 1-2) - DO THIS FIRST
**Priority:** MUST DO

1. **Audit Logging** (3-4 days)
   - Create AuditLog table
   - Add middleware to log all admin actions
   - Create audit log viewer in admin dashboard

2. **Live Session Attendance** (2-3 days)
   - Create LiveSessionAttendance table
   - Add attendance tracking endpoints
   - Create attendance reports

3. **Payment Failure Tracking** (2-3 days)
   - Create PaymentAttempt table
   - Log all payment attempts
   - Create payment analytics dashboard

**Total Effort:** 1-2 weeks

---

### PHASE 2: HIGH PRIORITY (Weeks 3-4)
**Priority:** SHOULD DO

1. **Video Engagement Tracking** (4-5 days)
   - Create VideoEngagement table
   - Add video player event tracking (frontend)
   - Create video analytics dashboard

2. **User Engagement Scoring** (3-4 days)
   - Create UserEngagementMetrics table
   - Build engagement calculation algorithm
   - Create at-risk student alerts

3. **Content Performance Metrics** (2-3 days)
   - Create ContentPerformanceMetrics table
   - Build metrics calculation job
   - Create content analytics dashboard

**Total Effort:** 2-3 weeks

---

### PHASE 3: MEDIUM PRIORITY (Weeks 5-6)
**Priority:** NICE TO HAVE

1. Failed Login Tracking (1-2 days)
2. Feature Usage Tracking (2-3 days)
3. Refund Tracking (2-3 days)

**Total Effort:** 1-2 weeks

---

## 📈 QUICK WINS (Can Do Today)

### 1. Add Missing Indexes
```sql
-- Speed up common queries
CREATE INDEX idx_user_progress_user_status ON UserProgress(userId, status);
CREATE INDEX idx_enrollment_course_status ON Enrollment(courseId, status);
CREATE INDEX idx_purchase_order_user_status ON PurchaseOrder(userId, status);
CREATE INDEX idx_study_session_user_ended ON StudySession(userId, endedAt);
```

### 2. Add Useful Analytics Queries
```sql
-- Students at risk (no activity in 7 days)
SELECT u.id, u.email, u.displayName, MAX(ss.endedAt) as lastActivity
FROM "User" u
LEFT JOIN "StudySession" ss ON u.id = ss."userId"
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.email, u.displayName
HAVING MAX(ss.endedAt) < NOW() - INTERVAL '7 days'
   OR MAX(ss.endedAt) IS NULL;

-- Course completion rates
SELECT 
  c.title,
  COUNT(DISTINCT e."userId") as enrolledStudents,
  COUNT(DISTINCT CASE WHEN e."progressPercent" = 100 THEN e."userId" END) as completedStudents,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN e."progressPercent" = 100 THEN e."userId" END) / 
        NULLIF(COUNT(DISTINCT e."userId"), 0), 2) as completionRate
FROM "Course" c
LEFT JOIN "Enrollment" e ON c.id = e."courseId"
WHERE e.status = 'ACTIVE'
GROUP BY c.id, c.title
ORDER BY completionRate DESC;

-- Revenue by course
SELECT 
  c.title,
  COUNT(po.id) as totalOrders,
  SUM(po."totalNpr") as totalRevenue,
  AVG(po."totalNpr") as avgOrderValue
FROM "Course" c
JOIN "PurchaseOrderItem" poi ON c.id = poi."courseId"
JOIN "PurchaseOrder" po ON poi."orderId" = po.id
WHERE po.status = 'PAID'
GROUP BY c.id, c.title
ORDER BY totalRevenue DESC;
```

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Immediate (This Week):**
   - Review this audit with your team
   - Prioritize which gaps to fix first
   - Add the quick win indexes and queries

2. **Short Term (Next 2 Weeks):**
   - Implement Phase 1 (Critical): Audit logging, attendance, payment tracking
   - Create basic admin analytics dashboard

3. **Medium Term (Next 4 Weeks):**
   - Implement Phase 2 (High Priority): Video engagement, user scoring, content metrics
   - Build instructor and student dashboards

4. **Long Term (Next 6 Weeks):**
   - Implement Phase 3 (Medium Priority): Login tracking, feature usage, refunds
   - Build advanced analytics and reporting

---

## 💡 KEY TAKEAWAYS

### What You're Doing Right ✅
- Strong core learning progress tracking
- Good quiz and assessment analytics
- Solid purchase and enrollment tracking
- Chapter-based progress is well implemented

### What Needs Immediate Attention ❌
- **Audit logging** - Critical for compliance and security
- **Live session attendance** - Essential for engagement measurement
- **Payment failure tracking** - Important for revenue optimization
- **Video engagement** - Key for content optimization
- **User engagement scoring** - Vital for student success

### Overall Assessment
**Current State:** 60% analytics coverage  
**Target State:** 95% analytics coverage  
**Estimated Effort:** 6-8 weeks for full implementation  
**Business Impact:** HIGH - Will enable data-driven decisions and improve student outcomes

---

**Next Action:** Review Phase 1 implementation plan and decide which critical gap to tackle first.
