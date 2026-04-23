# Implementation Plan: Secure Resource Delivery

## Overview

Replace the raw `pdfUrl` link in `ResourceLessonStage` with an inline secure PDF viewer. The API proxies PDF bytes through a new `/view` endpoint (hiding the CDN URL), suppresses `pdfUrl` from lesson responses for non-admin users, and logs every access. The frontend renders PDFs inline using `react-pdf` with a canvas watermark.

## Tasks

- [ ] 1. Database: Add ResourceAccessLog model
  - Add the `ResourceAccessLog` model to `packages/database/prisma/schema.prisma` with fields: `id`, `userId`, `lessonId`, `courseId`, `ip`, `userAgent`, `denied`, `denialReason`, `accessedAt`
  - Add indexes `@@index([userId, lessonId, accessedAt])` and `@@index([lessonId, accessedAt])`
  - No foreign key constraints — audit logs must survive lesson/user deletion
  - Run `prisma migrate dev --name add-resource-access-log` to generate and apply the migration
  - _Requirements: 6.1, 6.2_

- [ ] 2. Contracts: Add hasResource field to LessonDetail
  - In `packages/contracts/src/types.ts`, add `hasResource?: boolean` to the `LessonDetail` interface
  - Add `hasResource?: boolean` to the `StageLesson` type in `apps/web/src/components/classroom/stages/shared.ts`
  - _Requirements: 2.2_

- [ ] 3. API: Create resource-signing lib
  - Create `apps/api/src/lib/resource-signing.ts`
  - Implement `generateSignedUrl(opts: SignedUrlOptions): SignedUrlResult` using HMAC-SHA256 following Bunny CDN token auth spec: `expires = floor(now/1000) + ttl`, `hashableBase = bunnyTokenKey + urlPath + expires`, `token = base64url(sha256(hashableBase))`
  - Read `BUNNY_TOKEN_AUTH_KEY`, `BUNNY_CDN_BASE_URL`, and `RESOURCE_TOKEN_TTL_SECONDS` from `process.env`
  - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 3.1 Write property test for generateSignedUrl — path scoping
    - **Property 1: Signed URL path scoping** — for any two distinct paths A and B, a token generated for A must fail HMAC verification when checked against B
    - **Validates: Requirements 1.5**

  - [ ]* 3.2 Write property test for generateSignedUrl — expiry correctness
    - **Property 2: Signed URL expiry correctness** — for any TTL between 1 and 3600, `expiresAt` must equal `floor(now/1000) + ttl` within 1-second tolerance
    - **Validates: Requirements 1.4**

- [ ] 4. API: Create resource-audit lib
  - Create `apps/api/src/lib/resource-audit.ts`
  - Implement `recordResourceAccess(prisma, event: ResourceAccessEvent): Promise<void>` that writes to `ResourceAccessLog`
  - Implement `checkAccessRateLimit(prisma, userId, lessonId): Promise<boolean>` that counts accesses in the last 60 minutes and returns `true` (rate-limited) when count exceeds 20; emit a `warn`-level log when triggered
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5. API: Add resource endpoints to learning routes
  - In `apps/api/src/modules/learning/routes.ts`, add two new routes under the prefix `/resources/:lessonId`:

  - [ ] 5.1 Implement GET /v1/learning/resources/:lessonId/token
    - Authenticate with `fastify.requireAuth`, look up DB user, look up lesson (`pdfUrl`, `courseId`)
    - Call `assertLessonAccess`; return 404 if `pdfUrl` is null
    - Call `generateSignedUrl` and return `{ signedUrl, expiresAt }`
    - Call `recordResourceAccess` with `denied: false`; log userId, lessonId, expiry per requirement 1.8
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8_

  - [ ] 5.2 Implement GET /v1/learning/resources/:lessonId/view
    - Authenticate, look up DB user and lesson, call `assertLessonAccess`; return 404 if `pdfUrl` is null
    - Generate a signed URL via `generateSignedUrl`, then `fetch` the PDF from Bunny CDN using that URL
    - Stream response bytes to client with headers: `Content-Disposition: inline; filename="resource.pdf"`, `Cache-Control: no-store, no-cache`, `Content-Type: application/pdf`
    - Return 502 if upstream fetch fails or returns non-200; enforce 50 MB size limit (return 413 if exceeded)
    - Call `recordResourceAccess` on both success and denial paths
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2_

  - [ ]* 5.3 Write property test for proxy response headers invariant
    - **Property 8: Proxy response headers invariant** — for any successful `/view` response, headers must always include `Content-Disposition: inline; filename="resource.pdf"` and `Cache-Control: no-store, no-cache`
    - **Validates: Requirements 5.2, 5.3**

- [ ] 6. API: Add admin audit log endpoint
  - In `apps/api/src/modules/admin/routes.ts`, add `GET /v1/admin/resources/:lessonId/access-log`
  - Require ADMIN role; return paginated `ResourceAccessLog` entries for the given lessonId in reverse chronological order
  - _Requirements: 6.5_

- [ ] 7. API: Suppress pdfUrl in catalog service mapLesson
  - In `apps/api/src/modules/catalog/service.ts`, replace the unconditional `if (l.pdfUrl) lesson.pdfUrl = l.pdfUrl` block with role-conditional logic:
    - If `isAdminOrDs`: set `lesson.pdfUrl = l.pdfUrl`
    - Else: set `lesson.hasResource = true`
  - _Requirements: 2.1, 2.2, 2.4_

  - [ ]* 7.1 Write property test for pdfUrl suppression (STUDENT role)
    - **Property 3: pdfUrl suppression for non-admin users** — for any lesson with non-null `pdfUrl` and STUDENT role, `mapLesson` must return `pdfUrl: undefined` and `hasResource: true`
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 7.2 Write property test for pdfUrl preservation (ADMIN/DS role)
    - **Property 4: pdfUrl preserved for admin/DS users** — for any lesson with non-null `pdfUrl` and ADMIN or DS role, `mapLesson` must return `pdfUrl` equal to the original value
    - **Validates: Requirements 2.4**

- [ ] 8. Checkpoint — Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Frontend: Install react-pdf
  - In `apps/web`, run `npm install react-pdf` (or the workspace equivalent)
  - Confirm the package resolves correctly in the Next.js app
  - _Requirements: 3.2_

- [ ] 10. Frontend: Create SecurePdfViewer component
  - Create `apps/web/src/components/classroom/stages/SecurePdfViewer.tsx`
  - Props: `{ courseTitle, lesson: StageLesson, onMarkComplete, progressBusy }`
  - On mount, construct the view URL as `/api/learning/resources/${lesson.id}/view` (the Next.js proxy route created in task 11)
  - Use `react-pdf` `<Document>` and `<Page>` to render pages; track `numPages` and `currentPage`
  - Show a loading spinner while pages render; show an error message + retry button on fetch failure
  - When `lesson.hasResource` is false or absent, render a "Resource Pending" disabled state consistent with existing stage patterns
  - Apply CSS to disable text selection and right-click on the PDF rendering area (`user-select: none`, `onContextMenu` suppressed)
  - Display `lesson.title` and `lesson.synopsis` regardless of PDF loading state
  - Include a Mark Complete button that calls `onMarkComplete` independently of PDF state
  - _Requirements: 3.2, 3.4, 3.6, 3.7, 3.8, 7.3, 7.4, 7.5_

  - [ ]* 10.1 Write property test for mark-complete independence
    - **Property 9: Mark-complete independence from PDF state** — for any viewer state (loading, error, page N), `onMarkComplete` must be invokable and the button must not be disabled due to PDF state
    - **Validates: Requirements 7.4**

  - [ ]* 10.2 Write property test for title and synopsis always rendered
    - **Property 10: Lesson title and synopsis always rendered** — for any lesson with non-empty title and synopsis, both values must appear in rendered output regardless of PDF loading state
    - **Validates: Requirements 7.5**

- [ ] 11. Frontend: Implement canvas watermark in SecurePdfViewer
  - Add a `drawWatermark(canvas, ctx, user)` helper (can be co-located in `SecurePdfViewer.tsx` or extracted to `apps/web/src/lib/watermark.ts`)
  - On each `<Page>` `onRenderSuccess`, draw a canvas overlay absolutely positioned over the page
  - Watermark text: `${displayName ?? uid}\n${email ?? uid}\n${new Date().toISOString().slice(0, 10)}`
  - Set `globalAlpha` between 0.08 and 0.15; rotate canvas 30 degrees; centre diagonally
  - Fall back to Firebase UID if `displayName` or `email` is unavailable
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 11.1 Write property test for watermark opacity invariant
    - **Property 7: Watermark opacity invariant** — for any user data and page dimensions, `drawWatermark` must set `globalAlpha` to a value in [0.08, 0.15]
    - **Validates: Requirements 4.2**

  - [ ]* 11.2 Write property test for watermark contains user identity
    - **Property 6: Watermark contains user identity** — for any user (displayName, email, or UID fallback) and any canvas dimensions, `drawWatermark` must produce a canvas that contains the user's identifying text
    - **Validates: Requirements 4.1, 4.5**

- [ ] 12. Frontend: Add Next.js proxy route
  - Create `apps/web/src/app/api/learning/resources/[lessonId]/view/route.ts`
  - Forward the request to the Fastify API (`process.env.NEXT_PUBLIC_API_URL + /v1/learning/resources/${lessonId}/view`) with the user's auth token
  - Pipe the response stream back to the browser; preserve `Content-Disposition`, `Content-Type`, and `Cache-Control` headers
  - _Requirements: 3.3, 5.1_

- [ ] 13. Frontend: Update LessonStageRenderer to use SecurePdfViewer
  - In `apps/web/src/components/classroom/LessonStageRenderer.tsx`, import `SecurePdfViewer`
  - Replace the `shouldUseResourceStage` branch: render `<SecurePdfViewer>` instead of `<ResourceLessonStage>`
  - _Requirements: 3.1, 7.1, 7.2_

  - [ ]* 13.1 Write property test for LessonStageRenderer routing
    - **Property 5: LessonStageRenderer routes PDF lessons to SecurePdfViewer** — for any lesson where `contentType === "PDF"` or `learningMode === "RESOURCE"`, `LessonStageRenderer` must render `SecurePdfViewer` and not `ResourceLessonStage` or `VideoPlayer`
    - **Validates: Requirements 3.1, 7.1**

- [ ] 14. Frontend: Remove direct pdfUrl link from classroom resources tab
  - Locate the resources tab in `apps/web/src/app/courses` or the classroom page that renders `activeLesson.pdfUrl` as a direct `<a>` link
  - Remove the direct link for non-admin users; the PDF is now viewed inline via `SecurePdfViewer`
  - _Requirements: 2.1, 3.9_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `/token` endpoint (task 5.1) exists for future mobile use; the web viewer uses `/view` exclusively
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Tag format for property tests: `// Feature: secure-resource-delivery, Property N: <property text>`
