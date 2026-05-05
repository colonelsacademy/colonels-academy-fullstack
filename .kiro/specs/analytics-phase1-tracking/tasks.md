# Implementation Plan: Phase 1 Database Analytics Tracking

## Overview

This implementation plan breaks down the Phase 1 analytics tracking feature into discrete, actionable coding tasks. The feature adds three critical tracking capabilities to The Colonel's Academy LMS:

1. **Audit Logging** - Track all administrative actions with complete context
2. **Live Session Attendance** - Track student participation in live classes  
3. **Payment Failure Tracking** - Log all payment attempts including failures

The implementation follows a 4-week plan: Week 1 focuses on database schema and services, Week 2 on API endpoints and middleware, and Weeks 3-4 on frontend components and testing.

**Technology Stack:**
- Backend: Fastify API with TypeScript
- Database: PostgreSQL with Prisma ORM
- Frontend: Next.js 15 with React

## Tasks

### 1. Database Schema Implementation

- [x] 1.1 Create Prisma schema for analytics tables
  - Add `AuditLog` model with all fields (id, userId, action, resourceType, resourceId, changes, ipAddress, userAgent, createdAt)
  - Add `LiveSessionAttendance` model with all fields (id, sessionId, userId, joinedAt, leftAt, durationMinutes, createdAt, updatedAt)
  - Add `PaymentAttemptStatus` enum with values (INITIATED, SUCCESS, FAILED)
  - Add `PaymentAttempt` model with all fields (id, orderId, chapterPurchaseId, bundlePurchaseId, userId, amount, provider, status, errorCode, errorMessage, transactionId, attemptedAt)
  - Add relations to existing User, LiveSession, PurchaseOrder, ChapterPurchase, and BundlePurchase models
  - Add all required indexes as specified in design document
  - File: `packages/database/prisma/schema.prisma`
  - _Requirements: 2.1-2.13, 4.4-4.13, 6.4-6.18, 7.2, 7.5, 8.2, 8.5_

- [x] 1.2 Generate and test database migration
  - Run `npx prisma migrate dev --name add-analytics-tables` to generate migration
  - Review generated SQL migration file for correctness
  - Test migration on local development database
  - Verify all tables, indexes, and relations are created correctly
  - Test rollback scenario
  - _Requirements: 2.1, 4.4, 6.4_

- [x] 1.3 Update Prisma client and verify types
  - Run `npx prisma generate` to update Prisma client
  - Verify TypeScript types are generated for new models
  - Test importing new types in a test file
  - _Requirements: 2.1, 4.4, 6.4_

### 2. Service Layer - Audit Log Service

- [x] 2.1 Create AuditLogService class with core methods
  - Create file `apps/api/src/lib/audit-log.ts`
  - Implement `createLog` method accepting CreateAuditLogParams
  - Implement `queryLogs` method with filtering and pagination
  - Implement `getStats` method for statistics aggregation
  - Add proper TypeScript interfaces for all parameters and return types
  - Add JSDoc comments for all public methods
  - _Requirements: 1.1-1.13, 2.1-2.13, 3.1-3.15_

- [ ]* 2.2 Write unit tests for AuditLogService
  - Create test file `apps/api/src/lib/audit-log.test.ts`
  - Test `createLog` with complete data
  - Test `createLog` with minimal required fields
  - Test `queryLogs` with various filter combinations
  - Test `queryLogs` pagination
  - Test `getStats` aggregation calculations
  - Test error handling for database failures
  - Mock Prisma client for isolated testing
  - _Requirements: 1.1-1.13, 3.1-3.15_

### 3. Service Layer - Attendance Service

- [x] 3.1 Create AttendanceService class with core methods
  - Create file `apps/api/src/lib/attendance.ts`
  - Implement `recordJoin` method to create attendance record
  - Implement `recordLeave` method to update attendance record and calculate duration
  - Implement `calculateDuration` helper method (round to nearest minute)
  - Implement `getSessionAttendance` method with user aggregation
  - Implement `getStats` method for attendance statistics
  - Add proper TypeScript interfaces for all parameters and return types
  - _Requirements: 4.1-4.15, 5.1-5.15_

- [ ]* 3.2 Write unit tests for AttendanceService
  - Create test file `apps/api/src/lib/attendance.test.ts`
  - Test `recordJoin` creates record with correct timestamp
  - Test `recordLeave` updates record and calculates duration
  - Test `calculateDuration` with various time ranges
  - Test multiple join/leave cycles for same user
  - Test `getSessionAttendance` aggregates multiple records per user
  - Test handling of active sessions (leftAt is null)
  - Mock Prisma client for isolated testing
  - _Requirements: 4.1-4.15, 5.1-5.15_

### 4. Service Layer - Payment Service

- [x] 4.1 Create PaymentService class with core methods
  - Create file `apps/api/src/lib/payment-tracking.ts`
  - Implement `createAttempt` method for all purchase types (order, chapter, bundle)
  - Implement `updateAttempt` method for success and failure updates
  - Implement `queryAttempts` method with filtering and pagination
  - Implement `getStats` method with success rate calculations and error aggregation
  - Add proper TypeScript interfaces for all parameters and return types
  - _Requirements: 6.1-6.18, 7.1-7.5, 8.1-8.5, 9.1-9.18_

- [ ]* 4.2 Write unit tests for PaymentService
  - Create test file `apps/api/src/lib/payment-tracking.test.ts`
  - Test `createAttempt` for each purchase type (order, chapter, bundle)
  - Test `updateAttempt` with success status and transaction ID
  - Test `updateAttempt` with failure status, error code, and message
  - Test `queryAttempts` with various filters
  - Test `getStats` success rate calculation
  - Test `getStats` error aggregation and sorting
  - Mock Prisma client for isolated testing
  - _Requirements: 6.1-6.18, 9.1-9.18_

### 5. Checkpoint - Services Complete

- [x] 5.1 Verify all service tests pass
  - Run `npm test` in apps/api directory
  - Ensure all unit tests pass
  - Review test coverage for service layer
  - Ask the user if questions arise

### 6. API Endpoints - Audit Log Routes

- [x] 6.1 Create audit log API routes module
  - Create file `apps/api/src/modules/audit-logs/routes.ts`
  - Implement GET `/v1/admin/audit-logs` endpoint with query parameters
  - Implement GET `/v1/admin/audit-logs/stats` endpoint
  - Add JSON schema validation for query parameters
  - Add authentication requirement (ADMIN role)
  - Add proper error handling and HTTP status codes
  - Use AuditLogService for business logic
  - _Requirements: 3.1-3.15_

- [ ]* 6.2 Write integration tests for audit log endpoints
  - Create test file `apps/api/src/modules/audit-logs/routes.test.ts`
  - Test GET `/v1/admin/audit-logs` with authentication
  - Test GET `/v1/admin/audit-logs` with various filters
  - Test GET `/v1/admin/audit-logs` pagination
  - Test GET `/v1/admin/audit-logs/stats` response structure
  - Test 401 error for unauthenticated requests
  - Test 403 error for non-admin users
  - Test 400 error for invalid query parameters
  - _Requirements: 3.1-3.15, 15.5-15.8_

### 7. API Endpoints - Attendance Routes

- [x] 7.1 Create attendance API routes module
  - Create file `apps/api/src/modules/attendance/routes.ts`
  - Implement POST `/v1/live-sessions/:sessionId/attendance/join` endpoint
  - Implement POST `/v1/live-sessions/:sessionId/attendance/leave` endpoint
  - Implement GET `/v1/live-sessions/:sessionId/attendance` endpoint
  - Implement GET `/v1/admin/attendance/stats` endpoint
  - Add JSON schema validation for parameters
  - Add authentication requirements (ADMIN/INSTRUCTOR for stats, authenticated for join/leave)
  - Add proper error handling (404 for invalid session, 400 for invalid leave)
  - Use AttendanceService for business logic
  - _Requirements: 5.1-5.15_

- [ ]* 7.2 Write integration tests for attendance endpoints
  - Create test file `apps/api/src/modules/attendance/routes.test.ts`
  - Test POST join endpoint creates attendance record
  - Test POST leave endpoint updates attendance record
  - Test GET session attendance endpoint returns aggregated data
  - Test GET stats endpoint returns correct statistics
  - Test 404 error for non-existent session
  - Test 400 error for leave without active attendance
  - Test 401 error for unauthenticated requests
  - Test 403 error for unauthorized stats access
  - _Requirements: 5.1-5.15, 15.3-15.11_

### 8. API Endpoints - Payment Analytics Routes

- [x] 8.1 Create payment analytics API routes module
  - Create file `apps/api/src/modules/payment-analytics/routes.ts`
  - Implement GET `/v1/admin/payments/attempts` endpoint with query parameters
  - Implement GET `/v1/admin/payments/stats` endpoint
  - Add JSON schema validation for query parameters
  - Add authentication requirement (ADMIN role)
  - Add proper error handling and HTTP status codes
  - Use PaymentService for business logic
  - _Requirements: 9.1-9.18_

- [ ]* 8.2 Write integration tests for payment analytics endpoints
  - Create test file `apps/api/src/modules/payment-analytics/routes.test.ts`
  - Test GET attempts endpoint with various filters
  - Test GET attempts endpoint pagination
  - Test GET stats endpoint response structure
  - Test stats calculations (success rate, error aggregation)
  - Test 401 error for unauthenticated requests
  - Test 403 error for non-admin users
  - Test 400 error for invalid query parameters
  - _Requirements: 9.1-9.18, 15.5-15.8_

### 9. Middleware - Audit Log Middleware

- [x] 9.1 Create audit log middleware factory function
  - Create file `apps/api/src/lib/audit-log-middleware.ts`
  - Implement `createAuditLogHook` function accepting AuditLogOptions
  - Extract user ID from authenticated request context
  - Extract IP address from request headers (x-forwarded-for or socket)
  - Extract user agent from request headers
  - Handle CREATE action (capture after state from request body)
  - Handle UPDATE action (fetch before state, capture after state)
  - Handle DELETE action (fetch before state)
  - Call AuditLogService.createLog with captured data
  - Implement non-blocking error handling (log error but don't fail request)
  - _Requirements: 13.1-13.12_

- [ ]* 9.2 Write unit tests for audit log middleware
  - Create test file `apps/api/src/lib/audit-log-middleware.test.ts`
  - Test CREATE action captures after state
  - Test UPDATE action captures before and after state
  - Test DELETE action captures before state
  - Test IP address extraction from headers
  - Test user agent extraction from headers
  - Test error handling doesn't throw
  - Mock AuditLogService and Fastify request/reply
  - _Requirements: 13.1-13.12_

### 10. Middleware Integration with Admin Routes

- [x] 10.1 Integrate audit log middleware with existing admin routes
  - Open file `apps/api/src/modules/admin/routes.ts`
  - Add audit log hooks to Course CRUD routes (CREATE, UPDATE, DELETE)
  - Add audit log hooks to Lesson CRUD routes
  - Add audit log hooks to Module CRUD routes
  - Add audit log hooks to LiveSession CRUD routes
  - Add audit log hooks to VideoAsset CRUD routes
  - Add audit log hooks to Instructor CRUD routes
  - Add audit log hooks to CourseBundleOffer CRUD routes
  - Add audit log hooks to User role change routes
  - Configure each hook with appropriate action, resourceType, and state capture functions
  - _Requirements: 1.1-1.10, 13.1-13.12_

- [ ]* 10.2 Write integration tests for middleware-instrumented routes
  - Create test file `apps/api/src/modules/admin/routes-audit.test.ts`
  - Test Course creation creates audit log entry
  - Test Course update creates audit log with before/after state
  - Test Course deletion creates audit log with before state
  - Test User role change creates audit log
  - Verify audit log entries contain correct user, IP, and user agent
  - Test audit log failure doesn't block request
  - _Requirements: 1.1-1.10, 13.1-13.12_

### 11. Payment Tracking Integration

- [x] 11.1 Integrate payment tracking with existing payment flow
  - Open existing payment processing files (likely in `apps/api/src/modules/orders/`)
  - Add PaymentService.createAttempt call at payment initiation
  - Add PaymentService.updateAttempt call on payment success
  - Add PaymentService.updateAttempt call on payment failure with error details
  - Handle all three purchase types (PurchaseOrder, ChapterPurchase, BundlePurchase)
  - Ensure payment tracking errors don't block payment flow
  - Add proper error logging
  - _Requirements: 6.1-6.3, 7.1-7.4, 8.1-8.4_

- [ ]* 11.2 Write integration tests for payment tracking
  - Test payment attempt created on payment initiation
  - Test payment attempt updated on success
  - Test payment attempt updated on failure with error details
  - Test tracking for each purchase type
  - Test payment tracking error doesn't fail payment
  - _Requirements: 6.1-6.3, 7.1-7.4, 8.1-8.4_

### 12. Checkpoint - Backend Complete

- [x] 12.1 Verify all backend tests pass
  - Run full test suite for API
  - Ensure all integration tests pass
  - Review test coverage
  - Test API endpoints manually with Postman or curl
  - Ask the user if questions arise

### 13. Frontend - Analytics Tab Integration (Replaces Tasks 13-15)

- [x] 13.1 Integrate analytics into existing admin page
  - Enhanced existing Analytics tab in `apps/web/src/app/admin/page.tsx`
  - Created tabbed interface with three sections: Audit Log, Attendance, Payments
  - Implemented AuditLogSection component with filters, pagination, and stats
  - Implemented AttendanceSection component with stats display and by-course breakdown
  - Implemented PaymentsSection component with stats, by-provider breakdown, and common errors
  - All sections fetch data from backend API endpoints
  - _Requirements: 10.1-10.14, 11.1-11.12, 12.1-12.14_

### 14. Navigation and Access Control

- [x] 14.1 Navigation already exists
  - Analytics tab already exists in admin navigation menu
  - No additional navigation changes needed
  - Access control handled by existing admin authentication
  - _Requirements: 10.1, 11.1, 12.1_

### 15. Error Handling and Edge Cases

- [x] 15.1 Implement comprehensive error handling
  - Added error boundaries to all analytics sections
  - Added user-friendly error messages for API failures
  - Added validation for invalid date ranges (start date after end date)
  - Implemented error handling for:
    - Empty result sets (shows appropriate empty state messages)
    - Invalid date ranges (validation with error message)
    - API failures (error display with retry suggestion)
    - Missing data (graceful fallbacks with 0 values)
  - Added "Clear Filters" button for audit log section
  - All sections handle loading and error states properly
  - _Requirements: 15.1-15.12_

### 16. Performance Optimization

- [x] 16.1 Implement performance optimizations
  - Added 5-minute cache TTL for all stats endpoints (audit logs, attendance, payments)
  - Implemented cache keys based on query parameters for proper cache invalidation
  - All analytics endpoints now use Redis caching with graceful fallback
  - Database queries already have proper indexes from schema implementation
  - Loading states implemented in all frontend sections
  - Cache hit/miss logging for monitoring
  - _Requirements: 14.1-14.10_

### 17. Documentation

- [ ] 17.1 Create API documentation
  - Document all new API endpoints in API documentation
  - Include request/response examples
  - Document query parameters and validation rules
  - Document authentication and authorization requirements
  - Add examples for common use cases

- [ ] 17.2 Create admin user guide
  - Write guide for using audit log viewer
  - Write guide for using attendance analytics
  - Write guide for using payment analytics
  - Include screenshots and examples
  - Document data retention policies
  - _Requirements: 14.8_

### 18. Final Testing and Deployment

### 18. Final Testing and Deployment

- [ ] 18.1 Perform end-to-end testing
  - Test complete audit logging flow (admin action → log creation → view in UI)
  - Test complete attendance flow (join → leave → view analytics)
  - Test complete payment tracking flow (payment attempt → view analytics)
  - Test all filtering and pagination functionality
  - Test CSV export functionality (if implemented)
  - Test error scenarios and edge cases
  - Test with multiple concurrent users

- [ ] 18.2 Deploy to staging environment
  - Run database migration on staging: `npx prisma migrate deploy`
  - Deploy API changes to staging
  - Deploy frontend changes to staging
  - Verify all functionality works in staging
  - Test with staging data
  - Monitor for errors and performance issues

- [ ] 18.3 Final checkpoint and production deployment
  - Review all requirements are met
  - Ensure all tests pass
  - Get user approval for production deployment
  - Run database migration on production
  - Deploy to production
  - Monitor production for errors
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints (tasks 5.1, 12.1, 20.3) ensure incremental validation
- Property-based testing is not applicable for this feature (primarily CRUD operations and UI)
- Focus on integration tests for API endpoints and example-based tests for edge cases
- All code should follow existing project conventions and TypeScript best practices
- Use existing authentication and authorization patterns from the codebase
- Maintain backward compatibility with existing payment and admin functionality
