# Deployment Shape

## Runtime split

- `apps/web`: Next.js frontend
- `apps/api`: Fastify API
- `apps/worker`: BullMQ worker
- Managed Postgres
- Managed Redis

## Deployment principles

- Build once, promote the same artifact through staging and production.
- Keep web, API, and worker independently deployable even though they live in one repo.
- Put the API behind a reverse proxy or load balancer with TLS termination, request ID forwarding, and proxy trust configured.
- Use readiness probes for API and worker startup, not just process-up checks.

## What not to do

- Do not collapse the worker into the API process in production.
- Do not share a single mutable VM filesystem as the source of truth.
- Do not apply schema changes by shelling into the server and running ad hoc commands.

## Next infra step

- Choose the target hosting stack, then add environment-specific deploy manifests or IaC for web, API, worker, Postgres, Redis, secrets, and backups.
