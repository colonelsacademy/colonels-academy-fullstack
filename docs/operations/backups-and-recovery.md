# Backups And Recovery

## Minimum policy

- Use managed Postgres backups with point-in-time recovery enabled before accepting paid enrollments.
- Snapshot Redis only for resilience, not as a source of truth.
- Treat BullMQ jobs as replayable. Jobs must be idempotent because queues can be retried after incidents.

## Recovery drills

- Practice restoring staging from a recent production backup before launch.
- Verify that Prisma migrations can run cleanly against restored data.
- Confirm the worker can resume queue processing without duplicating user-visible side effects.

## Ownership

- Database restore ownership belongs to the platform or backend on-call.
- Queue replay ownership belongs to the service owner who owns the affected domain workflow.
- Recovery notes should be added to the incident timeline while the event is active.
