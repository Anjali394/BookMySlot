# Software Requirements Specification (SRS)

## BookMySlot — Appointment Slot Booking API

**Version:** 1.0  
**Author:** Anjali Rajput  
**Date:** June 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [User Roles](#3-user-roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Database Design](#7-database-design)
8. [API Modules](#8-api-modules)
9. [Booking Workflow](#9-booking-workflow)
10. [Security Requirements](#10-security-requirements)
11. [Constraints & Assumptions](#11-constraints--assumptions)

---

## 1. Introduction

### 1.1 Purpose

This document describes the software requirements for **BookMySlot**, a backend REST API for appointment and slot booking. It defines the functional and non-functional requirements, system constraints, and design decisions that govern the system.

### 1.2 Scope

BookMySlot allows service providers (doctors, salons, trainers, etc.) to manage appointment availability and enables customers to discover and book time slots. An admin role oversees the platform.

The system is:
- A **backend-only REST API** — no frontend is included in v1.0
- Deployed on **Vercel** with a **Neon PostgreSQL** database
- Documented via **Swagger UI** at `/api-docs`

### 1.3 Definitions

| Term | Definition |
|---|---|
| Provider | A registered user who offers bookable services |
| Customer | A registered user who books slots |
| Clinic | A physical or virtual location managed by a Provider |
| Slot | A concrete time window on a specific date available for booking |
| Availability | Weekly schedule template that defines working hours per day for a Clinic |
| Booking | A Customer's reservation of a Slot |

---

## 2. Overall Description

### 2.1 Product Perspective

BookMySlot is a standalone REST API. Clients (mobile apps, web frontends, Postman) communicate with it over HTTP using JSON.

### 2.2 Product Functions (Summary)

- User registration and authentication (JWT-based)
- Provider business and clinic management
- Availability configuration per clinic per day of week
- Slot generation from availability templates
- Slot booking with capacity enforcement
- Booking status lifecycle management
- Admin oversight of users, providers, and bookings

### 2.3 Operating Environment

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js v5
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma
- **Deployment:** Vercel (serverless)

---

## 3. User Roles

### 3.1 CUSTOMER

A registered user who searches for providers, views available slots, and makes bookings.

### 3.2 PROVIDER

A registered user who manages their business profile, clinics, availability schedules, and appointment slots. Handles incoming booking requests.

### 3.3 ADMIN

A platform administrator who monitors all users, providers, and bookings. Can suspend user accounts. Created via a seed script.

---

## 4. Functional Requirements

### 4.1 Authentication Module (`/api/v1/auth`)

| ID | Requirement |
|---|---|
| FR-AUTH-01 | A user shall be able to register with name, email, password, and an optional role (`CUSTOMER` or `PROVIDER`). Default role is `CUSTOMER`. |
| FR-AUTH-02 | Registration shall fail if the email is already in use. |
| FR-AUTH-03 | Passwords shall be hashed using bcrypt (12 salt rounds) before storage. |
| FR-AUTH-04 | A user shall be able to log in with email and password and receive an access token and a refresh token. |
| FR-AUTH-05 | Login shall fail with a generic error message for invalid credentials (no email enumeration). |
| FR-AUTH-06 | Login shall be blocked for suspended accounts. |
| FR-AUTH-07 | The access token shall be a short-lived JWT (default: 1 day). |
| FR-AUTH-08 | The refresh token shall be stored in the database with an expiry (default: 7 days). |
| FR-AUTH-09 | A valid refresh token shall issue a new access token and a new refresh token (rotation). The old refresh token is deleted. |
| FR-AUTH-10 | A user shall be able to log out by invalidating their refresh token. |
| FR-AUTH-11 | An authenticated user shall be able to retrieve their own profile (`GET /auth/me`). |

### 4.2 Provider Module (`/api/v1/providers`)

| ID | Requirement |
|---|---|
| FR-PROV-01 | A PROVIDER user shall be able to register a business profile (bio, business name, category, phone, address). |
| FR-PROV-02 | A provider may only have one business profile. |
| FR-PROV-03 | A provider shall be able to view and update their own profile and business details. |
| FR-PROV-04 | Any user (unauthenticated) shall be able to list providers, filterable by category and search term, with pagination. |
| FR-PROV-05 | Any user shall be able to view a specific provider's public profile by ID. |

### 4.3 Clinic Module (`/api/v1/clinics`)

| ID | Requirement |
|---|---|
| FR-CLINIC-01 | A PROVIDER shall be able to create one or more clinics with name, address, and optional phone. |
| FR-CLINIC-02 | A PROVIDER shall be able to view, update, and list their own clinics. |
| FR-CLINIC-03 | A PROVIDER shall be able to set availability for a clinic per day of week (start time, end time, slot duration in minutes, capacity per slot). |
| FR-CLINIC-04 | Each clinic may have at most one availability record per day of week. |
| FR-CLINIC-05 | A PROVIDER shall be able to remove an availability record. |
| FR-CLINIC-06 | Any user shall be able to view a clinic's details and availability schedule. |

### 4.4 Slot Module (`/api/v1/slots`)

| ID | Requirement |
|---|---|
| FR-SLOT-01 | A PROVIDER shall be able to generate slots for a clinic on a specific date. Slots are derived from the clinic's availability for that day of the week. |
| FR-SLOT-02 | Slot generation shall fail if no availability is configured for that day. |
| FR-SLOT-03 | Each slot shall be unique per clinic + date + start time. Duplicate generation attempts shall be silently skipped (upsert). |
| FR-SLOT-04 | A PROVIDER shall be able to block or unblock a specific slot. Blocked slots cannot be booked. |
| FR-SLOT-05 | Any user shall be able to list slots for a clinic on a given date, including available capacity per slot. |
| FR-SLOT-06 | Available capacity is calculated as: `totalCapacity − activeBookings` where active bookings are in `PENDING_CONFIRMATION` or `CONFIRMED` status. |

### 4.5 Booking Module (`/api/v1/bookings`)

| ID | Requirement |
|---|---|
| FR-BOOK-01 | A CUSTOMER shall be able to create a booking for an available slot, with optional notes. |
| FR-BOOK-02 | Booking shall fail if the slot does not exist, is blocked, or has no available capacity. |
| FR-BOOK-03 | A new booking shall be created with status `PENDING_CONFIRMATION`. |
| FR-BOOK-04 | A CUSTOMER shall be able to view their own booking history with pagination. |
| FR-BOOK-05 | A CUSTOMER or PROVIDER shall be able to cancel a booking. Customers may only cancel their own bookings. |
| FR-BOOK-06 | Cancellation shall only be allowed for bookings in `PENDING_CONFIRMATION` or `CONFIRMED` status. |
| FR-BOOK-07 | A PROVIDER shall be able to confirm or reject a booking that is in `PENDING_CONFIRMATION` status. |
| FR-BOOK-08 | A PROVIDER shall only be able to manage bookings that belong to their own clinics. |
| FR-BOOK-09 | A PROVIDER shall be able to list all bookings across their clinics with pagination. |
| FR-BOOK-10 | Any authenticated user shall be able to fetch a booking by ID, subject to ownership checks. |
| FR-BOOK-11 | Every status change shall be recorded in `BookingStatusHistory` with a timestamp and optional reason. |

### 4.6 Admin Module (`/api/v1/admin`)

| ID | Requirement |
|---|---|
| FR-ADMIN-01 | All admin routes shall require `ADMIN` role. |
| FR-ADMIN-02 | Admin shall be able to list all users, filterable by role and search term, with pagination. |
| FR-ADMIN-03 | Admin shall be able to view a specific user's details by ID. |
| FR-ADMIN-04 | Admin shall be able to suspend or reactivate any non-admin user account. |
| FR-ADMIN-05 | Admin shall be able to list all providers with pagination. |
| FR-ADMIN-06 | Admin shall be able to list all bookings, filterable by status, with pagination. |
| FR-ADMIN-07 | Admin shall be able to view platform-wide statistics (total users, providers, bookings, etc.). |

---

## 5. Non-Functional Requirements

### 5.1 Performance

- API responses shall complete within 500ms under normal load.
- Paginated list endpoints shall default to 10 items per page.

### 5.2 Security

- All passwords are hashed with bcrypt (12 rounds).
- JWT access tokens expire in 1 day; refresh tokens in 7 days.
- Refresh tokens are rotated on every use (old token deleted).
- All routes mutating data require authentication.
- Role-based access control (RBAC) enforced via middleware.
- Auth endpoints are rate-limited to 10 requests per 15 minutes per IP.
- All endpoints are globally rate-limited to 100 requests per 15 minutes per IP.
- Input validation is applied on all request bodies and query parameters.
- Prisma ORM provides SQL injection protection.

### 5.3 Reliability

- Booking creation checks slot capacity atomically to prevent double-booking.
- Booking status transitions are validated — invalid transitions are rejected.
- An admin account cannot be suspended.

### 5.4 Maintainability

- Code follows a 4-layer architecture: Route → Controller → Service → Repository.
- Business logic lives exclusively in the Service layer.
- All database queries are isolated in the Repository layer.
- Custom `ApiError` class standardises error responses across all modules.
- Custom `ApiResponse` class standardises success responses.

### 5.5 Testability

- Integration tests cover auth, booking, and provider flows using Jest and Supertest.
- Tests run with `npm test` and target a real database connection.

---

## 6. System Architecture

```
Client (HTTP)
     │
     ▼
Express Middleware
  ├── Rate Limiter (global / auth)
  ├── JSON Body Parser
  └── Auth Middleware (JWT verify + RBAC)
     │
     ▼
Route Layer  (/api/v1/*)
     │
     ▼
Validator Layer (express-validator)
     │
     ▼
Controller Layer (HTTP in/out)
     │
     ▼
Service Layer (business logic)
     │
     ▼
Repository Layer (DB queries)
     │
     ▼
Prisma ORM
     │
     ▼
PostgreSQL (Neon)
```

---

## 7. Database Design

### 7.1 Entities

| Model | Description |
|---|---|
| `User` | Platform account with role: CUSTOMER, PROVIDER, or ADMIN |
| `Provider` | Extended profile for PROVIDER users |
| `Business` | Business details attached to a Provider (1-to-1) |
| `Clinic` | A location managed by a Provider (1-to-many) |
| `ProviderAvailability` | Working hours per day of week for a Clinic |
| `Slot` | A concrete bookable time window on a specific date |
| `Booking` | A Customer's reservation of a Slot |
| `BookingStatusHistory` | Audit log of all status changes on a Booking |
| `RefreshToken` | Persisted refresh tokens for JWT rotation |

### 7.2 Key Constraints

- `User.email` is unique.
- `ProviderAvailability` is unique per `(clinicId, dayOfWeek)`.
- `Slot` is unique per `(clinicId, date, startTime)`.
- Cascade deletes: deleting a User removes their Provider, Clinics, Slots, Bookings, and RefreshTokens.

### 7.3 Booking Status FSM

```
PENDING_CONFIRMATION
       │
       ├──────────────► CONFIRMED
       │                    │
       ├──────────────► REJECTED
       │
       └──────────────► CANCELLED  (also from CONFIRMED)
```

---

## 8. API Modules

| Base Path | Module | Auth Required |
|---|---|---|
| `/api/v1/auth` | Authentication | Partial |
| `/api/v1/providers` | Provider management | Partial (public list/get) |
| `/api/v1/clinics` | Clinic management | Partial (public get) |
| `/api/v1/slots` | Slot generation & listing | Partial (public list) |
| `/api/v1/bookings` | Booking operations | Yes |
| `/api/v1/admin` | Admin operations | Yes (ADMIN only) |

Full interactive documentation: `/api-docs`

---

## 9. Booking Workflow

```
1. Provider registers → creates Clinic → sets Availability
2. Provider generates Slots for a specific date
3. Customer registers → logs in → lists available Slots
4. Customer creates a Booking (status: PENDING_CONFIRMATION)
5. Provider reviews → CONFIRMS or REJECTS the Booking
6. Either party may CANCEL a PENDING or CONFIRMED Booking
7. All status changes are logged in BookingStatusHistory
```

---

## 10. Security Requirements

| Requirement | Implementation |
|---|---|
| Authentication | JWT Bearer tokens |
| Password storage | bcrypt, 12 salt rounds |
| Authorisation | Role-based middleware (`authenticate` + `authorize`) |
| Input validation | express-validator on all endpoints |
| SQL injection | Prisma ORM (parameterised queries) |
| Brute-force protection | Rate limiter: 10 req/15min on auth routes |
| General rate limiting | 100 req/15min globally per IP |
| Token rotation | Refresh tokens invalidated after each use |

---

## 11. Constraints & Assumptions

- **No frontend** is part of v1.0. The API is consumed by external clients.
- **No email notifications** — booking confirmations are only reflected in API responses.
- **No payment processing** — out of scope for v1.0.
- **Single timezone** — all times are stored as strings (`"HH:MM"`); timezone handling is the client's responsibility.
- **Vercel serverless** — the app is stateless; no in-process caching (e.g., Redis) is used.
- The **admin user must be seeded** via `npm run seed` before admin routes are accessible.
- Slot generation is **on-demand** — providers must explicitly generate slots per date; there is no automatic generation.
