import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  FolderOpen,
  ListChecks,
  Users,
  CheckCircle2,
  Satellite,
  FileText,
  Bell,
  ArrowRight,
  MapPin,
  Clock,
  Lock,
  Database,
  UserPlus,
  Zap,
  ScrollText,
  BarChart3,
  KeyRound,
} from 'lucide-react'
import { get } from '../lib/api'

interface Stats {
  modules: number
  checkpoints: number
  users: number
  submissions: number
  departments: number
  approvalRate: number
}

const FEATURES = [
  { icon: ListChecks, title: 'Checkpoint Compliance', desc: 'Daily, weekly, monthly and one-time process checkpoints with draft autosave and one-click submission.' },
  { icon: FileText, title: 'Evidence Uploads', desc: 'Attach images (JPG/PNG/WEBP/GIF), PDF documents, CSV files and audio recordings (MP3/WAV/M4A/OGG) to every report.' },
  { icon: Satellite, title: 'Live GPS Tracking', desc: 'Team locations are reported automatically every 30 minutes and shown on a live map with accuracy and battery status.' },
  { icon: CheckCircle2, title: 'Smart Auto-Approval', desc: 'Supervisors and admins review submissions — anything unreviewed for 1 hour is auto-approved by the system.' },
  { icon: Bell, title: 'Notifications', desc: 'Real-time in-app notifications for assignments, submissions, approvals and rejections with a live unread badge.' },
  { icon: ScrollText, title: 'Complete Audit Trail', desc: 'Every login, submission, approval and settings change is recorded with before/after payloads and IP addresses.' },
  { icon: BarChart3, title: 'Analytics & Exports', desc: 'Compliance and accuracy dashboards with charts, per-team leaderboards and one-click CSV report exports.' },
  { icon: Database, title: 'SQL Database', desc: 'Powered by PostgreSQL — deploy on Supabase. No MongoDB anywhere. Fast, indexed, transactional.' },
]

const STEPS = [
  { step: '01', icon: UserPlus, title: 'Admin creates accounts', desc: 'Only an administrator can create user accounts. No public sign-up — every member is invited by your admin team.' },
  { step: '02', icon: FolderOpen, title: 'Checkpoints get assigned', desc: 'Admins assign process checkpoints to each user with due dates and daily, weekly, monthly or one-time frequency.' },
  { step: '03', icon: FileText, title: 'Submit with evidence', desc: 'Users fill compliance details and attach photos, PDFs, CSV or audio proof — autosaved as a draft as they type.' },
  { step: '04', icon: CheckCircle2, title: 'Review, approve or auto-approve', desc: 'Supervisors approve or reject with comments. If nobody acts within 1 hour, the system auto-approves.' },
]

const ROLES = [
  { role: 'ADMIN', color: 'bg-sky-600', desc: 'Full control — creates user accounts, modules, checkpoints, assignments, roles, settings and reviews everything.' },
  { role: 'MANAGER', color: 'bg-blue-600', desc: 'Reviews and approves or rejects submissions, views all evidence and organization reports.' },
  { role: 'SUPERVISOR', color: 'bg-cyan-600', desc: 'Manages a team — employees, departments, projects, approvals (with escalation) and team analytics.' },
  { role: 'AUDITOR', color: 'bg-indigo-600', desc: 'Read-only access to submissions, evidence, reports and the full audit log for compliance audits.' },
  { role: 'USER', color: 'bg-sky-500', desc: 'Completes assigned checkpoints, uploads evidence, tracks history and views personal reports.' },
  { role: 'VIEWER', color: 'bg-slate-500', desc: 'Read-only access to their own submissions, evidence and reports.' },
]

export default function Landing() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    get<Stats>('/api/public/stats')
      .then(setStats)
      .catch(() => undefined)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-600 font-semibold tracking-wider">PROCESS TRACKING</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-sky-600 transition-colors">How it works</a>
            <a href="#tracking" className="hover:text-sky-600 transition-colors">Live tracking</a>
            <a href="#roles" className="hover:text-sky-600 transition-colors">Roles</a>
            <a href="#security" className="hover:text-sky-600 transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-5">
            <Satellite className="w-3.5 h-3.5" /> Enterprise Process & Compliance Platform
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Track every process.
            <br />
            <span className="text-sky-500">Verify every location.</span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Assign checkpoints, collect evidence, review submissions and watch your team&apos;s live
            location on one clean dashboard — powered by PostgreSQL on Supabase, API on Render.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn btn-primary px-5 py-2.5 text-sm">
              Launch Application <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-sky-500" /> Live tracking every 30 minutes
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Zap className="w-3.5 h-3.5 text-sky-500" /> Auto-approval after 1 hour
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="card shadow-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-border-light">
          {[
            { label: 'Modules', value: stats?.modules ?? '—' },
            { label: 'Checkpoints', value: stats?.checkpoints ?? '—' },
            { label: 'Team Members', value: stats?.users ?? '—' },
            { label: 'Departments', value: stats?.departments ?? '—' },
            { label: 'Submissions', value: stats?.submissions ?? '—' },
            { label: 'Approval Rate', value: stats ? `${stats.approvalRate}%` : '—' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-sky-600 tabular-nums">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Everything you need, in one place</h2>
          <p className="text-sm text-slate-500 mt-2">Built for operations teams that need proof, not promises.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 hover:border-sky-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-sky-50 border-y border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
            <p className="text-sm text-slate-500 mt-2">From account creation to approval — the complete loop.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-sky-200">{s.step}</span>
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-3">{s.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="card mt-6 p-4 flex items-start gap-3 border-sky-200 bg-white">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <UserPlus className="w-4.5 h-4.5 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Account creation is admin-only</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                There is no public registration or sign-up form. Only administrators (and users with the
                <code className="mx-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-[11px]">users:create</code>
                permission) can create accounts — each with a role, department, employee code and unique username.
                Admins can also deactivate accounts, reset passwords and view every session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live tracking */}
      <section id="tracking" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-4">
              <Satellite className="w-3.5 h-3.5" /> Live GPS Tracking
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Your team&apos;s location, updated every 30 minutes</h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Every signed-in team member&apos;s browser reports its GPS coordinates to the server on a
              <b className="text-slate-700"> 30-minute cycle</b> (plus once at login). The admin dashboard shows a
              live map with every team member — online/offline status, coordinates, location accuracy,
              battery level and the full location history per user.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                Automatic updates — no manual check-ins required
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                Registered office locations pinned on the same map
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                Graceful degradation — the app works fully even without location permission
              </li>
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">What the admin sees</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'John Doe', loc: '19.11360, 72.86970 · Andheri East, Mumbai', online: true, battery: '82%' },
                { name: 'Sarah Lee', loc: '19.21830, 72.97810 · Ghodbunder Road, Thane', online: true, battery: '91%' },
                { name: 'Jane Smith', loc: '19.03300, 73.02970 · Dombivli East, Thane', online: false, battery: '76%' },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-surface-alt border border-border">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.loc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block text-[10px] font-bold ${u.online ? 'text-green-600' : 'text-slate-400'}`}>
                      ● {u.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <span className="block text-[10px] text-slate-500">{u.battery} battery</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">Live map · track history · accuracy radius</p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-sky-50 border-y border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Roles & permissions</h2>
            <p className="text-sm text-slate-500 mt-2">Six built-in roles with granular, editable permissions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((r) => (
              <div key={r.role} className="card p-5">
                <div className="flex items-center gap-2.5">
                  <span className={`${r.color} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg tracking-wide`}>
                    {r.role}
                  </span>
                  {r.role === 'ADMIN' && <KeyRound className="w-3.5 h-3.5 text-sky-500" />}
                </div>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Security first</h2>
          <p className="text-sm text-slate-500 mt-2">Enterprise-grade protections built into every request.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Lock, title: 'JWT sessions', desc: 'Signed tokens in HTTP-only cookies, revocable server-side session rows.' },
            { icon: KeyRound, title: 'bcrypt passwords', desc: 'Passwords are salted and hashed — plaintext never touches the database.' },
            { icon: ShieldCheck, title: 'Granular RBAC', desc: '40+ permissions checked on every API request, not just in the UI.' },
            { icon: ScrollText, title: 'Full audit trail', desc: 'Every state change logged with actor, before/after JSON, IP and user agent.' },
          ].map((s) => (
            <div key={s.title} className="card p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo accounts */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Try it now with demo accounts</h2>
              <p className="text-xs text-slate-500 mt-1">Accounts are created only by administrators — use these seeded logins to explore every role.</p>
            </div>
            <Link to="/login" className="btn btn-primary">Sign in <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { role: 'Admin', user: 'admin', pass: 'Admin@123456', tone: 'bg-sky-100 text-sky-700' },
              { role: 'Supervisor', user: 'jane.smith', pass: 'Supervisor@123', tone: 'bg-cyan-100 text-cyan-700' },
              { role: 'Manager', user: 'mike.ross', pass: 'Manager@123', tone: 'bg-blue-100 text-blue-700' },
              { role: 'User', user: 'john.doe', pass: 'User@123456', tone: 'bg-slate-100 text-slate-700' },
            ].map((d) => (
              <div key={d.user} className="rounded-xl border border-border p-4 text-center">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${d.tone}`}>{d.role}</span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-2">{d.user}</p>
                <p className="text-[11px] font-mono text-slate-500">{d.pass}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-10 sm:p-14 text-white shadow-xl text-center">
          <MapPin className="w-8 h-8 mx-auto opacity-80" />
          <h2 className="text-2xl font-bold mt-3">Ready to track your team in real time?</h2>
          <p className="text-sm text-sky-100 mt-2 max-w-xl mx-auto">
            Sign in with your company credentials and complete today&apos;s checkpoints.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 mt-6 bg-white text-sky-700 font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-sky-50 transition-colors">
            Sign in now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-border bg-surface-alt">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center gap-8 flex-wrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-500" /> React 19 + Vite</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-500" /> PostgreSQL · Supabase</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sky-500" /> Express REST API · Render</span>
          <span className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-sky-500" /> Live GPS · Leaflet</span>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} BSC Exclusive — Full-stack tracking platform · React + Express + PostgreSQL
        <span className="mx-2">·</span>Account creation: administrators only
      </footer>
    </div>
  )
}
