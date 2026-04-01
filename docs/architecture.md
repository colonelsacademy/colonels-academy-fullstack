# Architecture Notes

## Core decision

This codebase stays a modular monolith at the business-domain level, but it is organized as an enterprise monorepo at the repository level.

That means:

- `apps/web` owns the frontend surface
- `apps/mobile` owns the native iOS and Android surface
- `apps/api` owns request-time business logic
- `apps/worker` owns asynchronous job execution
- `packages/api-client` owns typed transport helpers shared by web and mobile
- `packages/database` owns Prisma and database access
- `packages/contracts` owns shared API-facing types and starter data
- `packages/design-tokens` owns shared visual tokens
- `packages/ui` owns reusable React presentation components
- `packages/config` owns environment parsing and queue/runtime constants

This keeps the runtime boundaries clean without forcing premature service sprawl.

## Modules

### Identity

- Firebase Auth handles sign-in on the client.
- Fastify now supports both Firebase ID tokens and Firebase-backed session cookies.
- Session login is a server exchange guarded by CSRF and recent-sign-in checks.
- App roles still live in Postgres so authorization can evolve independently from Firebase claims.
- The web layer should consume auth state from the API rather than embedding privileged business rules in React pages.
- The mobile layer should keep auth native and send bearer ID tokens to Fastify over HTTPS instead of relying on browser cookie behavior.

### Mobile

- Expo Router gives the mobile app a file-based navigation model that stays conceptually close to the Next.js app router.
- The native app shares contracts, design tokens, and the typed API client with web.
- Native screens stay native. Do not try to reuse Next.js page components inside React Native.
- EAS should handle build and store delivery once distribution is wired.

### Catalog

- Courses, instructors, landing-page copy, and schedule summaries belong in the catalog module.
- The same module feeds public marketing pages and authenticated learning pages.

### Learning

- Enrollments, progress tracking, lessons, and live-session schedules stay in one learning module.
- There is no separate learning service yet because the product domain is still tightly coupled.

### Media

- Bunny Stream owns storage and playback.
- The API stores video metadata, access rules, and lesson associations.
- BullMQ handles async tasks such as syncing asset status, fan-out notifications, or transcoding-related follow-up work.
- Queue consumption runs in `apps/worker`, not inside the API server process.

### Admin

- Admin stays in the same Next.js app for now.
- Keeping admin inside the same codebase avoids duplicate auth, design, routing, and deployment concerns.
- A separate admin backend only becomes worth it when traffic patterns, teams, or security boundaries demand it.

## Monorepo guardrails

- The frontend cannot import API or worker internals.
- Shared contracts live in `packages/contracts`, not inside backend source folders.
- Database schema and client ownership live in `packages/database`, not at the repo root.
- CI runs targeted build checks and boundary validation before merges.
- Queue workers stay in `apps/worker`, so HTTP request latency and background job execution remain isolated.

## Operations stance

- `/v1/health/live` only answers whether the process is up.
- `/v1/health/ready` checks database and configured infrastructure before reporting ready.
- Production schema changes should ship through Prisma migrations and `db:deploy`, never via ad hoc `db push`.
- Rollback, backup, and release expectations are documented under `docs/operations/`.

## WebSocket policy

Do not add WebSockets as baseline infrastructure.

Start with:

- normal request-response APIs
- background jobs through the worker app
- polling or server-driven revalidation where it is enough

Only add WebSockets when the user experience clearly requires push-style interactivity, such as:

- instructor presence during a live cohort session
- chat or Q and A
- collaborative classroom tools
- proctoring or synchronized countdown events

If that moment comes, add WebSockets behind a single classroom-focused module instead of spreading them across the whole stack.
