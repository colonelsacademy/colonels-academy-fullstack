# Release Runbook

## Environments

- Local: developers can use `db:push` while the schema is still changing rapidly.
- Staging: deploy the same web, API, and worker images or artifacts planned for production.
- Production: only deploy from CI after staging validation passes.

## Release checklist

1. Run `corepack pnpm install`.
2. Run `corepack pnpm db:generate`.
3. Run `corepack pnpm validate`.
4. Review pending Prisma migrations with `corepack pnpm db:status`.
5. Apply migrations in staging with `corepack pnpm db:deploy`.
6. Smoke test web, API readiness, queue processing, and auth session exchange in staging.
7. Promote the same build to production and run `corepack pnpm db:deploy`.

## Rollback stance

- Prefer roll-forward when the schema change is backward compatible.
- If a release must be rolled back, first confirm whether the database migration is reversible.
- Keep application deploy rollback separate from database rollback. A reverted app must still understand the deployed schema.
- Every production migration should ship with an operator note describing rollback and data-risk implications.
