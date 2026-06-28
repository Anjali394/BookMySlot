# BookMySlot

> A production-style REST API for appointment and slot booking built with **Node.js, Express.js, PostgreSQL, and Prisma**.

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Live Links

| | URL |
|---|---|
| **API** | https://book-my-slot-peach.vercel.app |
| **Swagger Docs** | https://book-my-slot-peach.vercel.app/api-docs |
| **Health Check** | https://book-my-slot-peach.vercel.app/health |

---

# Overview

BookMySlot is a backend appointment booking platform that allows businesses to manage appointments while enabling customers to book available time slots.

The project demonstrates production-level backend engineering concepts including:

* RESTful API Design
* Authentication & Authorization
* PostgreSQL Database Design
* Prisma ORM
* Transaction Management
* Clean Architecture
* Unit & Integration Testing
* API Documentation using Swagger

This project is designed to be domain-independent and can be used by:

* Doctors
* Dentists
* Salons
* Fitness Trainers
* Lawyers
* Consultants
* Tutors
* Wellness Centers
* Physiotherapists

---

# Features

## Customer

* Register
* Login
* Search Providers
* Search Clinics
* View Available Slots
* Book Appointment
* Cancel Booking
* View Booking History

---

## Provider

* Register Business
* Manage Clinics
* Configure Working Hours
* Generate Appointment Slots
* Review Booking Requests
* Confirm Bookings
* Reject Bookings
* Block Dates

---

## Admin

* Manage Users
* Manage Providers
* View System Bookings
* Suspend Accounts

---

# Tech Stack

| Category          | Technology        |
| ----------------- | ----------------- |
| Backend           | Node.js           |
| Framework         | Express.js        |
| Database          | PostgreSQL (Neon) |
| ORM               | Prisma            |
| Authentication    | JWT + bcrypt      |
| Testing           | Jest + Supertest  |
| API Documentation | Swagger (OpenAPI) |
| Deployment        | Vercel            |
| Version Control   | Git & GitHub      |
| API Testing       | Postman           |

---

# Project Architecture

```
Client

        │

        ▼

Express Routes

        │

        ▼

Controllers

        │

        ▼

Services

        │

        ▼

Repositories

        │

        ▼

Prisma ORM

        │

        ▼

PostgreSQL (Neon)
```

---

# Folder Structure

```
bookmyslot/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── tests/
│
└── README.md
```

---

# Database Entities

The system consists of the following core entities:

* Users
* Providers
* Businesses
* Clinics
* Provider Availability
* Slots
* Bookings
* Booking Status History
* Refresh Tokens

---

# Booking Workflow

```
Customer

      │

      ▼

Select Slot

      │

      ▼

Booking Created

      │

      ▼

PENDING_CONFIRMATION

      │

      ▼

Provider Reviews Request

      ├──────────────┐
      ▼              ▼

CONFIRMED        REJECTED

      │              │
      ▼              ▼

Slot Reserved   Slot Released
```

---

# Slot Capacity Management

Each appointment slot has configurable capacity.

Example:

| Time  | Total | Pending | Confirmed | Available |
| ----- | ----: | ------: | --------: | --------: |
| 10-11 |     5 |       2 |         1 |         2 |
| 11-12 |     5 |       0 |         4 |         1 |
| 12-1  |     5 |       5 |         0 |         0 |

Available Capacity is calculated as:

```
Available =
Total Capacity
− Pending Confirmations
− Confirmed Bookings
```

Customers can only book slots where:

```
Available Capacity > 0
```

---

# API Modules

* Authentication
* Providers
* Clinics
* Slots
* Bookings
* Admin

---

# Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Input Validation
* SQL Injection Protection (Prisma)
* Rate Limiting
* Protected Routes

---

# Reliability

* PostgreSQL Transactions
* Atomic Booking Operations
* Rollback on Failure
* Prevents Double Booking

---

# Testing

The project includes:

* Unit Tests
* Integration Tests
* API Tests

Tools:

* Jest
* Supertest

---

# API Documentation

Swagger documentation is available after running the application.

```
http://localhost:3000/api-docs
```

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/Anjali394/BookMySlot.git

cd BookMySlot
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000

DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d

JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=development
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migrations

```bash
npx prisma migrate dev
```

---

## Seed Admin User

```bash
npm run seed
```

This creates the default admin account needed to access `/api/v1/admin` routes.

---

## Start Development Server

```bash
npm run dev
```

---

# Running Tests

```bash
npm test
```

or

```bash
npm run test
```

---

# Deployment

Backend:

* Vercel

Database:

* Neon PostgreSQL

Future Full Stack Deployment:

* Railway

---

# Future Enhancements

The following features are intentionally out of scope for Version 1.

* React Frontend
* Docker
* Redis Caching
* Payment Gateway
* Email Notifications
* SMS Notifications
* Google Calendar Integration
* Appointment Reminders
* Analytics Dashboard
* CI/CD Pipeline
* Multi-language Support

---

# Documentation

This repository contains:

* [Software Requirement Specification (SRS)](docs/SRS.md)
* Swagger Documentation (live at `/api-docs`)
* README

---

# Learning Objectives

This project demonstrates practical backend engineering skills including:

* Clean Architecture
* REST API Development
* Authentication & Authorization
* Database Design
* Prisma ORM
* PostgreSQL Transactions
* Repository Pattern
* Error Handling
* Testing
* Deployment

---

# Project Status

**Current Version:** `v1.0`

Under active development.

---

# Author

**Anjali Rajput**

Backend Developer

---

# License

This project is licensed under the MIT License.
