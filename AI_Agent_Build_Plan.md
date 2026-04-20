
# Course Platform – Full System Architecture & Build Instructions (For AI Agent)

## 1. Project Overview
This project is a course selling and learning platform with:
- Web App (Next.js) → Course purchase + Admin panel
- Mobile App (Expo React Native) → Course consumption (watch videos, quizzes)
- Backend API (Fastify)
- Background Worker (BullMQ)
- Database (PostgreSQL)
- Queue (Redis)
- Video Storage & CDN (Bunny.net)
- Authentication (Firebase Auth)
- Push Notifications (Firebase FCM)
- Monorepo (Turborepo + pnpm)
- Mobile Builds (EAS Build)

IMPORTANT BUSINESS RULE:
Mobile app is CONSUMPTION ONLY.
No payments, no checkout, no Khalti/eSewa inside mobile app.
Users must purchase courses on the website only.

---

## 2. Monorepo Structure

apps/
  web/        → Next.js web app
  mobile/     → Expo React Native app
  api/        → Fastify backend
  worker/     → BullMQ worker

packages/
  contracts/      → Shared TypeScript types (DTOs, API types)
  api-client/     → Shared API client (used by web + mobile)
  auth-core/      → Auth helpers
  app-core/       → Business logic
  design-tokens/  → Colors, fonts, spacing
  ui-web/         → Web components
  ui-mobile/      → Mobile components
  database/       → DB schema & migrations
  config/         → Shared config

CRITICAL RULE:
Mobile app MUST import types and API client from:
- packages/contracts
- packages/api-client

Do NOT rewrite API calls inside mobile app.

---

## 3. Mobile App Architecture

### Mobile Tech Stack
- Expo
- React Native
- TypeScript
- Expo Router
- Zustand (state)
- React Query (server state)
- MMKV (local storage + cache persister)
- Firebase Auth (login)
- Firebase FCM (push notifications)
- react-native-video (HLS video player)
- EAS Build (build system)

IMPORTANT:
Use Expo Prebuild because react-native-video requires native modules.

---

## 4. Mobile App Responsibilities
Mobile app is ONLY for:
- Login
- View purchased courses
- Watch videos
- Take quizzes
- Track progress
- Receive notifications

Mobile app must NOT include:
- Payment
- Checkout
- Khalti
- eSewa
- Pricing purchase flow

---

## 5. Authentication Flow (Mobile)

1. User logs in via Firebase Auth
2. Firebase returns ID Token
3. Mobile sends token to Fastify API
4. Fastify verifies token using Firebase Admin SDK
5. API returns user data from PostgreSQL
6. User is authenticated

Mobile uses Bearer Token for API requests.

---

## 6. Video Streaming Flow

1. Videos stored in Bunny Storage
2. Delivered via Bunny CDN
3. API generates Signed URL
4. Mobile app plays video using react-native-video
5. Format: HLS (.m3u8), not raw MP4

This prevents piracy.

---

## 7. Backend Architecture

### Fastify API
Handles:
- Users
- Courses
- Modules
- Lessons
- Enrollments
- Progress
- Quizzes
- Payments (web only)
- Signed video URLs
- Admin APIs

### PostgreSQL
Main database tables:
- users
- courses
- modules
- lessons
- videos
- enrollments
- progress
- quizzes
- questions
- quiz_attempts
- payments
- certificates

### Redis
Used for:
- BullMQ queue
- Caching
- Rate limiting

### BullMQ Worker
Handles background jobs:
- Send emails
- Send push notifications
- Generate certificates
- Video processing
- Reports
- Payment retries

---

## 8. Push Notifications Flow

Worker → Firebase FCM → Mobile App

Notifications:
- New course
- Quiz result
- Payment success
- Study reminder
- Announcement

---

## 9. Mobile Offline Support (Important for Nepal Network)

Use:
- React Query + MMKV persister
- Cache course list
- Cache course modules
- Cache progress
- Store quiz answers offline and sync later

App must work on slow or unstable internet.

---

## 10. Full System Flow

Mobile App → Firebase Auth → Fastify API → PostgreSQL
Mobile App → Fastify API → Bunny CDN (Video)
Fastify API → Redis → BullMQ Worker
Worker → Firebase FCM → Push Notifications
Web App → Fastify API → PostgreSQL
Admin → Upload Video → Bunny Storage

---

## 11. Technology Summary

| Component | Technology |
|-----------|------------|
| Mobile | Expo React Native |
| Web | Next.js |
| API | Fastify |
| Database | PostgreSQL |
| Queue | Redis |
| Worker | BullMQ |
| Storage/CDN | Bunny |
| Auth | Firebase Auth |
| Notifications | Firebase FCM |
| Video Player | react-native-video |
| Mobile Build | EAS Build |
| Monorepo | Turborepo |
| Package Manager | pnpm |

---

## 12. What the AI Agent Should Build (Order)

1. Setup Monorepo (Turborepo + pnpm)
2. Setup PostgreSQL schema
3. Setup Fastify API
4. Setup Firebase Auth
5. Build Web App (course purchase + admin)
6. Integrate Payment (Khalti/eSewa) on Web
7. Setup Bunny Storage + Signed URLs
8. Setup BullMQ + Redis Worker
9. Build Mobile App (Expo)
10. Integrate react-native-video
11. Add Offline Caching (MMKV + React Query)
12. Setup Push Notifications (FCM)
13. Build using EAS
14. Deploy Web + API (Hetzner)
15. Publish Mobile App (Play Store + App Store)



                ┌──────────────┐
                │   Mobile App │ (Expo)
                └──────┬───────┘
                       │
                       │ Firebase Auth (Login)
                       │
                ┌──────▼───────┐
                
                │   Fastify API│
                └──────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   PostgreSQL       Redis         Bunny CDN
   (Database)      (Queue)      (Video Stream)
                       │
                       ▼
                   BullMQ Worker
                       │
                       ▼
                 Firebase FCM
                (Push Notifications)

                ▲
                │
         ┌──────┴──────┐
         │   Web App   │ (Next.js)
         └─────────────┘