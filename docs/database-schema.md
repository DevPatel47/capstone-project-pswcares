# Database Schema - PSWCares

## 1. Collections Overview

The platform uses MongoDB with Mongoose models. Primary collections:

- users
- pswprofiles
- certificates
- appointments
- payments
- messages
- reviews
- disputes

## 2. Collection Definitions

## 2.1 users

| Field     | Data Type | Required | Constraints                                  | Relationship                         |
| --------- | --------- | -------- | -------------------------------------------- | ------------------------------------ |
| \_id      | ObjectId  | Yes      | Auto-generated                               | Referenced by all domain collections |
| name      | String    | Yes      | Trim, min 2, max 100                         | -                                    |
| email     | String    | Yes      | Unique, lowercase, valid email pattern       | -                                    |
| password  | String    | Yes      | Min length 8, excluded by default in queries | -                                    |
| role      | String    | Yes      | Enum: client, psw, admin                     | Controls access to related actions   |
| status    | String    | Yes      | Enum: active, inactive, suspended            | Governs login and account usability  |
| createdAt | Date      | Yes      | Auto timestamp                               | Audit                                |
| updatedAt | Date      | Yes      | Auto timestamp                               | Audit                                |

## 2.2 pswprofiles

| Field              | Data Type | Required | Constraints                       | Relationship                       |
| ------------------ | --------- | -------- | --------------------------------- | ---------------------------------- |
| \_id               | ObjectId  | Yes      | Auto-generated                    | Referenced by certificates/reviews |
| userId             | ObjectId  | Yes      | Unique, indexed                   | Ref users.\_id (PSW owner)         |
| bio                | String    | No       | Max 2000                          | -                                  |
| services           | String[]  | No       | Array of normalized service names | Search filter source               |
| hourlyRate         | Number    | Yes      | Min 0                             | Used for payment calculation       |
| experience         | Number    | Yes      | Min 0                             | Search filter source               |
| location           | String    | Yes      | Trim, max 250                     | Search filter source               |
| averageRating      | Number    | No       | Min 0, max 5, default 0           | Derived from reviews               |
| reviewCount        | Number    | No       | Min 0, default 0                  | Derived from reviews               |
| verificationStatus | String    | Yes      | Enum: pending, approved, rejected | Admin workflow state               |
| verificationNote   | String    | No       | Max 1000                          | Admin review note                  |
| verifiedBy         | ObjectId  | No       | Nullable                          | Ref users.\_id (admin)             |
| verifiedAt         | Date      | No       | Nullable                          | Verification timestamp             |
| createdAt          | Date      | Yes      | Auto timestamp                    | Audit                              |
| updatedAt          | Date      | Yes      | Auto timestamp                    | Audit                              |

## 2.3 certificates

| Field            | Data Type | Required | Constraints    | Relationship               |
| ---------------- | --------- | -------- | -------------- | -------------------------- |
| \_id             | ObjectId  | Yes      | Auto-generated | -                          |
| userId           | ObjectId  | Yes      | Indexed        | Ref users.\_id (PSW owner) |
| pswProfileId     | ObjectId  | Yes      | Indexed        | Ref pswprofiles.\_id       |
| fileUrl          | String    | Yes      | Trimmed URL    | Public/consumable S3 URL   |
| s3Key            | String    | Yes      | Trimmed key    | S3 object key              |
| originalFileName | String    | No       | Max 300        | Source file metadata       |
| createdAt        | Date      | Yes      | Auto timestamp | Audit                      |
| updatedAt        | Date      | Yes      | Auto timestamp | Audit                      |

## 2.4 appointments

| Field            | Data Type | Required | Constraints                                    | Relationship                                     |
| ---------------- | --------- | -------- | ---------------------------------------------- | ------------------------------------------------ |
| \_id             | ObjectId  | Yes      | Auto-generated                                 | Referenced by payments/messages/reviews/disputes |
| clientId         | ObjectId  | Yes      | Indexed                                        | Ref users.\_id (client)                          |
| pswId            | ObjectId  | Yes      | Indexed                                        | Ref users.\_id (PSW)                             |
| appointmentDate  | Date      | Yes      | Indexed                                        | Booking schedule                                 |
| appointmentTime  | String    | Yes      | HH:mm format regex                             | Booking schedule                                 |
| durationMinutes  | Number    | Yes      | Min 15, max 720                                | Booking and payment calculation                  |
| paymentId        | ObjectId  | No       | Nullable, indexed                              | Ref payments.\_id                                |
| status           | String    | Yes      | Enum: pending, confirmed, completed, cancelled | Booking lifecycle                                |
| notes            | String    | No       | Max 1000                                       | Client booking notes                             |
| rescheduleReason | String    | No       | Max 1000                                       | Reschedule context                               |
| rescheduledAt    | Date      | No       | Nullable                                       | Last reschedule timestamp                        |
| createdAt        | Date      | Yes      | Auto timestamp                                 | Audit                                            |
| updatedAt        | Date      | Yes      | Auto timestamp                                 | Audit                                            |

## 2.5 payments

| Field                 | Data Type | Required | Constraints                                 | Relationship                       |
| --------------------- | --------- | -------- | ------------------------------------------- | ---------------------------------- |
| \_id                  | ObjectId  | Yes      | Auto-generated                              | Linked from appointments.paymentId |
| appointmentId         | ObjectId  | Yes      | Indexed                                     | Ref appointments.\_id              |
| clientId              | ObjectId  | Yes      | Indexed                                     | Ref users.\_id                     |
| pswId                 | ObjectId  | Yes      | Indexed                                     | Ref users.\_id                     |
| amount                | Number    | Yes      | Min 0, stored in cents                      | Monetary amount                    |
| currency              | String    | Yes      | Lowercase, max 10, default cad              | Monetary currency                  |
| status                | String    | Yes      | Enum: pending, succeeded, cancelled, failed | Payment lifecycle                  |
| stripeSessionId       | String    | Yes      | Unique, indexed                             | External payment correlation       |
| stripePaymentIntentId | String    | No       | Default empty                               | External payment correlation       |
| paidAt                | Date      | No       | Nullable                                    | Success timestamp                  |
| cancelledAt           | Date      | No       | Nullable                                    | Cancellation timestamp             |
| createdAt             | Date      | Yes      | Auto timestamp                              | Audit                              |
| updatedAt             | Date      | Yes      | Auto timestamp                              | Audit                              |

## 2.6 messages

| Field         | Data Type | Required | Constraints       | Relationship          |
| ------------- | --------- | -------- | ----------------- | --------------------- |
| \_id          | ObjectId  | Yes      | Auto-generated    | -                     |
| appointmentId | ObjectId  | Yes      | Indexed           | Ref appointments.\_id |
| senderId      | ObjectId  | Yes      | Indexed           | Ref users.\_id        |
| receiverId    | ObjectId  | Yes      | Indexed           | Ref users.\_id        |
| content       | String    | Yes      | Trimmed, max 2000 | Message body          |
| createdAt     | Date      | Yes      | Auto timestamp    | Ordering/audit        |
| updatedAt     | Date      | Yes      | Auto timestamp    | Audit                 |

Composite index:

- (appointmentId, createdAt) for ordered conversation retrieval.

## 2.7 reviews

| Field         | Data Type | Required | Constraints       | Relationship           |
| ------------- | --------- | -------- | ----------------- | ---------------------- |
| \_id          | ObjectId  | Yes      | Auto-generated    | -                      |
| appointmentId | ObjectId  | Yes      | Unique, indexed   | Ref appointments.\_id  |
| clientId      | ObjectId  | Yes      | Indexed           | Ref users.\_id         |
| pswId         | ObjectId  | Yes      | Indexed           | Ref users.\_id         |
| pswProfileId  | ObjectId  | Yes      | Indexed           | Ref pswprofiles.\_id   |
| rating        | Number    | Yes      | Min 1, max 5      | Service quality metric |
| comment       | String    | No       | Trimmed, max 2000 | Review narrative       |
| createdAt     | Date      | Yes      | Auto timestamp    | Audit                  |
| updatedAt     | Date      | Yes      | Auto timestamp    | Audit                  |

Composite index:

- (pswProfileId, createdAt desc) for profile review feed.

## 2.8 disputes

| Field          | Data Type | Required | Constraints                     | Relationship             |
| -------------- | --------- | -------- | ------------------------------- | ------------------------ |
| \_id           | ObjectId  | Yes      | Auto-generated                  | -                        |
| appointmentId  | ObjectId  | No       | Nullable, indexed               | Ref appointments.\_id    |
| clientId       | ObjectId  | No       | Nullable, indexed               | Ref users.\_id           |
| pswId          | ObjectId  | No       | Nullable, indexed               | Ref users.\_id           |
| title          | String    | Yes      | Trimmed, max 200                | Dispute summary          |
| description    | String    | Yes      | Trimmed, max 4000               | Dispute details          |
| status         | String    | Yes      | Enum: open, in_review, resolved | Dispute lifecycle        |
| resolutionNote | String    | No       | Trimmed, max 2000               | Admin resolution context |
| resolvedBy     | ObjectId  | No       | Nullable                        | Ref users.\_id (admin)   |
| resolvedAt     | Date      | No       | Nullable                        | Resolution timestamp     |
| createdAt      | Date      | Yes      | Auto timestamp                  | Audit                    |
| updatedAt      | Date      | Yes      | Auto timestamp                  | Audit                    |

## 3. Relationships Between Collections

## 3.1 User-Centric Relationships

- A user may be a client, PSW, or admin.
- A PSW user has at most one PSW profile via pswprofiles.userId (unique one-to-one).
- A user can appear as:
  - appointments.clientId
  - appointments.pswId
  - messages.senderId/receiverId
  - payments.clientId/pswId
  - reviews.clientId/pswId
  - disputes.clientId/pswId
  - pswprofiles.verifiedBy and disputes.resolvedBy (admin attribution)

## 3.2 Service Lifecycle Relationships

- Appointment is the central transactional entity linking booking, payment, communication, review, and dispute contexts.
- payment.appointmentId links payment records to appointment; appointments.paymentId back-references selected payment record.
- messages.appointmentId ties chat threads to confirmed service engagements.
- reviews.appointmentId ensures one review per completed appointment.
- disputes.appointmentId links issue reports to service transactions.

## 3.3 Verification and Document Relationships

- certificates.pswProfileId associates uploaded evidence with the PSW profile.
- PSW profile verification status controls downstream eligibility for discovery and booking.

## 3.4 Derived Data Relationships

- pswprofiles.averageRating and pswprofiles.reviewCount are derived from reviews where reviews.pswProfileId equals profile id.
