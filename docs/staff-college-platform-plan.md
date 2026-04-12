# Nepal Army Staff College — Digital Learning Platform
## Architecture & Implementation Plan (Team Review Draft)

---

## 1. Overview

This document describes the full architecture and implementation plan for the **Command & Staff College Entrance Exam Preparation Platform** — a 6-month hybrid digital learning experience for Nepalese Army officers.

**Hybrid model:**
- Officers self-study through structured course content (Udemy-style progression with checkmarks)
- Instructors conduct 3 live Zoom classes per week
- Practice quizzes after each lesson, 3 timed mock exams across 6 months
- DS (Directing Staff) reviews officer progress and manually approves phase transitions

**5 subjects, each 100 marks:**

| # | Subject | Mark Weighting |
|---|---------|---------------|
| 1 | Tactics & Administration | Tactics 70%, Admin 20%, Law 10% |
| 2 | Contemporary Affairs | National 40%, Regional 30%, International 20%, Military Tech 10% |
| 3 | Military History & Strategic Thoughts | — |
| 4 | Military Appreciation & Plans (MDMP) | — |
| 5 | Lecturette (Oral Presentation) | — |

**6-month phase structure with hard gates:**

| Month | Phase | Gate to unlock next |
|-------|-------|---------------------|
| 1 | Foundation | Self-assessment quiz (auto — score ≥ 60%) |
| 2 | Development | Mock Exam I (auto — must attempt + score ≥ 40%) |
| 3 | Application | Mock Exam II (auto — timed, all 5 subjects) |
| 4 | Consolidation | DS/Mentor approval (manual — DS clicks approve per officer) |
| 5 | Simulation | Mock Exam III completion (auto — full 3-hr simulation) |
| 6 | Final Prep | Final self-assessment |

---

## 2. What Exists (Reuse As-Is)

| Component | Location | Notes |
|-----------|----------|-------|
| Course / Module / Lesson tree | `packages/database/prisma/schema.prisma` | Supports VIDEO, PDF, LIVE, QUIZ, TEXT types |
| Lesson progress tracking | `UserProgress` model | NOT_STARTED → IN_PROGRESS → COMPLETED |
| Prerequisite / Iron Guard | `apps/api/src/lib/access-guard.ts` | Extend for phase-level gates |
| Quiz engine | `QuizSession`, `QuizAttempt`, `QuizQuestion` models | PRACTICE, WEEKLY_DRILL, MOCK_EXAM kinds |
| Enrollment + progress % | `Enrollment` model + `progress-recalc` worker job | — |
| Role system | `User.role` — STUDENT, INSTRUCTOR, DS, ADMIN | DS role exists, unused |
| Live sessions | `LiveSession` model with `meetingUrl` | Zoom URL slots in here directly |
| Student dashboard | `apps/web/src/app/dashboard/` | Needs phase widget + milestone cards |
| Classroom player | `apps/web/src/app/classroom/[slug]/` | Video, PDF, quiz already works |
| Admin page shell | `apps/web/src/app/admin/page.tsx` | Existing 9-tab dashboard — add CMS tabs |
| Background job queue | `apps/worker` with BullMQ | Add new job types |
| Typed API client | `packages/api-client` | Update when new endpoints are added |

---

## 3. Database Changes (packages/database)

### 3a. New Models

```prisma
// Logs time spent in a lesson — drives study hours analytics
model StudySession {
  id          String   @id @default(cuid())
  userId      String
  courseId    String
  lessonId    String?
  minutes     Int
  loggedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  course      Course   @relation(fields: [courseId], references: [id])
  lesson      Lesson?  @relation(fields: [lessonId], references: [id])
}

// Defines the milestone that guards each phase transition
model PhaseGate {
  id             String               @id @default(cuid())
  courseId       String
  phaseNumber    Int                  // 1–6; gate N unlocks phase N+1
  gateType       PhaseGateType
  thresholdScore Int?                 // % score required (QUIZ_SCORE_THRESHOLD only)
  examConfigId   String?              // which exam must be attempted (MOCK_EXAM_ATTEMPTED only)
  course         Course               @relation(fields: [courseId], references: [id])
  examConfig     ExamConfig?          @relation(fields: [examConfigId], references: [id])
  completions    PhaseGateCompletion[]
  @@unique([courseId, phaseNumber])
}

enum PhaseGateType {
  QUIZ_SCORE_THRESHOLD   // auto — triggered after quiz session
  MOCK_EXAM_ATTEMPTED    // auto — triggered after mock exam submitted
  DS_APPROVAL            // manual — DS clicks approve in their dashboard
}

// Records that a specific officer has passed a specific gate
model PhaseGateCompletion {
  id               String    @id @default(cuid())
  userId           String
  gateId           String
  passedAt         DateTime  @default(now())
  approvedByUserId String?   // set for DS_APPROVAL gates
  user             User      @relation(fields: [userId], references: [id])
  gate             PhaseGate @relation(fields: [gateId], references: [id])
  approver         User?     @relation("GateApprovals", fields: [approvedByUserId], references: [id])
  @@unique([userId, gateId])
}

// Configuration for a timed mock exam (one per phase that has an exam gate)
model ExamConfig {
  id              String        @id @default(cuid())
  courseId        String
  phaseNumber     Int
  title           String        // e.g., "Mock Exam I — All Subjects"
  durationMinutes Int           // 180 for 3-hour exam
  subjectWeights  Json          // { "TACTICS_ADMIN": 70, "MDMP": 100, ... }
  questionCounts  Json          // { "TACTICS_ADMIN": 50, "MILITARY_HISTORY": 30, ... }
  passMark        Int           // minimum total % to auto-pass gate
  course          Course        @relation(fields: [courseId], references: [id])
  sessions        QuizSession[]
  gates           PhaseGate[]
  @@unique([courseId, phaseNumber])
}

// DS written feedback on an individual officer
model InstructorFeedback {
  id         String   @id @default(cuid())
  fromUserId String   // DS or Instructor (role: DS | INSTRUCTOR)
  toUserId   String   // Student officer (role: STUDENT)
  courseId   String
  body       String
  createdAt  DateTime @default(now())
  from       User     @relation("FeedbackGiven", fields: [fromUserId], references: [id])
  to         User     @relation("FeedbackReceived", fields: [toUserId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])
}
```

### 3b. Updates to Existing Models

```prisma
// Module — add:
phaseNumber  Int?         // 1–6, which preparation phase this module belongs to
subjectArea  SubjectArea? // which of the 5 exam subjects

// Lesson — add:
phaseNumber  Int?         // inherited from module, stored for fast gate queries

// Course — add:
vision           String?  // from PDF §1
mission          String?
objectives       Json?    // String[] — 4 bullet objectives
learningOutcomes Json?    // String[] — learning outcomes from PDF §2

// QuizSession — add:
examConfigId  String?           // FK → ExamConfig when kind = MOCK_EXAM
examConfig    ExamConfig?

// New enum:
enum SubjectArea {
  TACTICS_ADMIN
  CURRENT_AFFAIRS
  MILITARY_HISTORY
  MDMP
  LECTURETTE
}
```

---

## 4. Backend API Changes (apps/api)

### 4a. Existing Modules — Extensions

#### `learning` module (`/v1/learning`)
**New routes:**

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/v1/learning/phase-gates/:courseId` | Returns gate status for current user (locked/passed per phase) |
| `POST` | `/v1/learning/study-sessions` | Log a study session (lessonId, minutes) |
| `GET` | `/v1/learning/exams/:examConfigId` | Fetch exam config + questions (shuffled, no answers) |
| `POST` | `/v1/learning/exams/:examConfigId/start` | Creates a QuizSession (MOCK_EXAM), returns sessionId + server-side deadline |
| `POST` | `/v1/learning/exams/:sessionId/submit` | Submit all answers, auto-grade, return per-subject score report |
| `GET` | `/v1/learning/analytics/:courseId` | Student's own analytics — study hours, mock scores, subject mastery |

**Gate evaluation** is triggered automatically:
- After `POST /progress/:lessonId` (for QUIZ_SCORE_THRESHOLD gates)
- After `POST /exams/:sessionId/submit` (for MOCK_EXAM_ATTEMPTED gates)
- Enqueues a new `phase-gate-eval` worker job

#### `catalog` module (`/v1/catalog`)
**Extended routes:**

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/v1/catalog/courses/:slug/phases` | Returns 6-phase structure with modules per phase and gate status for current user |

---

### 4b. New Module — `ds` (`/v1/ds`)

DS = Directing Staff. Protected by role check (`DS` or `ADMIN` only).

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/v1/ds/officers` | All enrolled officers with study hours, quiz count, mock scores, current phase |
| `GET` | `/v1/ds/officers/:userId` | Single officer — full progress timeline, subject mastery, feedback history |
| `POST` | `/v1/ds/officers/:userId/feedback` | Submit written feedback for an officer |
| `POST` | `/v1/ds/gates/:gateId/approve/:userId` | Manually approve DS_APPROVAL gate for an officer |
| `GET` | `/v1/ds/analytics` | Cohort-level stats — average mock scores, phase distribution, completion rates |

**Files to create:**
```
apps/api/src/modules/ds/
  routes.ts
  service.ts
```

---

### 4c. New Module — `admin/cms` (`/v1/admin`)

Protected by role check (`ADMIN` only). Powers the CMS tabs in the web admin page.

| Resource | Routes | Description |
|----------|--------|-------------|
| Modules | `GET/POST /v1/admin/modules`, `PATCH/DELETE /v1/admin/modules/:id` | Create/edit/reorder modules |
| Lessons | `GET/POST /v1/admin/lessons`, `PATCH/DELETE /v1/admin/lessons/:id` | Create/edit lessons (all content types) |
| Questions | `GET/POST /v1/admin/questions`, `PATCH/DELETE /v1/admin/questions/:id` | Question bank CRUD |
| Questions import | `POST /v1/admin/questions/import` | CSV bulk import |
| Exam configs | `GET/POST /v1/admin/exam-configs`, `PATCH/DELETE /v1/admin/exam-configs/:id` | Exam setup |
| Live sessions | `GET/POST /v1/admin/live-sessions`, `PATCH/DELETE /v1/admin/live-sessions/:id` | Zoom session management |
| Phase gates | `GET/POST /v1/admin/phase-gates`, `PATCH /v1/admin/phase-gates/:id` | Gate config per phase |
| Course meta | `PATCH /v1/admin/courses/:id/meta` | Update Vision/Mission/Objectives/Outcomes |

**Files to create:**
```
apps/api/src/modules/admin/
  routes.ts
  service.ts
```

---

### 4d. Iron Guard Extension (access-guard.ts)

Current guard checks: enrollment + lesson prerequisite.

**Add:** phase gate check — before allowing access to any lesson in phase N, verify `PhaseGateCompletion` exists for phase N-1 gate. DS and ADMIN roles bypass all gates.

```
Current flow:  enrollment → prerequisite → allow
New flow:      enrollment → phase gate → prerequisite → allow
```

---

## 5. Background Worker Changes (apps/worker)

### New Jobs

| Job | Queue | Trigger | Action |
|-----|-------|---------|--------|
| `phase-gate-eval` | `phaseGateEval` | After quiz/exam completion | Checks if score threshold met, creates PhaseGateCompletion if passed |
| `exam-auto-submit` | `examAutoSubmit` | Delayed job at exam deadline | Auto-submits if officer hasn't submitted before timer expires |
| `study-session-flush` | `studySessionFlush` | Periodic (every 5 min) | Flushes any open study sessions for officers who closed the tab without logging |

**Files to create:**
```
apps/worker/src/jobs/
  phase-gate-eval.ts
  exam-auto-submit.ts
  study-session-flush.ts
```

---

## 6. Web Frontend Changes (apps/web)

### 6a. New Pages

| Route | Description |
|-------|-------------|
| `/analytics` | Student performance — mock exam scores chart, subject mastery bars, study hours area chart (matches PDF pages 26–28) |
| `/ds` | DS dashboard — officer roster table + drill-down + feedback form (matches PDF pages 24–25) |

### 6b. Updated Pages

| Route | What changes |
|-------|-------------|
| `/courses/staff-college-command` | Add Vision / Mission / Objectives / Learning Outcomes section from §1–2 of PDF |
| `/courses/staff-college-command` | Curriculum tree shows 6 phases with lock/unlock state per phase |
| `/dashboard` | Add: weekly schedule widget (Sun–Fri table from PDF §10), phase progress strip with milestone cards, upcoming Zoom sessions |
| `/classroom/[slug]` | Add: study timer (starts on lesson open, logs StudySession on exit), phase gate banner if next phase is locked |
| `/admin` | Add 5 new CMS tabs (see §7 below) |

### 6c. Admin CMS Tabs (added to /admin/page.tsx)

| Tab | Features |
|-----|---------|
| **Curriculum** | Phase selector (1–6) → subject selector → module list → lesson list. Drag to reorder. Create/edit lesson with all fields (type, content, Zoom URL, PDF upload, video ID). |
| **Question Bank** | Filter by subject + phase + difficulty. Create/edit/delete questions. CSV import. Preview mode. |
| **Live Schedule** | Create Zoom sessions. Assign to phase + subject. Set recurring pattern (Mon/Wed/Fri). Shows calendar view. |
| **Phase Gates** | Per-phase config — set gate type and threshold. View how many officers are blocked at each gate. |
| **Officer Roster** | Enrolled officers table. Study hours, quiz count, exam scores, current phase. Click officer → feedback history. Submit feedback. Approve DS gate manually. |

---

## 7. Mobile Changes (apps/mobile)

Mobile currently has course browsing and schedule tabs but **no lesson player, no quiz UI, and no exam UI**.

### New Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Course curriculum | `course/[slug]/curriculum` | 6-phase accordion — locked phases show gate requirement |
| Lesson player | `course/[slug]/lesson/[lessonId]` | Video (Bunny), PDF viewer, text lesson, quiz |
| Mock exam | `course/[slug]/exam/[examConfigId]` | Timed countdown, sequential questions, auto-submit |
| Analytics | `(tabs)/analytics` | Student's own mock scores, subject mastery, study hours (same data as web analytics page) |

### Updated Screens

| Screen | What changes |
|--------|-------------|
| `(tabs)/schedule` | Extend existing — show upcoming Zoom sessions with deep link `zoommtg://` to join directly |
| `(tabs)/index` (dashboard) | Add phase progress strip and next milestone card |

---

## 8. Full Curriculum Content Map (what goes into the CMS)

This is what the admin will enter via the Curriculum Builder. Listed here as reference for content planning.

### Phase 1 — Foundation (Month 1)
*Gate: Self-assessment quiz, score ≥ 60%*

**Module: Tactics & Administration — Foundations** `TACTICS_ADMIN`
- Operation of War `VIDEO`
- Basic Tactics — Patrolling, Raid, Ambush `VIDEO + PDF`
- Basic Arms — Infantry, Armor, Artillery, Air Defence, Engineer, Signal, Special Forces `VIDEO`
- Mountain & Jungle Warfare `VIDEO`
- How to Prepare for Tactics & Admin `TEXT` ← from PDF §3c
- Tactics Fundamentals Quiz `QUIZ`

**Module: Military History — Ancient to Modern** `MILITARY_HISTORY`
- Introduction & Study Method `TEXT` ← from PDF §5b
- Ancient Warfare — Key Battles `VIDEO`
- Nepali Military History — Anglo-Nepal War 1814 `VIDEO`
- Strategic Thinkers — Sun Tzu `VIDEO`
- History Short-Answer Practice `QUIZ`

**Module: MDMP Theory — Aim to Decision** `MDMP`
- MDMP Steps Explained `VIDEO`
- Appreciation Format — SMEAC Template `PDF` (downloadable)
- Live: MDMP Case Study Discussion `LIVE` (Zoom)

**Module: Oral Presentation — Introduction** `LECTURETTE`
- Public Speaking Techniques `VIDEO`
- 3-Part Structure — Intro, Body, Conclusion `TEXT` ← from PDF §7c
- Practice: 3-minute presentation `QUIZ`

---

### Phase 2 — Development (Month 2)
*Gate: Mock Exam I — must attempt, score ≥ 40%*

**Module: Advanced Tactics** `TACTICS_ADMIN`
- Counter Insurgency Operations `VIDEO`
- Fighting in Built-up Area `VIDEO`
- Peacekeeping Operations — UN Mandates & Rules of Engagement `VIDEO`
- Intelligence & Security `VIDEO`
- Advanced Tactics Scenario Exercise `QUIZ`

**Module: Military Administration & Law** `TACTICS_ADMIN`
- Administration in War & Peace `VIDEO`
- Training — Methods and Doctrine `VIDEO`
- Leadership & Man Management `VIDEO`
- Organization of Nepali Army `PDF`
- Military Act, Laws & Regulations `TEXT`
- Logistic System in Nepali Army `VIDEO`
- Admin & Law Quiz `QUIZ`

**Module: 20th Century Wars & Nepali Military History** `MILITARY_HISTORY`
- World Wars — Key Turning Points `VIDEO`
- Cold War & Modern Insurgencies `VIDEO`
- Gurkha Campaigns & UN Peacekeeping History `VIDEO`
- Strategic Thinkers — Clausewitz & Jomini `VIDEO`
- Strategic Thinkers — Mao Zedong `VIDEO`
- Live: Strategic Thinkers Discussion `LIVE` (Zoom)
- History Essay Practice `QUIZ`

**Module: MDMP Simulations** `MDMP`
- Platoon Attack — Appreciation Exercise `QUIZ`
- Company Defense — Appreciation Exercise `QUIZ`
- Live: MDMP Workshop `LIVE` (Zoom)

**Module: Structured Presentations — 10 Minutes** `LECTURETTE`
- Delivering a 10-minute Lecturette `VIDEO`
- Voice Modulation & Body Language `TEXT` ← from PDF §7h
- Live: Peer Feedback Presentation Class `LIVE` (Zoom)

**→ Mock Exam I** (all 5 subjects, timed, ExamConfig: 3 hrs, question counts per subject weights)

---

### Phase 3 — Application (Month 3)
*Gate: Mock Exam II — timed, all 5 subjects*

**Module: Tactics Essay Writing & Exam Technique** `TACTICS_ADMIN`
- Essay Writing for Tactics Questions `TEXT` ← from PDF §3c prep methodology
- Tactical Scenario Essay Practice `QUIZ`
- Live: Tactics Essay Review `LIVE` (Zoom)

**Module: Contemporary Affairs — System & Method** `CURRENT_AFFAIRS`
- How to Follow Current Affairs Daily `TEXT` ← from PDF §4b
- Structured Note-Making System `TEXT` ← from PDF §4b
- National Security & Defence — Key Topics `VIDEO`
- Regional Affairs — South Asia, China, India `VIDEO`
- Global Affairs — UN, NATO, Conflicts `VIDEO`
- Military Technology Trends `VIDEO`
- PEEL Essay Method for Current Affairs `TEXT` ← from PDF §4d
- Current Affairs Quiz `QUIZ`
- Live: Current Affairs Briefing `LIVE` (Zoom)

**Module: Military History — Comparative Essays** `MILITARY_HISTORY`
- Comparing Leadership Across Battles `TEXT`
- Case Study: Battle of Nalapani (1814) `VIDEO`
- Comparative Essay Practice `QUIZ`
- Live: History Essay Workshop `LIVE` (Zoom)

**Module: Full-Length MDMP Exercises** `MDMP`
- Full Appreciation — Written Exercise 1 `QUIZ`
- Full Plan — Written Exercise 2 `QUIZ`
- Military Plans Format — SMEAC Deep Dive `VIDEO`
- Live: MDMP Full Exercise Review `LIVE` (Zoom)

**Module: Formal Presentations with Q&A** `LECTURETTE`
- Handling Q&A After a Presentation `VIDEO`
- Exam-Condition Presentation Practice `TEXT`
- Live: Formal Presentation with Panel Q&A `LIVE` (Zoom)

**→ Mock Exam II** (all 5 subjects, timed)

---

### Phase 4 — Consolidation (Month 4)
*Gate: DS/Mentor manual approval per officer*

**Module: Weak Area Targeted Review** (all subjects)
- Tactics Weak Area Review `VIDEO`
- Current Affairs Weak Area Review `VIDEO`
- History Weak Area Review `VIDEO`
- MDMP Weak Area Review `VIDEO`
- Live: Faculty Weak Area Clinic `LIVE` (Zoom)

**Module: Mixed Format Practice — MCQ + Essays**
- Mixed MCQ Drill — All Subjects `QUIZ`
- Timed Essay Practice — All Subjects `QUIZ`
- Live: Essay Marking Workshop `LIVE` (Zoom)

**Module: Presentation Rehearsals with Faculty** `LECTURETTE`
- Live: Faculty-Reviewed Presentation 1 `LIVE` (Zoom)
- Live: Faculty-Reviewed Presentation 2 `LIVE` (Zoom)

*DS reviews each officer and manually approves gate before Month 5 unlocks.*

---

### Phase 5 — Simulation (Month 5)
*Gate: Mock Exam III completion*

**Module: Final Revision Before Simulation**
- Revision: Tactics & Admin Summary Notes `PDF`
- Revision: Current Affairs Key Points `PDF`
- Revision: Military History Summary `PDF`
- Revision: MDMP Templates `PDF`
- Revision: Oral Technique Cue Card `PDF`

**Module: Mock Exam III — Full Simulation** ← EXAM type
- Mock Exam III (3-hr timed, all 5 subjects, all question types) `QUIZ` (ExamConfig)

**Module: Post-Exam Faculty Review** `LIVE`
- Live: Mock Exam III Debrief Session 1 `LIVE` (Zoom)
- Live: Mock Exam III Debrief Session 2 `LIVE` (Zoom)
- Individualized Feedback Report `TEXT` (DS posts per officer)

**Module: Panel Presentation Evaluation** `LECTURETTE`
- Live: Panel Presentation — Evaluated `LIVE` (Zoom)

---

### Phase 6 — Final Preparation (Month 6)
*Gate: Final self-assessment*

**Module: Quick Revision — All Subjects**
- Final Summary: Tactics & Admin `PDF`
- Final Summary: Current Affairs `PDF`
- Final Summary: Military History & Strategy `PDF`
- Final Summary: MDMP & Plans `PDF`
- Final Summary: Lecturette Technique `PDF`
- Daily Short Quiz — Tactics `QUIZ`
- Daily Short Quiz — Current Affairs `QUIZ`
- Daily Short Quiz — History `QUIZ`
- Daily Short Quiz — MDMP `QUIZ`

**Module: Exam Readiness**
- Stress Management Techniques `TEXT`
- Time Management in the Exam Hall `TEXT` ← from PDF §8
- Exam Format Reference Card `TEXT` (MCQ + short-answer + essay, 3 hrs, grading criteria)
- Live: Final Q&A with Faculty `LIVE` (Zoom)

**Module: Final Self-Assessment + Counselling**
- Final Self-Assessment Quiz (all subjects) `QUIZ`
- Live: 1-on-1 Counselling with DS `LIVE` (Zoom, individual booking)

---

## 9. Analytics & Dashboard Design Reference

The PDF pages 23–29 are the design specification. Map to platform screens:

| PDF Page | Platform Screen |
|----------|----------------|
| Page 23 — Dashboard with progress bars (Study Hours 75/250, Quizzes 12/20, Mock Exams 1/3) + Upcoming Milestones | `/dashboard` student view |
| Page 24 — Mentor Dashboard (officer table: Study Hours, Quizzes Completed) | `/ds` dashboard |
| Page 25 — Dashboard Mentor View (Officer A/B/C, quizzes 8/20, 15/20, mock exams 2/3, 3/3) | `/ds` dashboard expanded |
| Page 26 — Performance Analytics (Mock Exam Scores line chart, Subject Mastery bar chart, Study Hours Logged area chart) | `/analytics` student view |
| Page 27–28 — Officer Performance Comparison (two officers on same chart, Oral Presentation Scores, Study Feedback text) | `/ds` officer drill-down |
| Page 29 — Roadmap Gantt (Tactics Jan–Mar, Military History Feb–May, MDMP Mar–Jun, Military Law May–Sep) | `/dashboard` phase timeline strip |

---

## 10. Implementation Sequence

### Sprint 1 — Schema & Backend Foundation
1. Prisma migration: add all new models + field updates
2. New `ds` API module (`/v1/ds`) with officer roster + feedback + gate approval
3. New `admin` API module (`/v1/admin`) with CRUD for modules, lessons, questions, exam configs, live sessions, phase gates
4. Extend `learning` module: study session endpoint, phase gate check endpoint, exam start/submit endpoints
5. Extend `catalog` module: phases endpoint
6. Extend `access-guard.ts`: phase gate check in Iron Guard
7. New worker jobs: `phase-gate-eval`, `exam-auto-submit`, `study-session-flush`
8. Update `packages/contracts` and `packages/api-client` with new types and typed client methods

### Sprint 2 — Admin CMS (Web)
9. Admin page: add **Curriculum Builder** tab (module/lesson CRUD, drag reorder, all lesson types, Zoom URL field)
10. Admin page: add **Question Bank** tab (CRUD + CSV import)
11. Admin page: add **Live Schedule** tab (Zoom session creation, recurring pattern)
12. Admin page: add **Phase Gate Config** tab
13. Admin page: add **Officer Roster** tab (DS feedback + gate approval)
14. Course landing page: add Vision / Mission / Objectives / Learning Outcomes section

### Sprint 3 — Student Experience (Web)
15. Dashboard: phase progress strip, milestone cards, weekly schedule widget
16. Classroom: study timer (logs StudySession), phase gate banner
17. Timed mock exam UI (countdown, sequential questions, auto-submit, score report)
18. Analytics page: mock scores chart, subject mastery bars, study hours chart

### Sprint 4 — DS Dashboard (Web)
19. `/ds` page: officer roster table with stats
20. Per-officer drill-down: progress timeline, subject mastery, feedback history
21. Feedback submission form + DS gate approval button
22. Cohort analytics: average scores, phase distribution

### Sprint 5 — Mobile
23. Mobile: course curriculum tree (6 phases, locked/unlocked)
24. Mobile: lesson player (video, PDF, text, quiz)
25. Mobile: timed mock exam UI
26. Mobile: phase gate UI (locked phase card with gate requirement)
27. Mobile: schedule tab — Zoom deep link join
28. Mobile: analytics tab — mock scores, subject mastery, study hours
29. Mobile: dashboard — phase strip + next milestone card

---

## 11. Open Questions for Team

1. **Lecturette assessment** — Officers record themselves for the oral exam component. Should the platform support video upload submissions for DS review, or is this out of scope for this phase?
2. **Current Affairs content** — This subject requires fresh real-world news. Will DS update Current Affairs lessons weekly, or will officers be directed to external sources (Kathmandu Post, BBC) and quizzed on content they self-study?
3. **Question bank size** — How many questions per subject are planned for launch? Minimum needed for a 3-hour mock exam: ~50 per subject (250 total). At launch do we have that many ready?
4. **Cohort model** — Do all enrolled officers move through the platform together (same cohort, same gate dates), or is it self-paced within each phase?
5. **Passing thresholds** — Confirmed pass marks for Mock Exam I (40%) and self-assessment quiz (60%). What is the pass mark for Mock Exam II and Mock Exam III?
6. **DS accounts** — Are DS officers already in the system or do they need an onboarding flow to get the DS role assigned?
