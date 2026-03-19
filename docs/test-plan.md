# Test Plan - PSWCares

## 1. Test Strategy

## 1.1 Unit Testing

Scope:

- Service-level business rules and validation logic.

Focus areas:

- Authentication policy enforcement.
- Booking status transition rules.
- Payment lifecycle logic.
- Review and dispute state handling.

Approach:

- Mock external dependencies (Stripe, S3, socket layer).
- Validate success and failure branches for each service function.

## 1.2 Integration Testing

Scope:

- API routes, middleware, controllers, and persistence interactions.

Focus areas:

- JWT-protected routes and role authorization.
- End-to-end booking creation to payment session creation.
- Dispute submission and admin resolution.
- Chat message persistence and retrieval.

Approach:

- Test against isolated test database.
- Execute request-response flows with realistic payloads.

## 1.3 System Testing

Scope:

- Full user journeys across frontend and backend.

Focus areas:

- Client journey: register -> search -> book -> pay -> chat -> review/dispute.
- PSW journey: register -> profile update -> certificate upload -> booking workflow.
- Admin journey: verification queue -> disputes -> analytics.

Approach:

- Browser-driven manual validation supported by API assertions.

## 2. Test Cases

| Test ID       | Feature        | Description                                       | Steps                                                         | Expected Result                                             | Actual Result | Status    |
| ------------- | -------------- | ------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | ------------- | --------- |
| TC-AUTH-001   | Authentication | Register client with valid data                   | 1) POST /auth/register with role=client 2) Inspect response   | 201 created, token returned, role=client                    |               | Pass/Fail |
| TC-AUTH-002   | Authentication | Register PSW with valid data                      | 1) POST /auth/register role=psw 2) Inspect response           | 201 created, token returned, role=psw                       |               | Pass/Fail |
| TC-AUTH-003   | Authentication | Block public admin registration                   | 1) POST /auth/register role=admin                             | 403 returned with admin registration disabled message       |               | Pass/Fail |
| TC-AUTH-004   | Authentication | Login with valid credentials                      | 1) POST /auth/login                                           | 200 returned with token and user context                    |               | Pass/Fail |
| TC-AUTH-005   | Authentication | Reject invalid password login                     | 1) POST /auth/login with wrong password                       | 401 invalid email or password                               |               | Pass/Fail |
| TC-AUTH-006   | Authentication | Reject inactive user login                        | 1) Mark user status inactive 2) POST /auth/login              | 403 user account not active                                 |               | Pass/Fail |
| TC-PSW-001    | PSW Profile    | Create PSW profile with valid fields              | 1) Auth as PSW 2) PUT /psw-profiles/me                        | 200, profile stored, verificationStatus=pending             |               | Pass/Fail |
| TC-PSW-002    | PSW Profile    | Reject invalid hourly rate                        | 1) PUT /psw-profiles/me with negative rate                    | 400 hourlyRate validation error                             |               | Pass/Fail |
| TC-PSW-003    | Verification   | Upload certificate file                           | 1) POST /psw-profiles/me/certificates with valid file         | 201, file metadata stored with S3 URL and key               |               | Pass/Fail |
| TC-PSW-004    | Verification   | Reject unsupported certificate MIME type          | 1) Upload unsupported file extension/type                     | 400 unsupported file type                                   |               | Pass/Fail |
| TC-PSW-005    | Verification   | Admin approves profile                            | 1) Auth as admin 2) PATCH /admin/verify/{id} status=approved  | 200, verificationStatus=approved, verifiedBy/verifiedAt set |               | Pass/Fail |
| TC-SEARCH-001 | Search         | Search approved PSWs by location                  | 1) GET /psw-profiles/search?location=Toronto                  | Only approved matching profiles returned                    |               | Pass/Fail |
| TC-SEARCH-002 | Search         | Filter PSWs by service and experience             | 1) GET /psw-profiles/search?service=Elder%20Care&experience=3 | Results satisfy filters and pagination object exists        |               | Pass/Fail |
| TC-BOOK-001   | Booking        | Client creates booking with approved PSW          | 1) Auth client 2) POST /appointments                          | 201 with status pending                                     |               | Pass/Fail |
| TC-BOOK-002   | Booking        | Reject booking for unverified PSW                 | 1) Use PSW with non-approved profile 2) POST /appointments    | 400 booking only for verified PSWs                          |               | Pass/Fail |
| TC-BOOK-003   | Booking        | PSW confirms pending appointment                  | 1) Auth PSW 2) PATCH /appointments/{id}/status confirmed      | 200 status=confirmed                                        |               | Pass/Fail |
| TC-BOOK-004   | Booking        | PSW completes confirmed appointment               | 1) Auth PSW 2) PATCH /appointments/{id}/status completed      | 200 status=completed                                        |               | Pass/Fail |
| TC-BOOK-005   | Booking        | Client cancels pending/confirmed appointment      | 1) Auth client 2) PATCH /appointments/{id}/status cancelled   | 200 status=cancelled                                        |               | Pass/Fail |
| TC-BOOK-006   | Booking        | Prevent invalid PSW transition                    | 1) Auth PSW 2) Try pending->completed                         | 400 invalid PSW status transition                           |               | Pass/Fail |
| TC-BOOK-007   | Booking        | Reschedule appointment by client                  | 1) Auth client 2) PATCH /appointments/{id}/reschedule         | 200, schedule updated, status reset to pending              |               | Pass/Fail |
| TC-PAY-001    | Payment        | Create checkout session for confirmed appointment | 1) Auth client 2) POST /payments/checkout-session             | 201, checkoutUrl/sessionId returned, payment pending        |               | Pass/Fail |
| TC-PAY-002    | Payment        | Reject checkout for non-owner client              | 1) Auth different client 2) POST /payments/checkout-session   | 403 forbidden                                               |               | Pass/Fail |
| TC-PAY-003    | Payment        | Reject duplicate successful payment               | 1) Set succeeded payment 2) retry checkout                    | 409 already paid                                            |               | Pass/Fail |
| TC-PAY-004    | Payment        | Process success callback                          | 1) GET /payments/success?session_id=...                       | 200, payment status=succeeded, paidAt populated             |               | Pass/Fail |
| TC-PAY-005    | Payment        | Process cancel callback                           | 1) GET /payments/cancel?session_id=...                        | 200, pending payment becomes cancelled                      |               | Pass/Fail |
| TC-CHAT-001   | Chat           | Send message in confirmed appointment             | 1) Connect socket as participant 2) emit send_message         | Message persisted and delivered to recipient                |               | Pass/Fail |
| TC-CHAT-002   | Chat           | Reject message from non-participant               | 1) Connect as unrelated user 2) emit send_message             | Error acknowledgement returned                              |               | Pass/Fail |
| TC-CHAT-003   | Chat           | Retrieve appointment message history              | 1) GET /chats/{appointmentId}/messages                        | Ordered messages by created time                            |               | Pass/Fail |
| TC-CHAT-004   | Chat           | Reject chat on non-confirmed appointment          | 1) Use pending/cancelled appointment                          | 403 chat not available                                      |               | Pass/Fail |
| TC-REV-001    | Reviews        | Submit review for completed appointment           | 1) Auth client owner 2) POST /reviews                         | 201 review created, profile aggregates updated              |               | Pass/Fail |
| TC-REV-002    | Reviews        | Block review for non-completed appointment        | 1) POST /reviews for pending appointment                      | 400 review allowed only after completion                    |               | Pass/Fail |
| TC-REV-003    | Reviews        | Enforce one review per appointment                | 1) Submit second review same appointment                      | 409 review already exists                                   |               | Pass/Fail |
| TC-REV-004    | Reviews        | Validate rating boundaries                        | 1) Submit rating=0 or 6                                       | 400 validation error                                        |               | Pass/Fail |
| TC-DSP-001    | Dispute        | Client submits dispute for own appointment        | 1) Auth client owner 2) POST /disputes                        | 201, status=open                                            |               | Pass/Fail |
| TC-DSP-002    | Dispute        | Block dispute on foreign appointment              | 1) Auth other client 2) POST /disputes                        | 403 forbidden                                               |               | Pass/Fail |
| TC-DSP-003    | Dispute        | Admin changes dispute to in_review                | 1) Auth admin 2) PATCH /admin/disputes/{id}                   | 200, status=in_review                                       |               | Pass/Fail |
| TC-DSP-004    | Dispute        | Admin resolves dispute with note                  | 1) PATCH status=resolved + note                               | 200, resolvedBy/resolvedAt populated                        |               | Pass/Fail |
| TC-DSP-005    | Dispute        | Admin reopens dispute                             | 1) PATCH status=open                                          | 200, resolver metadata cleared                              |               | Pass/Fail |
| TC-ADMIN-001  | Admin Panel    | Get user list with filters                        | 1) Auth admin 2) GET /admin/users?role=psw                    | Filtered user list and pagination returned                  |               | Pass/Fail |
| TC-ADMIN-002  | Admin Panel    | Get analytics summary                             | 1) Auth admin 2) GET /admin/analytics                         | Aggregated counters returned                                |               | Pass/Fail |
| TC-EDGE-001   | Authorization  | Reject unauthenticated protected request          | 1) Call protected endpoint without token                      | 401 authorization token required                            |               | Pass/Fail |
| TC-EDGE-002   | Authorization  | Reject wrong-role access                          | 1) Client calls admin endpoint                                | 403 insufficient permissions                                |               | Pass/Fail |
| TC-EDGE-003   | Validation     | Reject malformed appointment time                 | 1) Send appointmentTime=25:99                                 | 400 time format error                                       |               | Pass/Fail |
| TC-EDGE-004   | Upload         | Handle S3 permission failure gracefully           | 1) Revoke S3 PutObject permission 2) Upload cert              | 502 with clear S3 upload failed message                     |               | Pass/Fail |
| TC-EDGE-005   | Resilience     | Handle stale UI request race                      | 1) Rapidly switch filters/items in dispute UI                 | Latest response remains rendered; no stale overwrite        |               | Pass/Fail |

## 3. Tools and Environment

- API Testing: Postman collections for all route groups.
- Browser/System Testing: Chrome/Edge manual workflow validation.
- Real-time Testing: Browser dev tools + socket event logs.
- Data Inspection: MongoDB Compass for collection and index verification.
- Cloud Verification: AWS Console and AWS CLI for S3/KMS/IAM checks.
- Optional Automation Stack: Jest + Supertest for backend test suites; Playwright/Cypress for frontend E2E.
