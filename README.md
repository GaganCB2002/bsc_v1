<div align="center">

# BSC Exclusive Tracking

**Enterprise Process & Compliance Tracking Platform**

Track Every Process. Verify Every Location. Prove Every Action.

[![Frontend](https://img.shields.io/badge/Frontend-Live-000000?style=flat-square&logo=vercel)](https://bsc-v1-seven.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Live-46E3B7?style=flat-square&logo=render)](https://bsc-v1.onrender.com)
[![Version](https://img.shields.io/badge/Version-1.1.0-brightgreen?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Private-blue?style=flat-square)](#)

</div>

---

## Table of Contents

1. [Project Motive](#project-motive)
2. [What Problem It Solves](#what-problem-it-solves)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [Project File Structure](#project-file-structure)
6. [System Architecture](#system-architecture)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Authentication Flow](#authentication-flow)
9. [Evidence Upload Flow](#evidence-upload-flow)
10. [GPS Tracking Flow](#gps-tracking-flow)
11. [Checkpoint Submission Flow](#checkpoint-submission-flow)
12. [Consent Gate Flow](#consent-gate-flow)
13. [Database Schema](#database-schema)
14. [Roles & Permissions](#roles--permissions)
15. [API Endpoints](#api-endpoints)
16. [Deployment](#deployment)
17. [Local Development](#local-development)

---

## Project Motive

BSC Exclusive Tracking is built for organizations that need **proof, not promises**. The core idea is simple: every task an employee completes should be verifiable, every location they visit should be tracked, and every submission should go through a proper approval chain with complete evidence.

This is not a generic project management tool. It is a **compliance enforcement platform** that ensures field operations follow documented processes, employees provide verifiable proof of their work, and management has real-time visibility into all activities.

---

## What Problem It Solves

**Without this system:**
- Supervisors cannot verify if employees actually visited assigned locations
- Paper-based logs are easily manipulated, lost, or incomplete
- No real-time visibility into where team members are
- Different employees follow different processes with no standardization
- When regulators ask for proof, organizations cannot produce it
- Paper submissions take days or weeks to reach decision makers

**With this system:**
- Every task submission requires evidence (photos, documents, audio)
- GPS locations are tracked and stored for every submission
- Management sees all team locations on a live map in real-time
- Checkpoints define exactly what needs to be done at each step
- Every action from login to submission is logged with timestamps
- Time-based auto-approval prevents bottlenecks

---

## Key Features

| Feature | What It Does |
|---------|-------------|
| **Role-Based Access Control** | 6 roles (Admin, Manager, Supervisor, Auditor, User, Viewer) with 40+ granular permissions |
| **GPS Location Tracking** | Automatic 30-minute location sync with live map for supervisors |
| **Evidence Upload** | Upload images, PDFs, CSVs, and audio files (25MB limit) |
| **Compliance Checkpoints** | Modules with checkpoints that define required tasks and evidence |
| **Submission Approval** | Review, approve, or reject submissions with comments |
| **Auto-Approval** | Submissions auto-approve after configurable time window |
| **Notifications** | Real-time in-app alerts for assignments and reviews |
| **Audit Trail** | Complete log of every action with IP and user agent |
| **Dashboard & Reports** | Analytics, charts, and CSV export |
| **Consent Gate** | Mandatory terms acceptance and location permission on first visit |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite, TypeScript | Single-page application |
| Styling | Tailwind CSS 4 | Responsive design |
| Charts | Recharts | Dashboard analytics |
| Maps | Leaflet | GPS tracking visualization |
| Backend | Node.js, Express 5 | REST API server |
| Authentication | JWT, bcrypt | Secure sessions |
| Database | PostgreSQL (Supabase) | Relational data storage |
| File Storage | Supabase Storage | Evidence file uploads |
| Deployment | Vercel (frontend), Render (backend) | Cloud hosting |

---

## Project File Structure

```
bsc_v1/
│
├── frontend/                          # React SPA (Vercel)
│   ├── public/
│   │   ├── bsc-logo.png              # Application logo
│   │   └── bsc-icon.png              # Favicon
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ConsentGate.tsx        # First-visit consent modal
│   │   │   ├── AppShell.tsx           # Page layout wrapper
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── Header.tsx             # Top header bar
│   │   │   ├── NotificationBell.tsx   # Notification dropdown
│   │   │   ├── EvidenceUploader.tsx   # File upload component
│   │   │   ├── States.tsx             # Loading & error states
│   │   │   └── Format.tsx             # Date/number formatters
│   │   ├── lib/                       # Core libraries
│   │   │   ├── api.ts                 # HTTP client (fetch wrapper)
│   │   │   ├── auth.tsx               # Auth context & provider
│   │   │   ├── tracking.tsx           # GPS tracking logic
│   │   │   └── format.ts             # Formatting utilities
│   │   ├── pages/                     # Page components
│   │   │   ├── Landing.tsx            # Public marketing page
│   │   │   ├── Login.tsx              # Login form
│   │   │   ├── Dashboard.tsx          # User dashboard
│   │   │   ├── Checkpoints.tsx        # Assigned checkpoints list
│   │   │   ├── CheckpointSubmit.tsx   # Submit checkpoint data
│   │   │   ├── Tracking.tsx           # GPS tracking page
│   │   │   ├── Evidence.tsx           # Uploaded files list
│   │   │   ├── Notifications.tsx      # Notifications page
│   │   │   ├── Profile.tsx            # User profile settings
│   │   │   └── admin/                 # Admin pages
│   │   │       ├── AdminDashboard.tsx # Admin overview
│   │   │       ├── AdminUsers.tsx     # User management
│   │   │       ├── AdminModules.tsx   # Module management
│   │   │       ├── AdminAudit.tsx     # Audit log viewer
│   │   │       └── AdminSettings.tsx  # System settings
│   │   ├── App.tsx                    # Route definitions
│   │   ├── main.tsx                   # Entry point (with ConsentGate)
│   │   └── index.css                  # Global styles
│   ├── vercel.json                    # Vercel config + API proxy
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                           # Express API (Render)
│   ├── src/
│   │   ├── server.ts                  # Entry point
│   │   ├── app.ts                     # Express app setup
│   │   ├── config.ts                  # Environment variables
│   │   ├── db.ts                      # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT authentication
│   │   │   ├── rbac.ts               # Role-based access control
│   │   │   └── rateLimit.ts          # Request rate limiting
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # Login, logout, session
│   │   │   ├── admin.routes.ts       # Users, modules, departments
│   │   │   ├── tracking.routes.ts    # GPS location endpoints
│   │   │   ├── evidence.routes.ts    # File upload/download
│   │   │   ├── notifications.routes.ts # In-app notifications
│   │   │   ├── checkpoint.routes.ts  # Checkpoint submissions
│   │   │   ├── reports.routes.ts     # Dashboard & reports
│   │   │   └── profile.routes.ts     # User profile
│   │   ├── jobs/
│   │   │   └── autoApprove.ts        # Auto-approve pending submissions
│   │   └── utils/
│   │       ├── session.ts            # JWT + cookie management
│   │       ├── audit.ts              # Audit logging
│   │       ├── logger.ts             # Request logging
│   │       └── storage.ts            # File storage (local/supabase)
│   ├── uploads/                       # Local file storage
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   ├── schema.sql                     # Full database schema
│   └── seeds/
│       └── seed.sql                   # Demo data
│
├── render.yaml                        # Render deployment config
├── README.md                          # This file
└── document.md                        # Detailed project documentation
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                               │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  REACT 19 (Vite)                         │   │
│   │                                                          │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐         │   │
│   │   │ Consent   │→ │ Auth      │→ │ Tracking  │         │   │
│   │   │ Gate      │  │ Provider  │  │ Provider  │         │   │
│   │   └───────────┘  └───────────┘  └───────────┘         │   │
│   │                                                          │   │
│   │   ┌─────────────────────────────────────────────────┐  │   │
│   │   │         API Client (fetch + cookies)             │  │   │
│   │   └─────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    POST /api/auth/login                           │
│                    GET  /api/tracking/latest                      │
│                    POST /api/evidence                             │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      VERCEL         │
                    │                      │
                    │  Static files (CDN)  │
                    │  API proxy rewrite   │
                    │  /api/* → Render     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      RENDER         │
                    │                      │
                    │   Express REST API   │
                    │   JWT Validation     │
                    │   File Upload        │
                    │   Cron Jobs          │
                    └──┬──────┬──────┬───┘
                       │      │      │
            ┌──────────▼┐  ┌──▼──┐  ▼──────────┐
            │ SUPABASE  │  │ JWT │  SUPABASE   │
            │ PostgreSQL│     │    │ Storage    │
            │           │     │    │            │
            │ Tables:   │     │    │ Buckets:   │
            │ users     │     │    │ evidence   │
            │ modules   │     │    │            │
            │ evidence  │     │    └────────────┘
            │ tracks    │     │
            └───────────┘  └──┘
```

**How it works:**

1. User opens the frontend on Vercel
2. React app loads and checks for consent (localStorage)
3. If no consent, a mandatory modal appears
4. After consent, user logs in via `/api/auth/login`
5. Backend validates credentials, creates JWT, sets HTTP-only cookie
6. All subsequent requests include the cookie automatically
7. Vercel proxies `/api/*` requests to Render backend
8. Backend validates JWT on every request
9. Backend queries PostgreSQL for data
10. Backend returns JSON responses to frontend
11. Frontend displays data in charts, tables, and maps

---

## Data Flow Diagrams

### Authentication Flow

**What happens when a user logs in:**

```
User Action          Frontend                  Backend                 Database
─────────────────────────────────────────────────────────────────────────────
Enters username  →   POST /api/auth/login  →   Validate credentials →  SELECT user
and password         (send credentials)        Hash password check     WHERE username = ?
                                                  │                      │
                                                  ▼                      │
                                              Create JWT token          │
                                              Set HTTP-only cookie      │
                                              INSERT session         ←──┘
                                                  │
                       ←──────────────────────────┘
Receive user         GET /api/auth/me        →   Verify JWT         →  SELECT user
object + permissions      (include cookie)        Load permissions      with role
                                                  │                      │
                       ←──────────────────────────┘
Redirect to          Display dashboard
dashboard
```

**Explanation:**
- User enters credentials in the login form
- Frontend sends POST request with username and password
- Backend queries the database for the user
- Backend uses bcrypt to compare the password hash
- If valid, backend creates a JWT token with user ID and role
- Token is set as an HTTP-only cookie (not accessible via JavaScript)
- Session is recorded in the database for tracking
- Frontend receives the user object with all permissions
- Frontend redirects to the appropriate dashboard based on role

---

### Evidence Upload Flow

**What happens when a user uploads a file:**

```
User Action          Frontend                  Backend                 Storage
─────────────────────────────────────────────────────────────────────────────
Selects file(s)  →   Create FormData      →   Parse multipart      →  Validate MIME type
                      (append files)            request (Multer)       Check file size (25MB)
                                                  │                      │
                                                  ▼                      │
                                              Store file             →  Upload to Supabase
                                              (local or supabase)       or local disk
                                                  │                      │
                                                  ▼                      │
                                              Generate URL              │
                                              INSERT evidence_files  ←──┘
                                                  │
                       ←──────────────────────────┘
Display file in       Show metadata +       ←   Return file URL
evidence list         preview link
```

**Explanation:**
- User clicks upload button and selects file(s)
- Frontend creates a FormData object with the files
- Frontend sends POST request with multipart/form-data content type
- Backend uses Multer to parse the multipart request
- Multer validates the MIME type against an allowlist
- Multer checks the file size is under 25MB
- File is stored either locally in `uploads/` or uploaded to Supabase Storage
- Backend generates a public URL for the file
- Backend inserts a record into the `evidence_files` table
- Frontend receives the metadata and displays the file in the evidence list

---

### GPS Tracking Flow

**What happens when location is captured:**

```
Browser             Tracking Provider         Backend              Database
─────────────────────────────────────────────────────────────────────────────
Every 30 min   →   navigator.geolocation  →                      │
or manual sync      .getCurrentPosition()                        │
                      │                                           │
                      ▼                                           │
                  GPS coordinates                                 │
                  accuracy                                        │
                  battery level                                   │
                      │                                           │
                      ▼                                           │
                  POST /api/tracking   →    INSERT location_    →  tracks
                  {lat, lng, accuracy}      user_id, latitude,
                                             longitude, accuracy,
                                             battery_level, tracked_at
                      │
                      ▼
                  Store in localStorage
                  Update online status
                      │
                      ▼
Supervisor       GET /api/tracking/latest →  SELECT latest    →  Return all
opens map             (include cookie)       per user              user locations
                                             WHERE tracked_at
                                             > NOW() - 5 min
                      │
                      ▼
                  Display on Leaflet map
                  Show online/offline status
```

**Explanation:**
- Browser's Geolocation API is triggered (automatic or manual)
- Browser requests GPS coordinates from the device
- Coordinates include latitude, longitude, and accuracy
- Frontend also captures battery level
- Frontend sends POST request with location data
- Backend inserts a record into the `location_tracks` table
- Location is stored with a timestamp
- When supervisor opens the map, backend queries latest locations
- Backend returns all users with location in last 5 minutes
- Frontend displays markers on a Leaflet map
- Online status is determined by whether location was updated recently

---

### Checkpoint Submission Flow

**What happens when a user submits a checkpoint:**

```
User Action          Frontend                  Backend                 Database
─────────────────────────────────────────────────────────────────────────────
Fills checkpoint →   POST /api/checkpoints →  Validate input     →  INSERT submission
form + uploads       /submit                 Check permissions      (status: pending)
evidence             {checkpoint_id,         Link evidence files
                      data, evidence_ids}    Create audit log
                                                  │
                       ←──────────────────────────┘
Receive               Display success
confirmation          notification
                                                  │
Supervisor reviews:                                │
                                                  │
Approves          →   PATCH /api/admin       →   UPDATE submission →  status: approved
                      /submissions/:id/appve      reviewed_by
                                                  reviewed_at
                                                  │
Rejects           →   PATCH /api/admin       →   UPDATE submission →  status: rejected
                      /submissions/:id/reject     supervisor_comment
                                                  reviewed_by
                                                  │
Auto-approve (1hr):                                │
                      Cron job runs            →  UPDATE submissions → status: approved
                      every 5 minutes              WHERE status = pending
                                                   AND submitted_at < NOW() - 1 hour
```

**Explanation:**
- User navigates to an assigned checkpoint
- User fills in the required data fields
- User optionally uploads evidence files
- Frontend sends POST request with submission data
- Backend validates the input using Zod schemas
- Backend checks user permissions
- Backend creates a submission record with status "pending"
- Backend links any uploaded evidence files
- Backend creates an audit log entry
- User receives a success notification
- Supervisor can review the submission
- Supervisor can approve or reject with comments
- If no action within 1 hour, cron job auto-approves

---

### Consent Gate Flow

**What happens on first visit:**

```
User Opens Site      ConsentGate              localStorage
─────────────────────────────────────────────────────────────
                  →  Check localStorage
                     key: bsc_consent_accepted
                          │
                          ▼
                     Key exists?
                     ┌────┴────┐
                     No        Yes
                     │          │
                     ▼          ▼
              Show modal    Render app
              (blocking)    directly
                     │
                     ▼
              User must check:
              ☐ Terms & Conditions
              ☐ Privacy Policy
              ☐ Grant Location
                     │
                     ▼
              All checked?
              ┌────┴────┐
              No        Yes
              │          │
              ▼          ▼
           Button     Save to
           disabled   localStorage
              │       key: bsc_consent_accepted
              │       key: bsc_location_granted
              │          │
              └──────────┘
                          │
                          ▼
                     Render app
```

**Explanation:**
- When the app loads, ConsentGate checks localStorage
- If consent was previously given, the app renders immediately
- If not, a modal blocks the entire screen
- User must read and check Terms & Conditions checkbox
- User must read and check Privacy Policy checkbox
- User must grant browser location permission
- All three checkboxes must be checked
- The submit button remains disabled until all are checked
- Once all checked, consent is saved to localStorage
- The modal closes and the app renders

---

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users      │     │    roles      │     │ permissions  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │────▶│ id           │     │ id           │
│ employee_code│     │ name         │     │ name         │
│ full_name    │     │ description  │     │ description  │
│ email        │     └──────────────┘     └──────────────┘
│ phone        │            │                    │
│ username     │     ┌──────────────┐            │
│ password_hash│     │role_permissions│◀──────────┘
│ status       │     ├──────────────┤
│ role_id (FK) │     │ role_id      │
│ dept_id (FK) │     │ permission_id│
└──────────────┘     └──────────────┘
        │
        │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  departments │     │   modules    │     │ checkpoints  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │◀────│ dept_id (FK) │     │ id           │
│ name         │     │ id           │◀────│ module_id(FK)│
│ description  │     │ name         │     │ title        │
│ status       │     │ slug         │     │ description  │
└──────────────┘     │ description  │     │ score        │
                     │ display_order│     │ is_accuracy  │
                     │ status       │     │ is_photo     │
                     └──────────────┘     │ display_order│
                                          │ status       │
                                          └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  evidence_   │◀────│ submissions  │◀────│ assignments  │
│   files      │     ├──────────────┤     ├──────────────┤
├──────────────┤     │ id           │     │ id           │
│ id           │     │ assignment_id│◀────│ checkpoint_id│
│ submission_id│────▶│ checkpoint_id│     │ user_id      │
│ uploaded_by  │     │ user_id      │     │ assigned_by  │
│ original_name│     │ status       │     │ status       │
│ stored_name  │     │ supervisor_  │     └──────────────┘
│ mime_type    │     │   comment    │
│ file_size    │     │ auto_approved│
│ public_url   │     │ submitted_at │
└──────────────┘     └──────────────┘
                            │
                     ┌──────────────┐
                     │  location_   │
                     │    tracks    │
                     ├──────────────┤
                     │ id           │
                     │ user_id      │
                     │ latitude     │
                     │ longitude    │
                     │ accuracy     │
                     │ battery_level│
                     │ tracked_at   │
                     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ audit_logs   │     │notifications │     │  sessions    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ user_id      │     │ user_id      │     │ user_id      │
│ action       │     │ type         │     │ token_hash   │
│ entity_type  │     │ title        │     │ expires_at   │
│ entity_id    │     │ message      │     └──────────────┘
│ old_values   │     │ is_read      │
│ new_values   │     │ created_at   │
│ ip_address   │     └──────────────┘
│ user_agent   │
│ created_at   │
└──────────────┘
```

---

## Roles & Permissions

| Role | Access Level | Can Do |
|------|-------------|--------|
| **Admin** | Full | Everything. Bypasses all checks. Manages users, modules, departments, sees audit logs. |
| **Manager** | Review | Approve/reject submissions. View reports. Manage team. |
| **Supervisor** | Team | Approve/reject own team submissions. View team tracking. |
| **Auditor** | Read | View all submissions, audit logs, reports. Cannot modify. |
| **User** | Standard | Submit checkpoints. Upload evidence. View own data. |
| **Viewer** | Minimal | View own data and reports only. |

**Permission Categories:**

| Category | Permissions |
|----------|------------|
| Users | list, create, update, delete, reset-password |
| Modules | list, create, update, delete, clone |
| Checkpoints | list, create, update, delete |
| Submissions | view_all, approve, reject |
| Tracking | update, view_all, view_history |
| Evidence | upload, delete, download |
| Departments | list, create, update, delete |
| Reports | view, export |
| Audit | view |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| GET | `/api/auth/me` | Get current user from session |
| POST | `/api/auth/logout` | Clear session and cookie |

### Admin - Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create new user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/users/:id/reset-password` | Reset user password |

### Admin - Modules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/modules` | List all modules |
| POST | `/api/admin/modules` | Create module |
| PUT | `/api/admin/modules/:id` | Update module |
| DELETE | `/api/admin/modules/:id` | Delete module |
| POST | `/api/admin/modules/:id/clone` | Clone module with checkpoints |

### Admin - Checkpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/modules/:moduleId/checkpoints` | List checkpoints in module |
| POST | `/api/admin/modules/:moduleId/checkpoints` | Create checkpoint |
| PUT | `/api/admin/checkpoints/:id` | Update checkpoint |
| DELETE | `/api/admin/checkpoints/:id` | Delete checkpoint |

### Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tracking` | Submit GPS location |
| GET | `/api/tracking/me` | Get own location history |
| GET | `/api/tracking/latest` | Get latest location per user |
| GET | `/api/tracking/history` | Get user location history |

### Evidence

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evidence` | Upload evidence file |
| GET | `/api/evidence/:id` | Download evidence file |
| DELETE | `/api/evidence/:id` | Delete evidence file |

### Checkpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checkpoints/assigned` | Get assigned checkpoints |
| POST | `/api/checkpoints/submit` | Submit checkpoint completion |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## Deployment

### Supabase (Database)

1. Create a Supabase project at supabase.com
2. Open SQL Editor
3. Run `database/schema.sql` to create all tables
4. Run `database/seeds/seed.sql` for demo data
5. Copy the PostgreSQL connection string
6. Copy the service role key from Settings > API

### Render (Backend)

1. Create a new Web Service on render.com
2. Connect the GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/server.js`
6. Add environment variables:

| Variable | Value |
|----------|-------|
| DATABASE_URL | Your PostgreSQL connection string |
| DB_SSL | true |
| SESSION_SECRET | Any random secret string |
| CORS_ORIGIN | https://bsc-v1-seven.vercel.app |
| FILE_STORAGE_TYPE | supabase |
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Your service role key |
| AUTO_APPROVE_HOURS | 1 |
| CRON_ENABLED | true |

### Vercel (Frontend)

1. Import the GitHub repository on vercel.com
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`
6. Add environment variable: `VITE_API_URL` = `https://bsc-v1.onrender.com`
7. Deploy

---

## Local Development

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/GaganCB2002/bsc_v1.git
cd bsc_v1

# Set up the database
cd database
npm install
npm run init

# Set up the backend
cd ../backend
cp .env.example .env
# Edit .env with your DATABASE_URL
npm install
npm run dev

# Set up the frontend
cd ../frontend
npm install
npm run dev
```

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123456 |
| Supervisor | jane.smith | Supervisor@123 |
| Manager | mike.ross | Manager@123 |
| User | john.doe | User@123456 |

---

<div align="center">

**BSC Exclusive Tracking**

Built for operations teams that need proof, not promises.

</div>
