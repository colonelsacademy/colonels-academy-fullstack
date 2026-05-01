# Colonels Academy Platform

An enterprise-leaning monorepo for Colonels Academy:

- Web: Next.js + React + TypeScript
- Mobile: Expo + React Native + TypeScript
- API: Fastify + Node.js
- Worker: BullMQ queue consumers
- Data: Postgres + Prisma
- Auth: Firebase Auth
- Cache and queues: Redis + BullMQ
- Video: Bunny Stream

## Repository shape

```text
apps/
  web/        Next.js App Router frontend
  mobile/     Expo Router app for iOS and Android
  api/        Fastify API and request-time business logic
  worker/     BullMQ background workers
packages/
  api-client/ Typed API client shared by web and mobile
  contracts/  Shared API contracts and domain data
  config/     Environment loaders and queue/runtime config
  database/   Prisma schema, seed, and database client package
  design-tokens/ Shared brand tokens for cross-platform theming
  ui/         Shared React UI components
docs/
  architecture.md
  operations/
```

This is intentionally one repository, but not a single-folder monolith. The apps are separate deployables that share only explicit packages.

## Tooling

- Package manager: `pnpm`
- Task orchestration: `turbo`
- Boundary guardrails: `scripts/check-boundaries.mjs`
- CI: `.github/workflows/ci.yml`

The web app is not allowed to import backend internals. That rule is enforced locally with `pnpm check:boundaries` and in CI.

## Getting started

1. Copy `.env.example` to `.env` and fill in Firebase and Bunny credentials.
2. Install dependencies with `corepack pnpm install`.
3. Run one-time local bootstrap with `corepack pnpm dev:setup` (starts DB containers, generates Prisma client, pushes schema, seeds data).
4. Start the apps with `corepack pnpm dev`.
5. Start the mobile app separately with `corepack pnpm dev:mobile`.

Local DB helper commands:

- `corepack pnpm dev:setup`: start DB + apply schema + seed data
- `corepack pnpm dev:full`: run setup, then start all dev servers
- `corepack pnpm dev:reset`: wipe local DB volumes, recreate schema, reseed
- `corepack pnpm db:studio`: open Prisma Studio

Default local endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Mobile: Expo dev server via `apps/mobile`

Health and readiness endpoints:

- API liveness: `GET /v1/health/live`
- API readiness: `GET /v1/health/ready`
- API compatibility health: `GET /v1/health`

Session auth endpoints:

- CSRF token bootstrap: `GET /v1/auth/csrf`
- Session introspection: `GET /v1/auth/session`
- Session login exchange: `POST /v1/auth/session-login`
- Session logout: `POST /v1/auth/session-logout`

Mobile env:

- `EXPO_PUBLIC_API_BASE_URL` should point at a network-reachable API address for the simulator or device.
- `EXPO_PUBLIC_FIREBASE_*` variables configure Firebase client auth inside the Expo app.
- Mobile uses Firebase bearer ID tokens with Fastify. Web keeps the session-cookie flow.

## Validation

- `corepack pnpm check:boundaries`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `corepack pnpm validate`

## Database workflow

- Local prototyping can use `corepack pnpm db:push`.
- Team development should move to named migrations with `corepack pnpm db:migrate`.
- Staging and production must use `corepack pnpm db:deploy`.
- Before any release, inspect migration state with `corepack pnpm db:status`.

## DB + Git workflow

Use this when changing database schema in this repo:

1. Create schema changes in `packages/database/prisma/schema.prisma`.
2. Generate a migration with `corepack pnpm db:migrate` (creates SQL in `packages/database/prisma/migrations/...`).
3. Run `corepack pnpm db:seed` if seed data needs updates.
4. Commit these together in Git:
   - `packages/database/prisma/schema.prisma`
   - new migration directory under `packages/database/prisma/migrations/`
   - seed changes in `packages/database/prisma/seed.ts` (if any)
5. Do **not** commit local env secrets (`.env`, `.env.local`).

For simple local-only experiments, `corepack pnpm db:push` is fine, but before sharing work open a proper migration with `corepack pnpm db:migrate`.

## Architectural stance

- Keep one repo, not a polyrepo.
- Keep one backend domain boundary, not premature microservices.
- Add one Expo app for iOS and Android, not separate native repos.
- Run queue processing in `apps/worker`, not inside the API runtime.
- Share contracts, not backend internals.
- Add WebSockets only if a classroom feature truly needs realtime behavior.
- Use Firebase-backed session cookies for web auth instead of pushing business logic into React pages.
- Use Firebase bearer ID tokens for native mobile auth instead of trying to reuse browser cookies.
- Treat readiness, backups, rollback, and migration discipline as product features, not later chores.
