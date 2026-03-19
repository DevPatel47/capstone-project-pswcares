# Normalization to Third Normal Form (3NF) - PSWCares

## 1. Objective

This document explains how PSWCares operational data can be normalized from an initial unstructured view into Third Normal Form (3NF) to reduce redundancy, improve consistency, and maintain clear update rules.

## 2. Starting Point: Conceptual UNF Dataset

Assume a single broad record structure captured from UI workflows:

- User data: userName, userEmail, role, status
- PSW profile data: bio, services (multi-value), hourlyRate, location, verificationStatus
- Booking data: appointmentDate, appointmentTime, duration, notes
- Payment data: paymentStatus, stripeSessionId, amount
- Chat data: messages (repeating list)
- Review data: rating, comment
- Dispute data: disputeTitle, disputeStatus, resolutionNote

Problems in UNF:

- Repeating groups (services list, messages list) in one record.
- Mixed entities in one row (user, booking, payment, dispute).
- High redundancy (user and PSW details repeated for each appointment).
- Update anomalies (changing PSW location requires many row updates).

## 3. First Normal Form (1NF)

Rule applied:

- Eliminate repeating groups and enforce atomic values per field.

Transformation:

- Split repeating message list into individual message records.
- Store services as discrete values within a profile-scoped collection document field.
- Ensure each row/document instance represents one fact set for one entity occurrence.

Resulting entity groups at 1NF level:

- Users
- PSWProfiles
- Certificates
- Appointments
- Payments
- Messages
- Reviews
- Disputes

1NF gain:

- Atomic fields and consistent row-level granularity.

## 4. Second Normal Form (2NF)

Rule applied:

- Remove partial dependency on part of a composite key.
- In document databases, this maps to isolating attributes so each entity depends on its own identifier.

Functional dependency examples:

- userId -> name, email, role, status
- appointmentId -> appointmentDate, appointmentTime, duration, status, notes
- stripeSessionId -> payment status attributes

2NF actions:

- User attributes are stored only in Users, not duplicated in Appointments/Payments/Disputes.
- PSW profile attributes (bio, rate, location, verification status) are stored only in PSWProfiles.
- Payment details are separated from Appointments and referenced by appointmentId/paymentId.

2NF gain:

- Eliminates partial and contextual duplication.
- Reduces inconsistent updates across booking/payment boundaries.

## 5. Third Normal Form (3NF)

Rule applied:

- Remove transitive dependencies (non-key attributes should not depend on other non-key attributes).

Key transitive dependency removals:

- In Appointments, do not store PSW profile details (hourlyRate/location). Keep only pswId reference.
- In Reviews, do not store derived profile aggregates directly in each review row.
- In Disputes, resolver metadata is tied to dispute lifecycle state, not copied from Users.

3NF-aligned final structure:

- Users is authoritative for account identity and role.
- PSWProfiles is authoritative for provider profile and verification metadata.
- Certificates stores file evidence and links to profile.
- Appointments stores service transactions between client and PSW.
- Payments stores payment lifecycle and provider correlation ids.
- Messages stores communication events by appointment.
- Reviews stores one rating per appointment and links to PSW profile.
- Disputes stores issue lifecycle and admin resolution metadata.

Derived data policy in 3NF context:

- averageRating and reviewCount in PSWProfiles are controlled denormalized aggregates maintained by service logic after review writes.
- This is intentional denormalization for read efficiency while preserving source of truth in Reviews.

## 6. Redundancy Removal Summary

| Redundancy Source                                        | Pre-Normalization Risk                  | 3NF Resolution                                                       |
| -------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| User details duplicated in booking/payment/dispute views | Inconsistent names/emails after updates | Store once in Users and reference by ObjectId                        |
| Payment details embedded in appointments                 | Conflicting status and audit state      | Separate Payments collection with explicit lifecycle                 |
| Review aggregates duplicated per review record           | Aggregate drift and conflicting values  | Keep review facts in Reviews; compute/store aggregate in PSWProfiles |
| Verification details repeated per certificate            | Conflicting decision state              | Keep verification in PSWProfiles, certificate metadata separate      |

## 7. Functional Dependencies (Representative)

- users.\_id -> users.name, users.email, users.role, users.status
- pswprofiles.\_id -> pswprofiles.userId, bio, services, hourlyRate, experience, location, verification fields
- appointments.\_id -> clientId, pswId, appointmentDate, appointmentTime, durationMinutes, status
- payments.\_id -> appointmentId, clientId, pswId, amount, currency, status, stripeSessionId
- messages.\_id -> appointmentId, senderId, receiverId, content, createdAt
- reviews.\_id -> appointmentId, clientId, pswId, pswProfileId, rating, comment
- disputes.\_id -> appointmentId, clientId, pswId, title, description, status, resolution fields

## 8. Final 3NF Outcome

The PSWCares schema achieves practical 3NF with domain-focused collections and explicit references:

- Minimal duplication of mutable attributes.
- Predictable update paths.
- Clear ownership of data by entity boundary.
- Strong support for role-based workflows and lifecycle transitions.
