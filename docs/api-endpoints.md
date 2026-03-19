# PSWCares API Endpoint Documentation

## 1. API Overview

- Base API URL: `/api`
- Service root health message: `GET /`
- Content type: `application/json` unless multipart file upload is required.
- Authentication: JWT bearer token for protected endpoints.

## 2. Authentication and Authorization

## 2.1 Authorization Header

Use the header below for protected routes:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 2.2 Role Model

- `client`
- `psw`
- `admin`

## 2.3 Access Rules

- Some endpoints are public.
- Some endpoints require authentication only.
- Some endpoints require both authentication and role checks.

## 3. Standard Response Patterns

## 3.1 Success (typical)

```json
{
  "message": "Operation completed.",
  "data": {}
}
```

## 3.2 Error (handled by global middleware)

```json
{
  "message": "Validation or authorization error details"
}
```

Common status codes:

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `502` Upstream error (e.g., S3 upload failure)

## 4. Endpoint Catalog

| Module       | Method | Path                                          | Auth     | Roles                   |
| ------------ | ------ | --------------------------------------------- | -------- | ----------------------- |
| Root         | GET    | `/`                                           | No       | Public                  |
| Health       | GET    | `/api/health`                                 | No       | Public                  |
| Auth         | POST   | `/api/auth/register`                          | No       | Public                  |
| Auth         | POST   | `/api/auth/login`                             | No       | Public                  |
| Auth         | GET    | `/api/auth/me`                                | Yes      | client, psw, admin      |
| Auth         | GET    | `/api/auth/admin-only`                        | Yes      | admin                   |
| Admin        | GET    | `/api/admin/users`                            | Yes      | admin                   |
| Admin        | GET    | `/api/admin/verify`                           | Yes      | admin                   |
| Admin        | PATCH  | `/api/admin/verify/:profileId`                | Yes      | admin                   |
| Admin        | GET    | `/api/admin/disputes`                         | Yes      | admin                   |
| Admin        | GET    | `/api/admin/disputes/:disputeId`              | Yes      | admin                   |
| Admin        | PATCH  | `/api/admin/disputes/:disputeId`              | Yes      | admin                   |
| Admin        | GET    | `/api/admin/analytics`                        | Yes      | admin                   |
| Appointments | POST   | `/api/appointments`                           | Yes      | client                  |
| Appointments | GET    | `/api/appointments/me`                        | Yes      | client, psw, admin      |
| Appointments | PATCH  | `/api/appointments/:appointmentId/status`     | Yes      | client, psw, admin      |
| Appointments | PATCH  | `/api/appointments/:appointmentId/reschedule` | Yes      | client, psw, admin      |
| PSW Search   | GET    | `/api/psw/search`                             | No       | Public                  |
| PSW Profile  | GET    | `/api/psw-profiles/public/:profileId`         | No       | Public                  |
| PSW Profile  | PUT    | `/api/psw-profiles/me`                        | Yes      | psw                     |
| PSW Profile  | GET    | `/api/psw-profiles/me`                        | Yes      | psw                     |
| PSW Profile  | POST   | `/api/psw-profiles/me/certificates`           | Yes      | psw                     |
| Upload       | POST   | `/api/uploads/:type`                          | No       | Public                  |
| Payments     | POST   | `/api/payments/checkout-session`              | Yes      | client                  |
| Payments     | GET    | `/api/payments/success`                       | No       | Public                  |
| Payments     | GET    | `/api/payments/cancel`                        | No       | Public                  |
| Chat         | GET    | `/api/chats/:appointmentId/messages`          | Yes      | client, psw, admin      |
| Reviews      | GET    | `/api/reviews/psw-profile/:profileId`         | Optional | Public or authenticated |
| Reviews      | POST   | `/api/reviews`                                | Yes      | client                  |
| Disputes     | POST   | `/api/disputes`                               | Yes      | client                  |
| Disputes     | GET    | `/api/disputes/me`                            | Yes      | client                  |
| Disputes     | GET    | `/api/disputes/:disputeId`                    | Yes      | client, admin           |

## 5. Endpoint Details by Module

## 5.1 Root and Health

### GET /

Returns service liveness message.

Response:

```json
{
  "message": "PSWCares API is running"
}
```

### GET /api/health

Returns health payload from service layer.

## 5.2 Authentication

### POST /api/auth/register

Create new `client` or `psw` account.

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | Minimum 2 chars |
| email | string | Yes | Unique |
| password | string | Yes | Minimum 8 chars |
| role | string | No | `client` or `psw`; admin disallowed |

Response `201`:

```json
{
  "message": "User registered successfully.",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "client",
    "status": "active"
  }
}
```

### POST /api/auth/login

Authenticate existing user.

Request body:
| Field | Type | Required |
|---|---|---|
| email | string | Yes |
| password | string | Yes |

Response `200`:

```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "psw",
    "status": "active"
  }
}
```

### GET /api/auth/me

Returns authenticated user object.

Response `200`:

```json
{
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "admin",
    "status": "active"
  }
}
```

### GET /api/auth/admin-only

Admin authorization probe.

Response `200`:

```json
{
  "message": "Admin access granted."
}
```

## 5.3 Admin Module

### GET /api/admin/users

Query users with pagination and filters.

Query params:
| Param | Type | Required | Notes |
|---|---|---|---|
| page | number | No | Default 1 |
| limit | number | No | Default 20, max 100 |
| role | string | No | client/psw/admin |
| status | string | No | active/inactive/suspended |
| search | string | No | Name/email contains |

Response `200`:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 1 }
}
```

### GET /api/admin/verify

Fetch pending PSW verification queue with certificates.

Response `200`:

```json
{
  "count": 1,
  "items": [
    {
      "profile": {},
      "certificates": [
        {
          "_id": "...",
          "originalFileName": "license.pdf",
          "fileUrl": "<signed-url>",
          "s3Key": "certificates/...",
          "createdAt": "..."
        }
      ]
    }
  ]
}
```

### PATCH /api/admin/verify/:profileId

Approve/reject PSW profile.

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| status | string | Yes | `approved` or `rejected` |
| note | string | No | Verification note |

Response `200`:

```json
{
  "message": "PSW profile approved.",
  "profile": {}
}
```

### GET /api/admin/disputes

List all disputes (optional status filter).

Query params:
| Param | Type | Required | Notes |
|---|---|---|---|
| status | string | No | open/in_review/resolved |

Response `200`:

```json
{ "count": 2, "items": [{}] }
```

### GET /api/admin/disputes/:disputeId

Get dispute detail.

Response `200`:

```json
{ "dispute": {} }
```

### PATCH /api/admin/disputes/:disputeId

Update dispute status and resolution details.

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| status | string | Yes | open/in_review/resolved |
| resolutionNote | string | No | Note used in resolution workflow |

Response `200`:

```json
{ "message": "Dispute updated.", "dispute": {} }
```

### GET /api/admin/analytics

Aggregate admin dashboard metrics.

Response `200`:

```json
{
  "users": { "total": 0, "clients": 0, "psws": 0, "admins": 0 },
  "verification": { "pending": 0, "approved": 0 },
  "appointments": { "total": 0, "confirmed": 0, "completed": 0 },
  "payments": { "total": 0, "succeeded": 0 },
  "reviews": { "total": 0 },
  "disputes": { "open": 0 }
}
```

## 5.4 Appointments

### POST /api/appointments

Create booking (client only).

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| pswId | string | Yes | Target PSW user id |
| date | string | Yes | ISO-compatible date |
| time | string | Yes | HH:mm |
| duration | number | Yes | 15-720 minutes |
| notes | string | No | Max 1000 |

Response `201`:

```json
{ "message": "Appointment created successfully.", "appointment": {} }
```

### GET /api/appointments/me

List appointments scoped by actor role.

Response `200`:

```json
{ "count": 3, "items": [{}] }
```

### PATCH /api/appointments/:appointmentId/status

Update status with transition rules.

Request body:
| Field | Type | Required |
|---|---|---|
| status | string | Yes |

Response `200`:

```json
{ "message": "Appointment status updated.", "appointment": {} }
```

### PATCH /api/appointments/:appointmentId/reschedule

Reschedule active appointment.

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| date | string | Yes | New date |
| time | string | Yes | HH:mm |
| duration | number | Yes | 15-720 |
| reason | string | No | Max 1000 |

Response `200`:

```json
{ "message": "Appointment rescheduled successfully.", "appointment": {} }
```

## 5.5 PSW Search and Profiles

### GET /api/psw/search

Search approved PSWs.

Query params:
| Param | Type | Required | Notes |
|---|---|---|---|
| location | string | No | Case-insensitive contains |
| service | string | No | Case-insensitive exact element |
| experience | number | No | Minimum years |
| page | number | No | Pagination page |
| limit | number | No | Pagination size (max 50) |

Response `200`:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 1 },
  "filters": { "location": null, "service": null, "minExperience": null }
}
```

### GET /api/psw-profiles/public/:profileId

Get approved PSW profile details with certificates and reviews placeholder.

Response `200`:

```json
{ "profile": {}, "certificates": [{}], "reviews": [] }
```

### PUT /api/psw-profiles/me

Create or update authenticated PSW profile.

Request body:
| Field | Type | Required |
|---|---|---|
| bio | string | No |
| services | string[] or comma-separated string | No |
| hourlyRate | number | Yes |
| experience | number | Yes |
| location | string | Yes |

Response `200`:

```json
{ "message": "PSW profile saved successfully.", "profile": {} }
```

### GET /api/psw-profiles/me

Get authenticated PSW profile with certificate list.

Response `200`:

```json
{ "profile": {}, "certificates": [{ "fileUrl": "<signed-url>" }] }
```

### POST /api/psw-profiles/me/certificates

Upload PSW certificate document.

Request format:

- `multipart/form-data`
- Field name: `file`

Response `201`:

```json
{
  "message": "Certificate uploaded successfully.",
  "certificate": { "fileUrl": "<signed-url>" }
}
```

## 5.6 Generic Uploads

### POST /api/uploads/:type

Upload file directly by type.

Path param:
| Param | Allowed Values |
|---|---|
| type | `certificates`, `profile-images` |

Request format:

- `multipart/form-data`
- Field name: `file`

Response `201`:

```json
{
  "message": "File uploaded successfully.",
  "key": "...",
  "fileUrl": "https://..."
}
```

## 5.7 Payments

### POST /api/payments/checkout-session

Create Stripe checkout session (client only).

Request body:
| Field | Type | Required |
|---|---|---|
| appointmentId | string | Yes |

Response `201`:

```json
{
  "message": "Stripe checkout session created.",
  "payment": {},
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

### GET /api/payments/success

Process Stripe success callback.

Query params:
| Param | Type | Required |
|---|---|---|
| session_id | string | Yes |

Response `200`:

```json
{ "message": "Payment success processed.", "payment": {} }
```

### GET /api/payments/cancel

Process Stripe cancellation callback.

Query params:
| Param | Type | Required |
|---|---|---|
| session_id | string | Yes |

Response `200`:

```json
{ "message": "Payment cancellation processed.", "payment": {} }
```

## 5.8 Chat

### GET /api/chats/:appointmentId/messages

Retrieve message history for appointment participants/admin.

Response `200`:

```json
{ "appointmentId": "...", "count": 4, "items": [{}] }
```

## 5.9 Reviews

### GET /api/reviews/psw-profile/:profileId

Get PSW reviews and eligible completed appointments for authenticated clients.

Auth behavior:

- Public access allowed.
- If authenticated as client, includes `eligibleAppointments` for review submission.

Response `200`:

```json
{ "profile": {}, "reviews": [{}], "eligibleAppointments": [{}] }
```

### POST /api/reviews

Submit review (client only).

Request body:
| Field | Type | Required |
|---|---|---|
| appointmentId | string | Yes |
| rating | number | Yes |
| comment | string | No |

Response `201`:

```json
{ "message": "Review submitted successfully.", "review": {} }
```

## 5.10 Disputes

### POST /api/disputes

Create dispute for client-owned appointment.

Request body:
| Field | Type | Required |
|---|---|---|
| appointmentId | string | Yes |
| title | string | Yes |
| description | string | Yes |

Response `201`:

```json
{ "message": "Dispute submitted.", "dispute": {} }
```

### GET /api/disputes/me

List authenticated client disputes.

Query params:
| Param | Type | Required |
|---|---|---|
| status | string | No |

Response `200`:

```json
{ "count": 2, "items": [{}] }
```

### GET /api/disputes/:disputeId

Get dispute details (client owner or admin).

Response `200`:

```json
{ "dispute": {} }
```

## 6. File Upload Constraints

- Maximum file size: 10 MB.
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
- Certificate/profile file storage uses S3 key prefixes and backend validation.

## 7. Notes for Frontend Integrators

- Certificate `fileUrl` returned by profile/admin verification endpoints is signed and time-limited; refresh queue/profile data to get renewed links.
- Generic upload endpoint currently returns raw S3 URL after upload; if the bucket is private, frontend should request document views through endpoints that provide signed URLs.
