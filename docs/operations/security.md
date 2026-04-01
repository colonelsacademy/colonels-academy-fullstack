# Security And Auth

## Current baseline

- Web auth is expected to sign users in with Firebase Auth, then exchange the Firebase ID token for an API session cookie.
- Session login requires a recent sign-in window plus a double-submit CSRF token.
- The API accepts bearer tokens for non-browser clients, but browser-first flows should prefer session cookies.
- Privileged mutation routes should call `requireRole(...)` instead of trusting UI state.
- Rate limiting is enabled at the Fastify layer and can be tightened per route.

## Production expectations

- Keep Firebase admin credentials in the runtime secret manager, not in the repo or CI variables shared broadly.
- Enable `SESSION_COOKIE_SECURE=true` outside localhost.
- Put the API behind TLS termination and a trusted proxy so `x-forwarded-*` headers are reliable.
- Do not expose raw Bunny Stream assets for paid content. Move playback to tokenized or signed URLs before launch.
- Audit all admin and instructor mutation endpoints as they are added.

## Follow-up work

- Add RBAC backed by Postgres roles and permissions, not only Firebase custom claims.
- Add audit-log persistence for admin actions, enrollment changes, and media publishing.
- Add signed Bunny playback for protected lessons and replay assets.
