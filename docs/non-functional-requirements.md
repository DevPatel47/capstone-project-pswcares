# Non-Functional Requirements - PSWCares

## 1. Performance

| ID           | Requirement                                                               | Target                                   |
| ------------ | ------------------------------------------------------------------------- | ---------------------------------------- |
| NFR-PERF-001 | API response time for standard CRUD operations                            | p95 <= 500 ms under normal load          |
| NFR-PERF-002 | API response time for search endpoints with filters and pagination        | p95 <= 700 ms                            |
| NFR-PERF-003 | Authentication endpoints (login/register)                                 | p95 <= 600 ms                            |
| NFR-PERF-004 | Real-time chat message delivery latency (server emit to recipient socket) | <= 1 second in stable network            |
| NFR-PERF-005 | File upload API processing overhead excluding network transfer            | <= 1 second for files <= 10 MB           |
| NFR-PERF-006 | Concurrent active users (baseline deployment)                             | Support at least 500 concurrent sessions |

## 2. Security

| ID          | Requirement                       | Target                                                                       |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------- |
| NFR-SEC-001 | Token-based authentication        | JWT required for protected endpoints                                         |
| NFR-SEC-002 | Password protection               | BCrypt hashing with cost factor >= 12                                        |
| NFR-SEC-003 | Authorization                     | Enforce role-based access control at middleware and service layers           |
| NFR-SEC-004 | Data-in-transit protection        | TLS 1.2+ for all client-server and server-cloud communication in production  |
| NFR-SEC-005 | Sensitive secret handling         | No hardcoded secrets in source; use environment variables                    |
| NFR-SEC-006 | Input validation                  | Server-side validation and schema constraints for all mutable inputs         |
| NFR-SEC-007 | Upload security                   | Restrict MIME types and file size, generate non-guessable S3 object keys     |
| NFR-SEC-008 | Admin account governance          | Public admin registration disabled; admin creation via secure seed flow only |
| NFR-SEC-009 | Least-privilege cloud permissions | IAM policy grants only required S3/KMS actions for allowed prefixes          |

## 3. Availability

| ID          | Requirement                | Target                                                         |
| ----------- | -------------------------- | -------------------------------------------------------------- |
| NFR-AVL-001 | Service uptime             | >= 99.5% monthly uptime target                                 |
| NFR-AVL-002 | Graceful failure behavior  | Return structured 4xx/5xx responses on errors                  |
| NFR-AVL-003 | Health monitoring endpoint | Expose API health check endpoint for liveness/readiness checks |

## 4. Reliability

| ID          | Requirement                                   | Target                                                                                             |
| ----------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| NFR-REL-001 | Data consistency for payment lifecycle        | Payment status transitions are idempotent and persisted transactionally at record level            |
| NFR-REL-002 | Protection against duplicate critical records | Unique constraints for user email, stripeSessionId, and one review per appointment                 |
| NFR-REL-003 | Race-safe UI data loading                     | Frontend request guards prevent stale response overwrite in list/detail views                      |
| NFR-REL-004 | Error transparency                            | Client receives explicit error reason for authorization, validation, and upstream service failures |

## 5. Maintainability

| ID          | Requirement                        | Target                                                                                  |
| ----------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| NFR-MNT-001 | Layered architecture               | routes -> controllers -> services -> models separation                                  |
| NFR-MNT-002 | Consistent naming and status enums | Shared status constants and strict enum validation                                      |
| NFR-MNT-003 | Modular service boundaries         | Domain-specific services for auth, booking, payment, chat, review, dispute, admin       |
| NFR-MNT-004 | Documentation quality              | Functional, non-functional, schema, and test plan docs kept current with implementation |
| NFR-MNT-005 | Change safety                      | Diagnostic/lint checks run on edited modules before merge                               |

## 6. Usability

| ID           | Requirement                | Target                                                                               |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| NFR-USAB-001 | Role-focused navigation    | Each role sees only relevant dashboard modules                                       |
| NFR-USAB-002 | Error and success feedback | Immediate in-app notifications for action outcomes                                   |
| NFR-USAB-003 | Form validation UX         | Client-side pre-validation with clear field-level error messages                     |
| NFR-USAB-004 | Workflow clarity           | Booking, payment, dispute, and verification flows provide explicit status visibility |

## 7. Accessibility (AODA Compliance)

| ID           | Requirement            | Target                                                                   |
| ------------ | ---------------------- | ------------------------------------------------------------------------ |
| NFR-A11Y-001 | WCAG alignment         | Meet WCAG 2.1 Level AA criteria where applicable                         |
| NFR-A11Y-002 | Keyboard accessibility | All interactive controls reachable and operable by keyboard              |
| NFR-A11Y-003 | Semantic structure     | Proper headings, labels, and form associations                           |
| NFR-A11Y-004 | Non-text contrast      | UI controls and informative elements maintain accessible contrast ratios |
| NFR-A11Y-005 | Status messaging       | Programmatic status/error messages exposed to assistive technologies     |

## 8. Data Integrity

| ID           | Requirement                                | Target                                                                             |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| NFR-DATA-001 | Referential integrity at application layer | Validate existence and ownership of referenced entities before writes              |
| NFR-DATA-002 | Validation constraints                     | Enforce numeric ranges, date/time formats, and string lengths                      |
| NFR-DATA-003 | Immutable audit timestamps                 | Maintain createdAt/updatedAt on all primary collections                            |
| NFR-DATA-004 | Duplicate prevention                       | Enforce uniqueness where business rules require one-to-one or one-to-once behavior |

## 9. Cloud Storage (AWS S3)

| ID         | Requirement            | Target                                                                    |
| ---------- | ---------------------- | ------------------------------------------------------------------------- |
| NFR-S3-001 | Object key convention  | Prefix-based key segregation (certificates/, profile-images/)             |
| NFR-S3-002 | Storage URL generation | Deterministic object URL generation based on bucket and region            |
| NFR-S3-003 | Upload permissions     | IAM identity-based policies must allow s3:PutObject for required prefixes |
| NFR-S3-004 | Encryption compliance  | If SSE-KMS is enabled, IAM principal must have required KMS permissions   |
| NFR-S3-005 | File governance        | Accept only approved MIME types and max upload size 10 MB                 |
