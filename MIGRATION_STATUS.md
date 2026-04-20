# Migration Status: Old Web App → New Web App

> Last updated: April 2026
> Old app: `colonels-academy-webapp` (React Router + Firebase)
> New app: `colonels-academy-fullstack/apps/web` (Next.js + Fastify + PostgreSQL)

---

## ✅ COMPLETED

| Feature | Notes |
|---------|-------|
| Homepage / Gateway | Hero, course grid, intake banner, instructors, mobile platform, CTA |
| Course Catalog | `/courses` with filter by track, premium cards |
| Course Detail | `/courses/[slug]` with full layout, pricing card, add to cart |
| Classroom | `/classroom/[slug]` with video player, curriculum sidebar, tabs |
| Demo Class | `/demo-class` with Bunny Stream video |
| Dashboard | `/dashboard` with stats, continue learning, live classes, missions |
| Admin Panel | `/admin` with all tabs (mock data for Firebase-dependent features) |
| Brand Book | `/brandbook` exact copy |
| Login / Signup | Firebase auth with session cookies |
| Cart System | CartContext, cart drawer in navbar, add/remove items |
| Course Add to Cart | From course detail page |
| Instructor Images | Bunny CDN integration |
| Course Images | Bunny CDN integration |
| Navbar | Full with cart, auth, dropdowns |
| Footer | Exact match |
| Video Player | Bunny Stream + YouTube + HLS support |
| Image Upload | Admin → Bunny CDN upload |
| Database | PostgreSQL with Prisma |
| API | Fastify with catalog, auth, learning endpoints |

---

## ❌ MISSING (Priority Order)

### 🔴 HIGH PRIORITY (Revenue Critical)

#### 1. Payment System
- **Old app**: Khalti + eSewa integration via Firebase Functions
- **New app**: No payment system
- **Needs**: Khalti/eSewa API integration, order creation, payment verification, enrollment on success
- **Files to create**: `apps/web/src/app/checkout/page.tsx`, `apps/api/src/modules/payments/`

#### 2. Checkout Page
- **Old app**: Full checkout with pricing, discounts, reward points
- **New app**: `/checkout` route doesn't exist
- **Needs**: Checkout UI, order summary, payment method selection

#### 3. Payment Success / Verify Pages
- **Old app**: `/payment-success`, `/payment/:provider`
- **New app**: Missing
- **Needs**: Post-payment confirmation pages

#### 4. Enrollment API
- **Old app**: Firebase enrollment on payment success
- **New app**: Schema exists but no API endpoints or UI
- **Needs**: `POST /v1/enrollments`, enrollment verification in course player

---

### 🟡 MEDIUM PRIORITY

#### 5. Mock Test / IQ Test
- **Old app**: Full test interface at `/iq-test`
- **New app**: Missing completely
- **Needs**: Test page, question display, timer, results, history

#### 6. Live Class Lobby
- **Old app**: `/classroom/live/:courseId` with meeting URL join
- **New app**: Missing
- **Needs**: Live session join page, meeting URL redirect

#### 7. My Learning Page
- **Old app**: `/my-learning` with full dashboard (progress, calendar, timetable)
- **New app**: Only basic `/dashboard` exists
- **Needs**: Dedicated my-learning page with enrolled courses, progress tracking

#### 8. User Settings
- **Old app**: `/settings` with profile, subscription, payment history
- **New app**: Missing
- **Needs**: Settings page with profile management

#### 9. Notifications System
- **Old app**: Firebase-based push notifications
- **New app**: Missing
- **Needs**: Notification model, API, UI

#### 10. Admin - Real Functionality
- **Old app**: Full Firebase-connected admin
- **New app**: Mock UI only
- **Needs**: Connect admin to real API (users, courses, notifications)

---

### 🟢 LOW PRIORITY

#### 11. Shop Page
- **Old app**: `/shop` with product catalog
- **New app**: Missing
- **Needs**: Product model, shop page, cart integration

#### 12. Legal Pages
- **Old app**: Privacy Policy, Terms of Service, Contact
- **New app**: Links exist in footer but pages missing
- **Needs**: `/privacy-policy`, `/terms-of-service`, `/contact`

#### 13. Resources Pages
- **Old app**: Study Materials, Previous Papers, Training Manuals
- **New app**: Links in navbar but pages missing
- **Needs**: `/study-materials`, `/previous-papers`, `/training-manuals`

#### 14. Instructors Page
- **Old app**: `/instructors` dedicated page
- **New app**: Only shown on homepage
- **Needs**: `/instructors` page

#### 15. Delete Account
- **Old app**: `/delete-account`
- **New app**: Missing
- **Needs**: Account deletion UI and API

#### 16. Error Boundary
- **Old app**: ErrorBoundary component
- **New app**: Missing
- **Needs**: Global error boundary component

#### 17. SEO Component
- **Old app**: SEO component with meta tags
- **New app**: Only basic Next.js metadata
- **Needs**: Dynamic SEO per page

---

## ⚠️ PARTIALLY IMPLEMENTED

| Feature | Status | What's Missing |
|---------|--------|----------------|
| Cart | Provider + UI exists | Checkout flow, payment integration |
| Course Player | Basic UI exists | Real lesson data, progress tracking, quiz UI |
| Admin Dashboard | Mock UI exists | Real data connections |
| Dashboard | Basic version | Full my-learning features |
| Enrollments | Schema only | API endpoints, UI |

---

## 🔌 API ENDPOINTS STATUS

### Implemented
- `GET /v1/catalog/courses`
- `GET /v1/catalog/courses/:slug`
- `GET /v1/catalog/courses/:slug/lessons`
- `GET /v1/catalog/instructors`
- `GET /v1/learning/dashboard/overview`
- `POST /v1/learning/progress/:lessonId`
- `GET /v1/learning/live-sessions`
- `GET /v1/media/video/:bunnyVideoId`
- `POST /v1/upload` (Bunny CDN)
- Auth endpoints (session, CSRF, login, logout)

### Missing
- `POST /v1/payments/create` (Khalti/eSewa)
- `POST /v1/payments/verify`
- `POST /v1/enrollments`
- `GET /v1/enrollments/user`
- `GET /v1/users/me`
- `PATCH /v1/users/me`
- `DELETE /v1/users/me`
- `GET /v1/notifications`
- `POST /v1/notifications`
- `GET /v1/quiz/:lessonId`
- `POST /v1/quiz/:lessonId/submit`

---

## 📊 OVERALL PROGRESS

```
Core Infrastructure:  ████████████████████ 100%
Authentication:       ████████████████░░░░  80%
Course Catalog:       ████████████████████ 100%
Course Player:        ████████░░░░░░░░░░░░  40%
Payments:             ░░░░░░░░░░░░░░░░░░░░   0%
Cart/Checkout:        ████████░░░░░░░░░░░░  40%
Admin:                ████████░░░░░░░░░░░░  40%
Mock Tests:           ░░░░░░░░░░░░░░░░░░░░   0%
Shop:                 ░░░░░░░░░░░░░░░░░░░░   0%
Notifications:        ░░░░░░░░░░░░░░░░░░░░   0%
Legal/Resources:      ░░░░░░░░░░░░░░░░░░░░   0%
Settings:             ░░░░░░░░░░░░░░░░░░░░   0%

TOTAL:                ████████████░░░░░░░░  ~45%
```
