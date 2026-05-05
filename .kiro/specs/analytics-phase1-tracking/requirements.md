# Requirements Document: Phase 1 Database Analytics Tracking

## Introduction

This document specifies requirements for Phase 1 of the database analytics audit implementation. Phase 1 addresses three critical missing analytics capabilities in The Colonel's Academy LMS:

1. **Audit Logging** - Complete tracking of administrative actions for compliance and security
2. **Live Session Attendance** - Tracking of student participation in live classes
3. **Payment Failure Tracking** - Comprehensive logging of all payment attempts including failures

These capabilities are essential for compliance, security, engagement measurement, and revenue optimization.

## Glossary

- **Admin_User**: A user with role ADMIN who can perform administrative actions
- **Audit_Log_System**: The system component responsible for capturing and storing administrative action records
- **Live_Session_Tracker**: The system component that records student attendance in live sessions
- **Payment_Tracker**: The system component that logs all payment attempts and outcomes
- **Admin_Action**: Any create, update, or delete operation performed by an Admin_User on system resources
- **Attendance_Record**: A record of a student joining and leaving a live session
- **Payment_Attempt**: A single attempt to process a payment transaction
- **API_Endpoint**: A REST API route that handles HTTP requests
- **Admin_Dashboard**: The web interface used by Admin_Users to view system data and analytics

## Requirements

### Requirement 1: Audit Log Data Capture

**User Story:** As a system administrator, I want all administrative actions to be logged with complete context, so that I can track who changed what, when, and why for compliance and security purposes.

#### Acceptance Criteria

1. WHEN an Admin_User creates a Course, THE Audit_Log_System SHALL record the action with user ID, timestamp, resource type, resource ID, and complete new resource data
2. WHEN an Admin_User updates a Course, THE Audit_Log_System SHALL record the action with before and after state of all changed fields
3. WHEN an Admin_User deletes a Course, THE Audit_Log_System SHALL record the action with the complete resource state before deletion
4. WHEN an Admin_User changes a User role, THE Audit_Log_System SHALL record the action with the previous role and new role
5. WHEN an Admin_User creates or updates a Lesson, THE Audit_Log_System SHALL record the action with complete resource data
6. WHEN an Admin_User creates or updates a Module, THE Audit_Log_System SHALL record the action with complete resource data
7. WHEN an Admin_User creates or updates a LiveSession, THE Audit_Log_System SHALL record the action with complete resource data
8. WHEN an Admin_User uploads or modifies a VideoAsset, THE Audit_Log_System SHALL record the action with asset metadata
9. WHEN an Admin_User creates or updates an Instructor, THE Audit_Log_System SHALL record the action with complete resource data
10. WHEN an Admin_User creates or updates a CourseBundleOffer, THE Audit_Log_System SHALL record the action with complete resource data
11. FOR ALL audit log entries, THE Audit_Log_System SHALL capture the IP address of the request
12. FOR ALL audit log entries, THE Audit_Log_System SHALL capture the user agent string of the request
13. FOR ALL audit log entries, THE Audit_Log_System SHALL store a timestamp with millisecond precision

### Requirement 2: Audit Log Storage

**User Story:** As a system administrator, I want audit logs to be stored in a queryable database table, so that I can search and analyze administrative actions.

#### Acceptance Criteria

1. THE Audit_Log_System SHALL store audit log entries in a PostgreSQL table named AuditLog
2. THE AuditLog table SHALL include a unique identifier field of type CUID
3. THE AuditLog table SHALL include a userId field referencing the User table
4. THE AuditLog table SHALL include an action field storing the action type as a string
5. THE AuditLog table SHALL include a resourceType field storing the resource type as a string
6. THE AuditLog table SHALL include a resourceId field storing the resource identifier as a string
7. THE AuditLog table SHALL include a changes field storing before and after state as JSON
8. THE AuditLog table SHALL include an ipAddress field storing the client IP address as a string
9. THE AuditLog table SHALL include a userAgent field storing the client user agent as a string
10. THE AuditLog table SHALL include a createdAt field with default value of current timestamp
11. THE AuditLog table SHALL include a database index on userId and createdAt for query performance
12. THE AuditLog table SHALL include a database index on resourceType and resourceId for query performance
13. THE AuditLog table SHALL include a database index on action for query performance

### Requirement 3: Audit Log API Endpoints

**User Story:** As a system administrator, I want API endpoints to retrieve audit logs, so that I can display them in the admin dashboard.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint at /api/admin/audit-logs that returns paginated audit log entries
2. WHEN the audit logs endpoint is called, THE API SHALL require authentication with ADMIN role
3. WHEN the audit logs endpoint is called with a page parameter, THE API SHALL return the specified page of results with 50 entries per page
4. WHEN the audit logs endpoint is called with a userId filter, THE API SHALL return only entries for that user
5. WHEN the audit logs endpoint is called with a resourceType filter, THE API SHALL return only entries for that resource type
6. WHEN the audit logs endpoint is called with a resourceId filter, THE API SHALL return only entries for that specific resource
7. WHEN the audit logs endpoint is called with a startDate filter, THE API SHALL return only entries created on or after that date
8. WHEN the audit logs endpoint is called with an endDate filter, THE API SHALL return only entries created on or before that date
9. WHEN the audit logs endpoint is called, THE API SHALL return entries sorted by createdAt in descending order
10. WHEN the audit logs endpoint is called, THE API SHALL include user display name and email in the response
11. THE API SHALL provide a GET endpoint at /api/admin/audit-logs/stats that returns audit log statistics
12. WHEN the audit log stats endpoint is called, THE API SHALL return total count of audit entries
13. WHEN the audit log stats endpoint is called, THE API SHALL return count of entries by action type
14. WHEN the audit log stats endpoint is called, THE API SHALL return count of entries by resource type
15. WHEN the audit log stats endpoint is called, THE API SHALL return count of entries by user

### Requirement 4: Live Session Attendance Tracking

**User Story:** As an instructor, I want to track which students attend live sessions and for how long, so that I can measure engagement and session effectiveness.

#### Acceptance Criteria

1. WHEN a student joins a LiveSession, THE Live_Session_Tracker SHALL create an Attendance_Record with user ID, session ID, and join timestamp
2. WHEN a student leaves a LiveSession, THE Live_Session_Tracker SHALL update the Attendance_Record with leave timestamp and calculate duration in minutes
3. WHEN a student rejoins a LiveSession after leaving, THE Live_Session_Tracker SHALL create a new Attendance_Record
4. THE Live_Session_Tracker SHALL store attendance records in a PostgreSQL table named LiveSessionAttendance
5. THE LiveSessionAttendance table SHALL include a unique identifier field of type CUID
6. THE LiveSessionAttendance table SHALL include a sessionId field referencing the LiveSession table
7. THE LiveSessionAttendance table SHALL include a userId field referencing the User table
8. THE LiveSessionAttendance table SHALL include a joinedAt field storing the join timestamp
9. THE LiveSessionAttendance table SHALL include a leftAt field storing the leave timestamp as nullable
10. THE LiveSessionAttendance table SHALL include a durationMinutes field storing calculated duration as integer
11. THE LiveSessionAttendance table SHALL include a createdAt field with default value of current timestamp
12. THE LiveSessionAttendance table SHALL include a database index on sessionId for query performance
13. THE LiveSessionAttendance table SHALL include a database index on userId and joinedAt for query performance
14. WHEN calculating duration, THE Live_Session_Tracker SHALL round to the nearest minute
15. IF a student is still in a session when queried, THE Live_Session_Tracker SHALL calculate duration from joinedAt to current time

### Requirement 5: Live Session Attendance API Endpoints

**User Story:** As an instructor, I want API endpoints to track and retrieve attendance data, so that I can monitor live session participation.

#### Acceptance Criteria

1. THE API SHALL provide a POST endpoint at /api/live-sessions/:sessionId/attendance/join that records a student joining
2. WHEN the join attendance endpoint is called, THE API SHALL require authentication
3. WHEN the join attendance endpoint is called, THE API SHALL create a LiveSessionAttendance record with joinedAt set to current timestamp
4. THE API SHALL provide a POST endpoint at /api/live-sessions/:sessionId/attendance/leave that records a student leaving
5. WHEN the leave attendance endpoint is called, THE API SHALL require authentication
6. WHEN the leave attendance endpoint is called, THE API SHALL update the most recent LiveSessionAttendance record for that user and session with leftAt timestamp
7. WHEN the leave attendance endpoint is called, THE API SHALL calculate and store durationMinutes
8. THE API SHALL provide a GET endpoint at /api/live-sessions/:sessionId/attendance that returns all attendance records for a session
9. WHEN the session attendance endpoint is called, THE API SHALL require authentication with ADMIN or INSTRUCTOR role
10. WHEN the session attendance endpoint is called, THE API SHALL return attendance records with user display name and email
11. WHEN the session attendance endpoint is called, THE API SHALL calculate total attendance duration for each user across multiple join/leave cycles
12. THE API SHALL provide a GET endpoint at /api/admin/attendance/stats that returns attendance statistics
13. WHEN the attendance stats endpoint is called, THE API SHALL return average attendance duration per session
14. WHEN the attendance stats endpoint is called, THE API SHALL return total unique attendees per session
15. WHEN the attendance stats endpoint is called, THE API SHALL return attendance rate as percentage of enrolled students

### Requirement 6: Payment Attempt Tracking

**User Story:** As a business administrator, I want all payment attempts to be logged including failures, so that I can analyze payment issues and reduce transaction failures.

#### Acceptance Criteria

1. WHEN a payment is initiated for a PurchaseOrder, THE Payment_Tracker SHALL create a payment attempt record with status INITIATED
2. WHEN a payment succeeds, THE Payment_Tracker SHALL update the payment attempt record with status SUCCESS and transaction ID
3. WHEN a payment fails, THE Payment_Tracker SHALL update the payment attempt record with status FAILED, error code, and error message
4. THE Payment_Tracker SHALL store payment attempts in a PostgreSQL table named PaymentAttempt
5. THE PaymentAttempt table SHALL include a unique identifier field of type CUID
6. THE PaymentAttempt table SHALL include an orderId field referencing the PurchaseOrder table as nullable
7. THE PaymentAttempt table SHALL include a userId field referencing the User table
8. THE PaymentAttempt table SHALL include an amount field storing the payment amount in NPR as integer
9. THE PaymentAttempt table SHALL include a provider field storing the payment provider name as string
10. THE PaymentAttempt table SHALL include a status field storing the attempt status as enum with values INITIATED, SUCCESS, FAILED
11. THE PaymentAttempt table SHALL include an errorCode field storing the provider error code as nullable string
12. THE PaymentAttempt table SHALL include an errorMessage field storing the provider error message as nullable string
13. THE PaymentAttempt table SHALL include a transactionId field storing the provider transaction ID as nullable string
14. THE PaymentAttempt table SHALL include an attemptedAt field with default value of current timestamp
15. THE PaymentAttempt table SHALL include a database index on userId and attemptedAt for query performance
16. THE PaymentAttempt table SHALL include a database index on orderId for query performance
17. THE PaymentAttempt table SHALL include a database index on status for query performance
18. THE PaymentAttempt table SHALL include a database index on provider for query performance

### Requirement 7: Payment Attempt Tracking for Chapter Purchases

**User Story:** As a business administrator, I want payment attempts for chapter purchases to be logged, so that I can analyze chapter-based payment patterns.

#### Acceptance Criteria

1. WHEN a payment is initiated for a ChapterPurchase, THE Payment_Tracker SHALL create a payment attempt record with chapter purchase context
2. THE PaymentAttempt table SHALL include a chapterPurchaseId field referencing the ChapterPurchase table as nullable
3. WHEN a chapter purchase payment succeeds, THE Payment_Tracker SHALL update both the payment attempt and ChapterPurchase paymentStatus
4. WHEN a chapter purchase payment fails, THE Payment_Tracker SHALL update the payment attempt with failure details
5. THE PaymentAttempt table SHALL include a database index on chapterPurchaseId for query performance

### Requirement 8: Payment Attempt Tracking for Bundle Purchases

**User Story:** As a business administrator, I want payment attempts for bundle purchases to be logged, so that I can analyze bundle purchase patterns.

#### Acceptance Criteria

1. WHEN a payment is initiated for a BundlePurchase, THE Payment_Tracker SHALL create a payment attempt record with bundle purchase context
2. THE PaymentAttempt table SHALL include a bundlePurchaseId field referencing the BundlePurchase table as nullable
3. WHEN a bundle purchase payment succeeds, THE Payment_Tracker SHALL update both the payment attempt and BundlePurchase paymentStatus
4. WHEN a bundle purchase payment fails, THE Payment_Tracker SHALL update the payment attempt with failure details
5. THE PaymentAttempt table SHALL include a database index on bundlePurchaseId for query performance

### Requirement 9: Payment Analytics API Endpoints

**User Story:** As a business administrator, I want API endpoints to retrieve payment analytics, so that I can analyze payment success rates and failure patterns.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint at /api/admin/payments/attempts that returns paginated payment attempt records
2. WHEN the payment attempts endpoint is called, THE API SHALL require authentication with ADMIN role
3. WHEN the payment attempts endpoint is called with a page parameter, THE API SHALL return the specified page of results with 50 entries per page
4. WHEN the payment attempts endpoint is called with a status filter, THE API SHALL return only attempts with that status
5. WHEN the payment attempts endpoint is called with a provider filter, THE API SHALL return only attempts for that provider
6. WHEN the payment attempts endpoint is called with a userId filter, THE API SHALL return only attempts for that user
7. WHEN the payment attempts endpoint is called with a startDate filter, THE API SHALL return only attempts on or after that date
8. WHEN the payment attempts endpoint is called with an endDate filter, THE API SHALL return only attempts on or before that date
9. WHEN the payment attempts endpoint is called, THE API SHALL return attempts sorted by attemptedAt in descending order
10. WHEN the payment attempts endpoint is called, THE API SHALL include user display name and email in the response
11. THE API SHALL provide a GET endpoint at /api/admin/payments/stats that returns payment statistics
12. WHEN the payment stats endpoint is called, THE API SHALL return total count of payment attempts
13. WHEN the payment stats endpoint is called, THE API SHALL return count of attempts by status
14. WHEN the payment stats endpoint is called, THE API SHALL return count of attempts by provider
15. WHEN the payment stats endpoint is called, THE API SHALL return success rate as percentage
16. WHEN the payment stats endpoint is called, THE API SHALL return total successful payment amount
17. WHEN the payment stats endpoint is called, THE API SHALL return total failed payment amount
18. WHEN the payment stats endpoint is called, THE API SHALL return most common error codes with counts

### Requirement 10: Admin Dashboard Audit Log Viewer

**User Story:** As a system administrator, I want a web interface to view and search audit logs, so that I can investigate administrative actions and troubleshoot issues.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a page at /admin/audit-logs that displays audit log entries
2. WHEN the audit logs page is accessed, THE Admin_Dashboard SHALL require authentication with ADMIN role
3. WHEN the audit logs page loads, THE Admin_Dashboard SHALL display the 50 most recent audit log entries
4. THE Admin_Dashboard SHALL display each audit log entry with timestamp, user name, action type, resource type, and resource ID
5. WHEN an audit log entry is clicked, THE Admin_Dashboard SHALL expand to show complete before and after state
6. THE Admin_Dashboard SHALL provide a filter input for user name or email
7. THE Admin_Dashboard SHALL provide a dropdown filter for action type
8. THE Admin_Dashboard SHALL provide a dropdown filter for resource type
9. THE Admin_Dashboard SHALL provide date range filters for start date and end date
10. WHEN filters are applied, THE Admin_Dashboard SHALL update the displayed entries to match the filters
11. THE Admin_Dashboard SHALL provide pagination controls to navigate through audit log pages
12. THE Admin_Dashboard SHALL display audit log statistics including total entries and entries by action type
13. THE Admin_Dashboard SHALL provide an export button to download audit logs as CSV
14. WHEN the export button is clicked, THE Admin_Dashboard SHALL generate a CSV file with all filtered audit log entries

### Requirement 11: Admin Dashboard Attendance Analytics

**User Story:** As an instructor, I want a web interface to view live session attendance analytics, so that I can measure session effectiveness and student engagement.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a page at /admin/attendance that displays live session attendance data
2. WHEN the attendance page is accessed, THE Admin_Dashboard SHALL require authentication with ADMIN or INSTRUCTOR role
3. WHEN the attendance page loads, THE Admin_Dashboard SHALL display a list of all live sessions with attendance counts
4. THE Admin_Dashboard SHALL display each live session with title, date, total attendees, and average duration
5. WHEN a live session is clicked, THE Admin_Dashboard SHALL display detailed attendance records for that session
6. THE Admin_Dashboard SHALL display each attendance record with student name, join time, leave time, and duration
7. THE Admin_Dashboard SHALL calculate and display total attendance duration for students with multiple join/leave cycles
8. THE Admin_Dashboard SHALL provide a filter for course to show only sessions for that course
9. THE Admin_Dashboard SHALL provide a date range filter for session dates
10. THE Admin_Dashboard SHALL display attendance statistics including average attendance per session and attendance rate
11. THE Admin_Dashboard SHALL provide an export button to download attendance data as CSV
12. WHEN the export button is clicked, THE Admin_Dashboard SHALL generate a CSV file with attendance records for the selected session

### Requirement 12: Admin Dashboard Payment Analytics

**User Story:** As a business administrator, I want a web interface to view payment analytics, so that I can analyze payment success rates and identify issues.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a page at /admin/payments that displays payment analytics
2. WHEN the payments page is accessed, THE Admin_Dashboard SHALL require authentication with ADMIN role
3. WHEN the payments page loads, THE Admin_Dashboard SHALL display payment statistics including total attempts, success rate, and failure rate
4. THE Admin_Dashboard SHALL display a chart showing payment attempts over time with success and failure counts
5. THE Admin_Dashboard SHALL display a breakdown of payment attempts by provider with success rates
6. THE Admin_Dashboard SHALL display a list of recent failed payment attempts with error codes and messages
7. THE Admin_Dashboard SHALL provide a filter for payment provider
8. THE Admin_Dashboard SHALL provide a filter for payment status
9. THE Admin_Dashboard SHALL provide a date range filter for payment dates
10. WHEN filters are applied, THE Admin_Dashboard SHALL update the displayed statistics and charts
11. THE Admin_Dashboard SHALL display the most common error codes with counts and percentages
12. WHEN an error code is clicked, THE Admin_Dashboard SHALL display all payment attempts with that error code
13. THE Admin_Dashboard SHALL provide an export button to download payment data as CSV
14. WHEN the export button is clicked, THE Admin_Dashboard SHALL generate a CSV file with payment attempt records

### Requirement 13: Audit Log Middleware Integration

**User Story:** As a developer, I want audit logging to be automatically applied to admin API routes, so that all administrative actions are logged without manual instrumentation.

#### Acceptance Criteria

1. THE API SHALL provide a Fastify middleware function named auditLogMiddleware
2. WHEN the auditLogMiddleware is applied to a route, THE API SHALL automatically log the action after successful request completion
3. WHEN the auditLogMiddleware is applied to a route, THE API SHALL extract user ID from the authenticated request
4. WHEN the auditLogMiddleware is applied to a route, THE API SHALL extract IP address from the request headers
5. WHEN the auditLogMiddleware is applied to a route, THE API SHALL extract user agent from the request headers
6. WHEN the auditLogMiddleware is applied to a POST route, THE API SHALL log the action as CREATE with the request body as new state
7. WHEN the auditLogMiddleware is applied to a PUT or PATCH route, THE API SHALL fetch the existing resource state before update
8. WHEN the auditLogMiddleware is applied to a PUT or PATCH route, THE API SHALL log the action as UPDATE with before and after state
9. WHEN the auditLogMiddleware is applied to a DELETE route, THE API SHALL fetch the existing resource state before deletion
10. WHEN the auditLogMiddleware is applied to a DELETE route, THE API SHALL log the action as DELETE with the resource state before deletion
11. IF audit logging fails, THE API SHALL log the error but not fail the request
12. THE auditLogMiddleware SHALL accept configuration parameters for action name and resource type

### Requirement 14: Performance and Data Retention

**User Story:** As a system administrator, I want audit logs and analytics data to be managed efficiently, so that database performance remains optimal as data grows.

#### Acceptance Criteria

1. THE Audit_Log_System SHALL create database indexes on frequently queried fields to maintain query performance
2. THE Live_Session_Tracker SHALL create database indexes on frequently queried fields to maintain query performance
3. THE Payment_Tracker SHALL create database indexes on frequently queried fields to maintain query performance
4. THE Admin_Dashboard SHALL implement pagination for all list views to limit data transfer
5. THE API SHALL limit query results to a maximum of 1000 records per request
6. THE Admin_Dashboard SHALL display a warning when audit logs exceed 100000 entries
7. THE Admin_Dashboard SHALL display a warning when payment attempts exceed 50000 entries
8. THE Admin_Dashboard SHALL provide documentation on data retention policies
9. WHEN querying large date ranges, THE API SHALL return results in batches to prevent timeout
10. THE API SHALL implement query timeouts of 30 seconds for analytics endpoints

### Requirement 15: Error Handling and Validation

**User Story:** As a developer, I want comprehensive error handling and validation, so that the system handles edge cases gracefully.

#### Acceptance Criteria

1. WHEN an audit log entry cannot be created, THE Audit_Log_System SHALL log the error to the application log
2. WHEN an audit log entry cannot be created, THE Audit_Log_System SHALL not fail the original request
3. WHEN a live session attendance record cannot be created, THE Live_Session_Tracker SHALL return an error response with status code 500
4. WHEN a payment attempt record cannot be created, THE Payment_Tracker SHALL return an error response with status code 500
5. WHEN an API endpoint receives invalid pagination parameters, THE API SHALL return an error response with status code 400
6. WHEN an API endpoint receives invalid date range parameters, THE API SHALL return an error response with status code 400
7. WHEN an API endpoint is called without required authentication, THE API SHALL return an error response with status code 401
8. WHEN an API endpoint is called without required authorization, THE API SHALL return an error response with status code 403
9. WHEN a resource ID in an API request does not exist, THE API SHALL return an error response with status code 404
10. IF a student attempts to join a live session that does not exist, THE API SHALL return an error response with status code 404
11. IF a student attempts to leave a live session without an active attendance record, THE API SHALL return an error response with status code 400
12. WHEN an error response is returned, THE API SHALL include a descriptive error message in the response body
