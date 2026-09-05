# BSC Exclusive Tracking — Full-Stack Platform

> Enterprise Process & Compliance Tracking with Live GPS, Evidence Uploads, Supervisor Approvals and Complete Audit Trails.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Flow Diagrams](#flow-diagrams)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Role-Based Access Control](#role-based-access-control)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

BSC Exclusive Tracking is a full-stack web application designed for enterprise teams that need to track compliance processes, verify employee locations, collect evidence, and maintain complete audit trails. The system enforces accountability through GPS tracking, photo/document evidence, supervisor approvals, and automated compliance workflows.

**Live URLs:**
- Frontend: https://bsc-v1-seven.vercel.app
- Backend API: https://bsc-v1.onrender.com

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    REACT 19 (Vite)                            │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ Consent  │  │  Auth    │  │ Tracking │  │  Pages   │    │  │
│  │  │  Gate    │→ │ Provider │→ │ Provider │→ │ (Routes) │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │                  API Client (fetch)                   │    │  │
│  │  │         credentials: include (cross-origin)           │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                    HTTPS /api/* requests                             │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   VERCEL (CDN)       │
                    │   Static Hosting     │
                    │   + /api proxy        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   RENDER            │
                    │   Node.js/Express   │
                    │   REST API          │
                    └──┬──────┬──────┬───┘
                       │      │      │
          ┌────────────▼┐  ┌──▼───┐  ▼──────────────┐
          │  SUPABASE    │  │ JWT  │  SUPABASE       │
          │  PostgreSQL  │  │ Auth │  Storage         │
          │  (Database)  │  │(Cookie)│ (File Uploads) │
          └──────────────┘  └──────┘  └──────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite + TypeScript | SPA with code splitting |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Charts** | Recharts | Dashboard analytics |
| **Maps** | Leaflet | Live GPS tracking map |
| **Backend** | Node.js + Express + TypeScript | REST API server |
| **Authentication** | JWT (jose) + bcryptjs | Secure session management |
| **File Upload** | Multer + Supabase Storage | Evidence file handling |
| **Background Jobs** | node-cron | Auto-approval scheduler |
| **Database** | PostgreSQL (Supabase) | Relational data storage |
| **Frontend Deploy** | Vercel | Static hosting + CDN |
| **Backend Deploy** | Render | Node.js hosting |

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | 6 roles: ADMIN, MANAGER, SUPERVISOR, AUDITOR, USER, VIEWER with 40+ granular permissions |
| **Admin-Only Account Creation** | No public sign-up; only administrators create user accounts |
| **Process Modules** | Organize checkpoints into modules by department |
| **Checkpoints** | Daily, weekly, monthly, and one-time compliance checkpoints |
| **Evidence Uploads** | Images (JPG/PNG/WEBP/GIF), PDF, CSV, Audio (MP3/WAV/M4A/OGG/AAC) |
| **Live GPS Tracking** | Automatic location reporting every 30 minutes with admin map |
| **Auto-Approval** | Submissions unreviewed for 1 hour are auto-approved |
| **Supervisor Approvals** | Approve/reject with comments and escalation |
| **Audit Trail** | Every action logged with before/after payloads, IP, user agent |
| **Notifications** | Real-time in-app notifications with unread badge |
| **Reports & Exports** | Compliance analytics with CSV export |
| **Calendar View** | Monthly compliance overview with per-day details |

### Admin Features

- Full user management (create, edit, deactivate, delete)
- Module and checkpoint CRUD with cloning
- Assignment management with frequency scheduling
- Live GPS tracking map with team locations
- Audit log viewer with filters
- System settings configuration
- Bulk actions (activate/deactivate/delete)

### Supervisor Features

- Team dashboard with KPIs
- Submission approval/rejection workflow
- Employee management
- Department and project oversight
- Activity logs and team reports

### User Features

- Personal dashboard with today's tasks
- Checkpoint submission with evidence
- Location sync status indicator
- Submission history and reports
- Calendar view

---

## Project Structure

```
bsc_v1/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ConsentGate.tsx  # Mandatory terms + location consent
│   │   │   ├── AppShell.tsx     # Layout wrapper with sidebar
│   │   │   ├── EvidenceUploader.tsx  # File upload component
│   │   │   ├── Modal.tsx        # Dialog component
│   │   │   ├── StatCard.tsx     # KPI card
│   │   │   ├── StatusBadge.tsx  # Status pill
│   │   │   └── States.tsx       # Loading/error states
│   │   ├── lib/
│   │   │   ├── api.ts           # HTTP client (fetch wrapper)
│   │   │   ├── auth.tsx         # Auth context + hooks
│   │   │   ├── tracking.tsx     # GPS tracking provider
│   │   │   ├── types.ts         # TypeScript interfaces
│   │   │   └── format.ts        # Date/number formatters
│   │   ├── pages/
│   │   │   ├── Landing.tsx      # Public landing page
│   │   │   ├── Login.tsx        # Login page
│   │   │   ├── Dashboard.tsx    # User dashboard
│   │   │   ├── Modules.tsx      # Module listing
│   │   │   ├── ModuleDetail.tsx # Module checkpoints
│   │   │   ├── CheckpointDetail.tsx  # Submission form
│   │   │   ├── History.tsx      # Submission history
│   │   │   ├── Reports.tsx      # User reports
│   │   │   ├── CalendarPage.tsx # Calendar view
│   │   │   ├── Profile.tsx      # User profile
│   │   │   ├── admin/           # Admin pages (13 pages)
│   │   │   └── supervisor/      # Supervisor pages (8 pages)
│   │   ├── App.tsx              # Route definitions
│   │   └── main.tsx             # Entry point
│   ├── vercel.json              # Vercel config + API proxy
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── server.ts            # Entry point
│   │   ├── app.ts               # Express app factory
│   │   ├── config.ts            # Environment config
│   │   ├── db.ts                # PostgreSQL pool
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT auth + RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts   # Login/logout/session
│   │   │   ├── admin.routes.ts  # Admin CRUD endpoints
│   │   │   ├── modules.routes.ts    # User module endpoints
│   │   │   ├── checkpoints.routes.ts # Checkpoint details
│   │   │   ├── submissions.routes.ts # Submission workflow
│   │   │   ├── evidence.routes.ts    # File upload/download
│   │   │   ├── tracking.routes.ts    # GPS tracking
│   │   │   ├── dashboard.routes.ts   # Dashboard data
│   │   │   ├── reports.routes.ts     # Analytics
│   │   │   ├── notifications.routes.ts # Notifications
│   │   │   ├── calendar.routes.ts    # Calendar data
│   │   │   ├── profile.routes.ts     # User profile
│   │   │   ├── supervisor.routes.ts  # Supervisor endpoints
│   │   │   └── public.routes.ts      # Public stats
│   │   ├── jobs/
│   │   │   └── autoApproval.ts  # Auto-approval cron job
│   │   └── utils/
│   │       ├── audit.ts         # Audit logging
│   │       ├── http.ts          # Response helpers
│   │       ├── notify.ts        # Notification sender
│   │       ├── review.ts        # Review logic
│   │       └── session.ts       # JWT session management
│   ├── tsconfig.json
│   └── package.json
│
├── database/                    # SQL schema + seeds
│   ├── schema.sql               # Full PostgreSQL schema
│   ├── supabase-complete-setup.sql  # Supabase setup script
│   ├── supabase-storage-setup.sql   # Storage bucket setup
│   ├── init.mjs                 # DB initialization script
│   └── package.json
│
├── render.yaml                  # Render deployment blueprint
└── README.md                    # This file
```

---

## Flow Diagrams

### 1. Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │ Backend  │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Enter      │                │                │
     │  credentials   │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │  2. POST       │                │
     │                │  /api/auth/    │                │
     │                │  login         │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  3. Query      │
     │                │                │  user by       │
     │                │                │  username      │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │  4. User rows  │
     │                │                │<───────────────│
     │                │                │                │
     │                │                │  5. Verify     │
     │                │                │  password      │
     │                │                │  (bcrypt)      │
     │                │                │                │
     │                │                │  6. Create     │
     │                │                │  JWT session   │
     │                │                │  + DB row      │
     │                │                │───────────────>│
     │                │                │                │
     │                │  7. Set cookie │                │
     │                │  (sameSite:   │                │
     │                │   none)        │                │
     │                │<───────────────│                │
     │                │                │                │
     │                │  8. GET        │                │
     │                │  /api/auth/me  │                │
     │                │───────────────>│                │
     │                │                │  9. Verify JWT │
     │                │                │  Load user     │
     │                │                │───────────────>│
     │                │                │                │
     │  10. Redirect  │  11. User +   │                │
     │  to dashboard  │  permissions  │                │
     │<───────────────│<──────────────│                │
     │                │                │                │
```

### 2. Evidence Upload Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │ Backend  │     │ Multer   │     │ Supabase │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │  1. Select     │                │                │                │
     │  file(s)       │                │                │                │
     │───────────────>│                │                │                │
     │                │                │                │                │
     │                │  2. POST       │                │                │
     │                │  /api/evidence │                │                │
     │                │  (FormData)    │                │                │
     │                │───────────────>│                │                │
     │                │                │                │                │
     │                │                │  3. Parse      │                │
     │                │                │  multipart     │                │
     │                │                │───────────────>│                │
     │                │                │                │                │
     │                │                │  4. Validate   │                │
     │                │                │  MIME type     │                │
     │                │                │  (allowlist)   │                │
     │                │                │                │                │
     │                │                │  5. Check      │                │
     │                │                │  file size     │                │
     │                │                │  (25MB max)    │                │
     │                │                │                │                │
     │                │                │  6. Upload     │                │
     │                │                │  to Supabase   │                │
     │                │                │  Storage       │                │
     │                │                │───────────────────────────────>│
     │                │                │                │                │
     │                │                │  7. Get        │                │
     │                │                │  public URL    │                │
     │                │                │<───────────────────────────────│
     │                │                │                │                │
     │                │                │  8. INSERT     │                │
     │                │                │  evidence_files│                │
     │                │                │───────────────>│                │
     │                │                │                │                │
     │                │  9. Return     │                │                │
     │                │  metadata +    │                │                │
     │                │  URL           │                │                │
     │                │<───────────────│                │                │
     │                │                │                │                │
     │  10. Show      │                │                │                │
     │  in list       │                │                │                │
     │<───────────────│                │                │                │
     │                │                │                │                │
```

### 3. GPS Tracking Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │     │ Frontend │     │ Backend  │     │ Database │
│  (GPS)   │     │ Tracking │     │          │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. User       │                │                │
     │  logs in       │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │  2. Check      │                │
     │                │  permissions   │                │
     │                │  (tracking:    │                │
     │                │   update)      │                │
     │                │                │                │
     │  3. Request    │                │                │
     │  geolocation   │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │  4. GPS        │                │                │
     │  coordinates   │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │  5. POST       │                │
     │                │  /api/tracking │                │
     │                │  {lat,lng,     │                │
     │                │   accuracy}    │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  6. INSERT     │
     │                │                │  location_     │
     │                │                │  tracks        │
     │                │                │───────────────>│
     │                │                │                │
     │                │  7. 200 OK     │                │
     │                │<───────────────│                │
     │                │                │                │
     │                │  (repeats every 30 minutes)     │
     │                │                │                │
     │                │                │                │
     │  ┌─────────────┼────────────────┼────────────────┤
     │  │ ADMIN VIEW  │                │                │
     │  └─────────────┼────────────────┼────────────────┤
     │                │                │                │
     │                │  8. GET        │                │
     │                │  /api/tracking │                │
     │                │  /latest       │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  9. Query      │
     │                │                │  latest per    │
     │                │                │  user + online │
     │                │                │  status        │
     │                │                │───────────────>│
     │                │                │                │
     │                │  10. Return    │                │
     │                │  all user     │                │
     │                │  locations    │                │
     │                │<───────────────│                │
     │                │                │                │
     │  11. Show on   │                │                │
     │  Leaflet map   │                │                │
     │<───────────────│                │                │
     │                │                │                │
```

### 4. Checkpoint Submission Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │ Backend  │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Open       │                │                │
     │  checkpoint    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │  2. GET        │                │
     │                │  /api/check-   │                │
     │                │  points/:id    │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │  3. Return     │                │
     │                │  checkpoint +  │                │
     │                │  assignment    │                │
     │                │<───────────────│                │
     │                │                │                │
     │  4. Fill form  │                │                │
     │  + upload      │                │                │
     │  evidence      │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │  5. Auto-save  │                │                │
     │  draft         │                │                │
     │───────────────>│                │                │
     │                │  6. PUT        │                │
     │                │  /api/sub-     │                │
     │                │  missions/:id  │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  7. UPDATE     │
     │                │                │  submission    │
     │                │                │───────────────>│
     │                │                │                │
     │  8. Click      │                │                │
     │  "Submit"      │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │  9. POST       │                │
     │                │  /api/sub-     │                │
     │                │  missions/:id/ │                │
     │                │  submit        │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │  10. UPDATE    │
     │                │                │  status to     │
     │                │                │  SUBMITTED     │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │  11. INSERT    │
     │                │                │  notification  │
     │                │                │  to supervisor │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │  12. INSERT    │
     │                │                │  audit log     │
     │                │                │───────────────>│
     │                │                │                │
     │  13. Success   │                │                │
     │  notification  │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │                │         ┌──────┴──────┐         │
     │                │         │ AUTO-APPROVE│         │
     │                │         │ (after 1hr) │         │
     │                │         └──────┬──────┘         │
     │                │                │                │
     │                │                │  14. Cron      │
     │                │                │  finds old     │
     │                │                │  submissions   │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │  15. AUTO-     │
     │                │                │  APPROVE       │
     │                │                │───────────────>│
     │                │                │                │
```

### 5. Consent Gate Flow (First Visit)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER OPENS SITE                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │ Check localStorage  │
                │ bsc_consent_accepted│
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         Not accepted               Already accepted
              │                         │
              ▼                         │
   ┌─────────────────────┐              │
   │ SHOW CONSENT MODAL  │              │
   │                     │              │
   │ ☐ Terms & Conditions│              │
   │ ☐ Privacy Policy    │              │
   │ [Grant Location]    │              │
   │                     │              │
   │ [Continue] (locked) │              │
   └──────────┬──────────┘              │
              │                         │
              ▼                         │
   ┌─────────────────────┐              │
   │ User must:          │              │
   │ 1. Check both ☑     │              │
   │ 2. Grant location   │              │
   └──────────┬──────────┘              │
              │                         │
              ▼                         │
   ┌─────────────────────┐              │
   │ Save to localStorage│              │
   │ bsc_consent=true    │              │
   │ bsc_location=true   │              │
   └──────────┬──────────┘              │
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   RENDER APP        │
                └─────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js >= 18.17
- PostgreSQL (local or Supabase)
- npm or yarn

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/GaganCB2002/bsc_v1.git
cd bsc_v1

# 2. Database setup
cd database
npm install
npm run init          # Creates DB, applies schema, seeds demo data
cd ..

# 3. Backend (port 4000)
cd backend
cp .env.example .env  # Edit with your DATABASE_URL
npm install
npm run dev           # Hot-reload dev server

# 4. Frontend (port 5173)
cd frontend
cp .env.example .env  # Edit VITE_API_URL if needed
npm install
npm run dev           # Vite dev server with API proxy
```

Open **http://localhost:5173**

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123456` |
| Supervisor | `jane.smith` | `Supervisor@123` |
| Manager | `mike.ross` | `Manager@123` |
| User | `john.doe` | `User@123456` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `DB_SSL` | No | auto | Force SSL (`true`/`false`) |
| `SESSION_SECRET` | **Yes** | — | JWT signing secret (32+ chars) |
| `CORS_ORIGIN` | **Yes** | — | Comma-separated frontend URLs |
| `FILE_STORAGE_TYPE` | No | `local` | `local` or `supabase` |
| `SUPABASE_URL` | If supabase | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | If supabase | — | Supabase service role key |
| `SUPABASE_BUCKET` | No | `evidence` | Storage bucket name |
| `MAX_FILE_SIZE_MB` | No | `25` | Max upload size |
| `AUTO_APPROVE_HOURS` | No | `1` | Auto-approval window |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | If separate backend | Backend URL (e.g., `https://bsc-v1.onrender.com`) |

---

## Deployment Guide

### Step 1: Supabase (Database)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `database/schema.sql` → Run
3. Go to **SQL Editor** → paste `database/supabase-storage-setup.sql` → Run
4. Copy **Connection string** (Settings → Database → URI)
5. Copy **Service role key** (Settings → API)

### Step 2: Render (Backend)

1. Connect GitHub repo to Render
2. Create **Web Service** with:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `node dist/server.js`
3. Set environment variables:

```
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DB_SSL=true
SESSION_SECRET=<auto-generate>
CORS_ORIGIN=https://bsc-v1-seven.vercel.app
FILE_STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
SUPABASE_BUCKET=evidence
NODE_ENV=production
```

### Step 3: Vercel (Frontend)

1. Connect GitHub repo to Vercel
2. Framework: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable:
   - `VITE_API_URL` = `https://bsc-v1.onrender.com`
6. Deploy

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with username/password |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |

### Admin - Users

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/admin/users` | `users:list` | List all users |
| POST | `/api/admin/users` | `users:create` | Create user |
| PUT | `/api/admin/users/:id` | `users:update` | Update user |
| DELETE | `/api/admin/users/:id` | `users:delete` | Delete user |
| POST | `/api/admin/users/:id/reset-password` | `users:update` | Reset password |

### Admin - Modules

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/admin/modules` | `modules:list` | List all modules |
| POST | `/api/admin/modules` | `modules:create` | Create module |
| PUT | `/api/admin/modules/:id` | `modules:update` | Update module |
| DELETE | `/api/admin/modules/:id` | `modules:delete` | Delete module |
| POST | `/api/admin/modules/:id/clone` | `modules:create` | Clone module + checkpoints |

### Admin - Checkpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/admin/checkpoints` | `checkpoints:list` | List checkpoints |
| POST | `/api/admin/checkpoints` | `checkpoints:create` | Create checkpoint |
| PUT | `/api/admin/checkpoints/:id` | `checkpoints:update` | Update checkpoint |
| DELETE | `/api/admin/checkpoints/:id` | `checkpoints:delete` | Delete checkpoint |

### Admin - Assignments

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/admin/assignments` | `assignments:list` | List assignments |
| POST | `/api/admin/assignments` | `assignments:create` | Create assignment |
| DELETE | `/api/admin/assignments/:id` | `assignments:delete` | Delete assignment |

### Tracking

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/tracking` | `tracking:update` | Submit GPS location |
| GET | `/api/tracking/me` | Auth only | Get own location history |
| GET | `/api/tracking/latest` | `tracking:view_all` | Get all latest locations |
| GET | `/api/tracking/history` | `tracking:view_all` | Get user location history |

### Evidence

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/evidence` | `evidence:upload` | Upload evidence file |
| GET | `/api/evidence/:id` | Auth + owner | Download/view evidence |
| DELETE | `/api/evidence/:id` | Auth + owner | Delete evidence |

### Submissions

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/submissions` | Auth only | Get user's submissions |
| POST | `/api/submissions` | Auth only | Create/update submission |
| POST | `/api/submissions/:id/submit` | Auth only | Submit for review |
| GET | `/api/submissions/:id` | Auth only | Get submission detail |

---

## Database Schema

### Core Tables

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ employee_code  │ full_name               │
│ email            │ phone          │ username                 │
│ password_hash    │ status         │ role_id (FK→roles)       │
│ department_id    │ created_by     │ last_login_at            │
│ must_change_password │ created_at │ updated_at               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         roles                                │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ name (UNIQUE)  │ description              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    role_permissions                          │
├─────────────────────────────────────────────────────────────┤
│ role_id (FK→roles) │ permission_id (FK→permissions)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       permissions                            │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ name (UNIQUE)  │ description              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       modules                                │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ name            │ slug (UNIQUE)           │
│ description      │ department_id   │ display_order           │
│ status           │ created_by      │ created_at              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      checkpoints                             │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ module_id (FK)  │ title                   │
│ description      │ score           │ is_accuracy_required    │
│ is_corrective_action_required │ is_photo_required             │
│ display_order    │ status          │ created_by              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  checkpoint_assignments                      │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ checkpoint_id   │ user_id                 │
│ assigned_date    │ due_date        │ frequency               │
│ (DAILY/WEEKLY/MONTHLY/ONE_TIME)                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 checkpoint_submissions                       │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ assignment_id   │ checkpoint_id           │
│ user_id          │ submission_date │ status                  │
│ (DRAFT/SUBMITTED/APPROVED/REJECTED)                          │
│ supervisor_comment│ reviewed_by     │ reviewed_at             │
│ submitted_at     │ auto_approved   │ created_at              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    evidence_files                            │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ submission_id   │ uploaded_by             │
│ original_name    │ stored_name     │ mime_type               │
│ file_size        │ storage_path    │ public_url              │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   location_tracks                            │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ user_id         │ latitude                │
│ longitude        │ accuracy        │ address                 │
│ battery_level    │ tracked_at                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     audit_logs                               │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ user_id         │ action                  │
│ entity_type      │ entity_id       │ old_values (JSON)       │
│ new_values (JSON)│ ip_address      │ user_agent              │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    notifications                             │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ user_id         │ title                   │
│ message          │ type            │ entity_type             │
│ entity_id        │ is_read         │ created_at              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      sessions                                │
├─────────────────────────────────────────────────────────────┤
│ id (UUID PK)     │ user_id         │ token (UNIQUE)          │
│ expires_at       │ ip_address      │ user_agent              │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | Full access | All permissions, bypass all checks |
| **MANAGER** | Review access | Approve/reject submissions, view reports, manage team |
| **SUPERVISOR** | Team management | Approve/reject, manage employees, departments, projects |
| **AUDITOR** | Read-only | View submissions, evidence, reports, audit logs |
| **USER** | Standard | Submit checkpoints, upload evidence, view own history |
| **VIEWER** | Minimal read-only | View own submissions and reports |

### Permission Categories

- `users:*` — User management
- `modules:*` — Module CRUD
- `checkpoints:*` — Checkpoint CRUD
- `assignments:*` — Assignment management
- `submissions:*` — Submission viewing and approval
- `evidence:*` — Evidence upload and viewing
- `tracking:*` — GPS tracking management
- `reports:*` — Report generation
- `audit:*` — Audit log access
- `settings:*` — System settings

---

## Security

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT tokens in HTTP-only cookies, 7-day expiry |
| **Password Hashing** | bcrypt with salt rounds = 10 |
| **CORS** | Configurable allowed origins with credentials |
| **RBAC** | 40+ permissions checked on every API request |
| **Input Validation** | Zod schemas on all endpoints |
| **File Upload** | MIME type allowlist, 25MB limit, UUID filenames |
| **Rate Limiting** | Configurable per-endpoint limits |
| **Audit Trail** | Every mutation logged with before/after JSON |
| **Session Management** | Server-side session rows, revocable |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Cookie Security** | `httpOnly`, `secure`, `sameSite: none` (cross-origin) |

---

## Troubleshooting

### "Request failed (405)" on login

- Check `VITE_API_URL` is set in Vercel dashboard
- Verify `vercel.json` has the API proxy rewrite
- Ensure backend is running on Render

### "Cannot reach the database"

- Verify `DATABASE_URL` is the PostgreSQL connection string (not HTTP URL)
- Check `DB_SSL=true` is set
- Ensure Supabase project is active

### Evidence upload fails

- Check `FILE_STORAGE_TYPE=supabase` is set
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure Supabase Storage bucket `evidence` exists

### GPS tracking not working

- Browser must grant location permission
- Check user has `tracking:update` permission
- Verify consent gate was accepted
- Check backend logs for tracking errors

### Cookie not sent (login loops back)

- Verify `CORS_ORIGIN` includes the exact frontend URL
- Check `sameSite: none` is set for cross-origin
- Ensure `secure: true` in production

---

## License

Private — BSC Exclusive Tracking Platform. All rights reserved.

---

**Built with ❤️ by the BSC Exclusive Team**
