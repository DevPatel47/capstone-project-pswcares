# Functional Requirements Specification - PSWCares

## 1. System Overview

PSWCares is a multi-role care service platform connecting Clients with Personal Support Workers (PSWs). The system supports registration and authentication, PSW profile management and verification, service discovery, appointment booking, payment processing, real-time chat, reviews, dispute handling, and administrative governance.

Core architecture assumptions:

- Role-based access control with three primary roles: Client, PSW, Admin.
- Backend API with JWT authentication.
- Document-oriented data model (MongoDB).
- File upload storage on AWS S3 for PSW certificates.
- Real-time communication for confirmed bookings.

## 2. User Roles

| Role   | Description                        | Core Capabilities                                               |
| ------ | ---------------------------------- | --------------------------------------------------------------- |
| Client | End user requesting care services  | Search PSWs, create bookings, pay, chat, review, raise disputes |
| PSW    | Care provider delivering services  | Maintain profile, upload certificates, manage bookings, chat    |
| Admin  | Platform operations and governance | Verify PSWs, monitor users/disputes/analytics, resolve disputes |

## 3. Functional Requirements by Module

## 3.1 Authentication

| ID     | Description                                                                                                     | Actor              | Priority |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------------------ | -------- |
| FR-001 | The system shall allow users to register with name, email, password, and role (client or psw).                  | Client, PSW        | High     |
| FR-002 | The system shall prevent public registration as admin.                                                          | Admin              | High     |
| FR-003 | The system shall enforce unique email addresses across all users.                                               | Client, PSW, Admin | High     |
| FR-004 | The system shall enforce password minimum length policy at registration.                                        | Client, PSW        | High     |
| FR-005 | The system shall authenticate users via email and password and issue a JWT token.                               | Client, PSW, Admin | High     |
| FR-006 | The system shall deny login for users whose account status is not active.                                       | Client, PSW, Admin | High     |
| FR-007 | The system shall expose a current-user endpoint that returns authenticated user details from the token context. | Client, PSW, Admin | Medium   |
| FR-008 | The system shall protect role-specific routes with middleware authorization checks.                             | Client, PSW, Admin | High     |

## 3.2 PSW Profile and Verification

| ID     | Description                                                                                                 | Actor      | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| FR-009 | The system shall allow each PSW to create or update exactly one profile associated with their user account. | PSW        | High     |
| FR-010 | The system shall validate PSW profile fields: location, hourly rate, experience, and optional bio/services. | PSW        | High     |
| FR-011 | The system shall reset verification state to pending when a PSW profile is updated.                         | PSW        | High     |
| FR-012 | The system shall allow PSWs to upload certificate files (PDF/JPG/PNG/WEBP) up to size limit.                | PSW        | High     |
| FR-013 | The system shall store certificate metadata and S3 object references for retrieval.                         | PSW, Admin | High     |
| FR-014 | The system shall allow admins to retrieve pending PSW verification queue with related certificates.         | Admin      | High     |
| FR-015 | The system shall allow admins to approve or reject PSW profiles with verification notes.                    | Admin      | High     |
| FR-016 | The system shall persist verifier identity and verification timestamp on decision.                          | Admin      | High     |

## 3.3 Search and Discovery

| ID     | Description                                                                          | Actor  | Priority |
| ------ | ------------------------------------------------------------------------------------ | ------ | -------- |
| FR-017 | The system shall expose searchable list of approved PSW profiles only.               | Client | High     |
| FR-018 | The system shall support filters by location, service, and minimum experience.       | Client | High     |
| FR-019 | The system shall support pagination for PSW search results.                          | Client | Medium   |
| FR-020 | The system shall sort discoverable PSWs by rating and recency of verification.       | Client | Medium   |
| FR-021 | The system shall provide a public PSW profile detail endpoint for approved profiles. | Client | High     |

## 3.4 Booking System

| ID     | Description                                                                                            | Actor              | Priority |
| ------ | ------------------------------------------------------------------------------------------------------ | ------------------ | -------- |
| FR-022 | The system shall allow clients to create bookings only with active, verified PSWs.                     | Client             | High     |
| FR-023 | The system shall validate booking date, time (HH:mm), and duration constraints.                        | Client             | High     |
| FR-024 | The system shall initialize new bookings with pending status.                                          | Client             | High     |
| FR-025 | The system shall allow clients, PSWs, and admins to view appointments scoped by role.                  | Client, PSW, Admin | High     |
| FR-026 | The system shall enforce status transition rules by role (client cancel, PSW confirm/complete/cancel). | Client, PSW        | High     |
| FR-027 | The system shall allow authorized actors to reschedule non-finalized appointments.                     | Client, PSW, Admin | Medium   |
| FR-028 | The system shall reset appointment to pending on reschedule by non-admin users.                        | Client, PSW        | Medium   |
| FR-029 | The system shall record reschedule reason and timestamp.                                               | Client, PSW, Admin | Medium   |

## 3.5 Payments

| ID     | Description                                                                                                | Actor  | Priority |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------ | -------- |
| FR-030 | The system shall allow only clients to initiate payment checkout for their own appointments.               | Client | High     |
| FR-031 | The system shall permit payment session creation only for confirmed appointments.                          | Client | High     |
| FR-032 | The system shall calculate payment amount from PSW hourly rate and appointment duration.                   | Client | High     |
| FR-033 | The system shall create a Stripe checkout session and return checkout URL and session id.                  | Client | High     |
| FR-034 | The system shall persist payment records with pending status before checkout completion.                   | System | High     |
| FR-035 | The system shall process success callback and mark payment as succeeded when provider confirms paid state. | System | High     |
| FR-036 | The system shall process cancellation callback and mark pending payments as cancelled.                     | System | High     |
| FR-037 | The system shall prevent duplicate successful payment for the same appointment.                            | System | High     |

## 3.6 Chat System

| ID     | Description                                                                                          | Actor              | Priority |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------ | -------- |
| FR-038 | The system shall provide real-time messaging between client and PSW for confirmed appointments only. | Client, PSW        | High     |
| FR-039 | The system shall authenticate socket connections using JWT tokens.                                   | Client, PSW        | High     |
| FR-040 | The system shall validate sender participation in the appointment before accepting messages.         | Client, PSW        | High     |
| FR-041 | The system shall persist chat messages with sender, receiver, appointment, and timestamp.            | System             | High     |
| FR-042 | The system shall provide message history retrieval per appointment for authorized users.             | Client, PSW, Admin | Medium   |

## 3.7 Reviews

| ID     | Description                                                                                              | Actor  | Priority |
| ------ | -------------------------------------------------------------------------------------------------------- | ------ | -------- |
| FR-043 | The system shall allow clients to submit reviews only for completed appointments.                        | Client | High     |
| FR-044 | The system shall enforce one review per appointment.                                                     | Client | High     |
| FR-045 | The system shall validate review rating range from 1 to 5.                                               | Client | High     |
| FR-046 | The system shall associate each review with appointment, client, PSW, and PSW profile.                   | System | High     |
| FR-047 | The system shall recalculate and store PSW average rating and review count after each review submission. | System | High     |
| FR-048 | The system shall expose review list for approved PSW profiles.                                           | Client | Medium   |

## 3.8 Notifications

| ID     | Description                                                                                                                | Actor              | Priority |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------- |
| FR-049 | The system shall display in-app success and error notifications for key user actions (login, booking, dispute submission). | Client, PSW, Admin | Medium   |
| FR-050 | The system shall provide failure feedback when asynchronous operations fail (network timeout, server errors).              | Client, PSW, Admin | High     |
| FR-051 | The system shall support extendable notification channels for future email/SMS integration.                                | System             | Low      |

## 3.9 Admin Panel

| ID     | Description                                                                                                                                     | Actor | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- |
| FR-052 | The system shall provide an admin-only dashboard with aggregate metrics for users, verification, appointments, payments, reviews, and disputes. | Admin | High     |
| FR-053 | The system shall allow admin user search and filtering by role/status.                                                                          | Admin | Medium   |
| FR-054 | The system shall provide admin workflows for PSW verification queue and decisioning.                                                            | Admin | High     |
| FR-055 | The system shall provide admin dispute list, detail view, and status management.                                                                | Admin | High     |
| FR-056 | The system shall expose admin-only endpoints protected by role authorization middleware.                                                        | Admin | High     |

## 3.10 Dispute System

| ID     | Description                                                                                        | Actor  | Priority |
| ------ | -------------------------------------------------------------------------------------------------- | ------ | -------- |
| FR-057 | The system shall allow clients to create disputes for their own appointments.                      | Client | High     |
| FR-058 | The system shall require dispute title and detailed description.                                   | Client | High     |
| FR-059 | The system shall initialize dispute status as open.                                                | System | High     |
| FR-060 | The system shall allow clients to list their disputes and view dispute details.                    | Client | High     |
| FR-061 | The system shall allow admins to list all disputes with optional status filter.                    | Admin  | High     |
| FR-062 | The system shall allow admins to update dispute status to open, in_review, or resolved.            | Admin  | High     |
| FR-063 | The system shall store resolution note, resolver identity, and resolution timestamp when resolved. | Admin  | High     |
| FR-064 | The system shall allow status reopening by admin and clear resolver metadata when reopened.        | Admin  | Medium   |
