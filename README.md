# BSC Exclusive Tracking — Full-Stack Platform

A complete enterprise **Process & Compliance Tracking** system with live GPS tracking.
Three clean folders, one working stack:

| Folder | What it is | Tech |
|---|---|---|
| [`frontend/`](frontend/README.md) | Web UI (light-blue theme, fully responsive, code-split) | React 19 + Vite + TypeScript + Tailwind CSS 4 + Recharts + Leaflet |
| [`backend/`](backend/README.md) | REST API server (Render-ready) | Node.js + Express + TypeScript + JWT + Multer + node-cron |
| [`database/`](database/README.md) | SQL schema + seed data | PostgreSQL (Supabase-compatible) |

> **No MongoDB anywhere.** The database is pure SQL — PostgreSQL on **Supabase**.
> The backend is designed to run on **Render** (see `render.yaml` blueprint).

## Feature highlights

- **Roles & permissions** — ADMIN, MANAGER, SUPERVISOR, AUDITOR, USER, VIEWER with granular RBAC
- **Admin-only account creation** — no public sign-up form exists anywhere; only admins create accounts
- **Process modules & checkpoints** — assign daily/weekly/monthly/one-time checkpoints to users
- **Compliance submissions** — draft autosave, submit for review, approve / reject with comments
- **Evidence uploads** — images (JPG/PNG/WEBP/GIF), **PDF**, **CSV** and **audio** (MP3/WAV/M4A/OGG/AAC)
  stored on local disk **or Supabase Storage** (`FILE_STORAGE_TYPE=supabase`)
- **Auto-approval** — any submission not reviewed within **1 hour is auto-approved**
  by a background job (runs every minute; window configurable in Settings)
- **Live tracking** — clients report GPS coordinates **every 30 minutes**; admin sees a live
  Leaflet map with online/offline status, accuracy, battery and full location history
- **Admin dashboard** — everything at a glance: KPIs, charts, live locations, recent
  submissions, audit trail
- **Supervisor panel** — team dashboard, approvals (approve/reject/escalate), employees,
  departments, projects, activity log, team reports, profile
- **Notifications & audit logs** — in-app bell with unread count; every action recorded
- **Reports & exports** — compliance/accuracy analytics with CSV export
- **Calendar** — monthly compliance view with per-day details

## Quick start (local)

```bash
# 1. Database (creates the DB, applies schema.sql, seeds demo data)
cd database
npm install
npm run init

# 2. Backend (port 4000)
cd ../backend
npm install
npm run dev

# 3. Frontend (port 5173 — proxies /api and /uploads to the backend)
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Deployment guide

### 1. Supabase (database + file storage)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → New query → paste the contents of `database/schema.sql` and run it.
   (Or run `npm run init` in `database/` with your Supabase **Direct connection string**.)
3. SQL Editor → New query → paste `database/supabase-storage-setup.sql` and run it —
   creates the public `evidence` bucket for uploaded files.
4. Copy your **Direct connection string** (Settings → Database) and
   **service_role key** (Settings → API).

### 2. Render (backend)

Option A — Blueprint: connect this repo to Render; it detects `render.yaml` and creates
the web service automatically. Fill in the `sync: false` env vars in the dashboard:
`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`.

Option B — Manual: create a **Web Service** with:
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `node dist/server.js`
- Env vars: `DATABASE_URL`, `SESSION_SECRET`, `FILE_STORAGE_TYPE=supabase`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN=<frontend url>`

### 3. Frontend (Vercel / Netlify / any static host)

- Build command: `npm run build`, output directory: `dist`
- Env var: `VITE_API_URL=https://<your-render-app>.onrender.com`

## Demo accounts (seeded)

| Role | Username | Password | Lands on |
|---|---|---|---|
| Admin | `admin` | `Admin@123456` | `/admin` |
| Supervisor | `jane.smith` | `Supervisor@123` | `/supervisor` |
| Manager | `mike.ross` | `Manager@123` | `/supervisor` |
| User | `john.doe` | `User@123456` | `/dashboard` |
| User | `sarah.lee` | `User@123456` | `/dashboard` |
# bsc_v1
