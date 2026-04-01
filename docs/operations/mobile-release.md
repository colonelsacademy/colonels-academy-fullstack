# Mobile Release Notes

## Build shape

- `apps/mobile` is one Expo app that produces both iOS and Android binaries.
- Internal builds should run through the `development` or `preview` EAS profiles.
- Store builds should run through the `production` EAS profile.

## Auth stance

- Mobile sends Firebase bearer ID tokens to Fastify.
- Do not reuse the web session-cookie flow in native clients.
- Protected mobile screens should gracefully degrade when Firebase config is absent in local development.

## Distribution checklist

1. Verify `EXPO_PUBLIC_API_BASE_URL` points to the correct staging or production API.
2. Verify `EXPO_PUBLIC_FIREBASE_*` values match the mobile Firebase app.
3. Run `corepack pnpm --filter @colonels-academy/mobile run build` for bundle validation.
4. Run EAS internal distribution before store submission.
5. Smoke test auth, course browsing, dashboard loading, and schedule rendering on at least one iOS and one Android device class.
