import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  FolderOpen,
  ListChecks,
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
  AlertTriangle,
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

function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <img src="/bsc-logo.png" alt="BSC Exclusive" width={size} height={size} className={`rounded-lg object-contain ${className}`} />
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

const RATE_LIMITS = [
  { endpoint: 'Authentication', limit: '10 requests / minute', desc: 'Login, logout, password reset' },
  { endpoint: 'API Requests', limit: '100 requests / minute', desc: 'General data access and queries' },
  { endpoint: 'File Uploads', limit: '10 uploads / minute', desc: 'Evidence and document uploads' },
  { endpoint: 'GPS Tracking', limit: '1 update / 30 minutes', desc: 'Location sync frequency' },
  { endpoint: 'Submissions', limit: '20 requests / minute', desc: 'Checkpoint submissions and edits' },
  { endpoint: 'Password Reset', limit: '5 requests / hour', desc: 'Account recovery attempts' },
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-extrabold text-slate-900 leading-tight text-[15px]">BSC Exclusive</p>
              <p className="text-[9px] text-sky-600 font-bold tracking-[0.2em] uppercase">Process Tracking</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-sky-600 transition-colors">How it works</a>
            <a href="#tracking" className="hover:text-sky-600 transition-colors">Live tracking</a>
            <a href="#security" className="hover:text-sky-600 transition-colors">Security</a>
            <a href="#limits" className="hover:text-sky-600 transition-colors">Limits</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-b border-sky-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur text-sky-700 text-xs font-bold mb-6 border border-sky-200 shadow-sm">
            <Satellite className="w-3.5 h-3.5" /> Enterprise Process & Compliance Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Track every process.
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Verify every location.</span>
          </h1>
          <p className="mt-5 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Assign checkpoints, collect evidence, review submissions and watch your team's live
            location on one clean dashboard — powered by PostgreSQL on Supabase.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm px-7 py-3 rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25">
              Launch Application <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-sky-500" /> Live tracking</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-500" /> Auto-approval</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="card shadow-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100">
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
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold mb-3">Features</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Everything you need, in one place</h2>
          <p className="text-sm text-slate-500 mt-2">Built for operations teams that need proof, not promises.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group card p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 flex items-center justify-center mb-3 group-hover:from-sky-100 group-hover:to-blue-100 transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold mb-3">How it works</span>
            <h2 className="text-3xl font-extrabold text-slate-900">From account creation to approval</h2>
            <p className="text-sm text-slate-500 mt-2">The complete compliance loop — in four simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="card p-5 relative overflow-hidden">
                <div className="absolute top-3 right-3 text-5xl font-black text-slate-100">{s.step}</div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-3">{s.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live tracking */}
      <section id="tracking" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 border border-emerald-200">
              <Satellite className="w-3.5 h-3.5" /> Live GPS Tracking
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Your team's location, updated every 30 minutes</h2>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Every signed-in team member's browser reports its GPS coordinates on a
              <b className="text-slate-700"> 30-minute cycle</b>. The admin dashboard shows a
              live map with every team member — online/offline status, coordinates, accuracy, battery and full history.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[
                'Automatic updates — no manual check-ins required',
                'Registered office locations pinned on the same map',
                'Graceful degradation — works fully even without location permission',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">What the admin sees</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'John Doe', loc: '19.11360, 72.86970 · Andheri East, Mumbai', online: true, battery: '82%' },
                { name: 'Sarah Lee', loc: '19.21830, 72.97810 · Ghodbunder Road, Thane', online: true, battery: '91%' },
                { name: 'Jane Smith', loc: '19.03300, 73.02970 · Dombivli East, Thane', online: false, battery: '76%' },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.loc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block text-[10px] font-bold ${u.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                      ● {u.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <span className="block text-[10px] text-slate-500">{u.battery}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section id="limits" className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-3 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" /> Rate Limits
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">API Usage Limits</h2>
            <p className="text-sm text-slate-500 mt-2">To ensure fair usage and platform stability, the following rate limits apply.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RATE_LIMITS.map((r) => (
              <div key={r.endpoint} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">{r.endpoint}</h3>
                </div>
                <p className="text-lg font-extrabold text-amber-600">{r.limit}</p>
                <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold mb-3">Security</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Enterprise-grade protections</h2>
          <p className="text-sm text-slate-500 mt-2">Built into every request, not just the UI.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Lock, title: 'JWT sessions', desc: 'Signed tokens in HTTP-only cookies, revocable server-side session rows.' },
            { icon: ShieldCheck, title: 'Granular RBAC', desc: '40+ permissions checked on every API request, not just in the UI.' },
            { icon: ScrollText, title: 'Full audit trail', desc: 'Every state change logged with actor, before/after JSON, IP and user agent.' },
            { icon: ShieldCheck, title: 'Data encryption', desc: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256).' },
          ].map((s) => (
            <div key={s.title} className="card p-5 text-center hover:shadow-md transition-shadow">
              <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-2xl p-10 sm:p-14 text-white shadow-2xl shadow-blue-500/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <MapPin className="w-8 h-8 mx-auto opacity-80" />
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">Ready to track your team in real time?</h2>
            <p className="text-sm text-sky-100 mt-3 max-w-xl mx-auto">
              Sign in with your company credentials and complete today's checkpoints.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 mt-7 bg-white text-sky-700 font-bold text-sm px-7 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg">
              Sign in now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-border bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center gap-8 flex-wrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-500" /> React 19 + Vite</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-500" /> PostgreSQL · Supabase</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sky-500" /> Express REST API</span>
          <span className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-sky-500" /> Live GPS · Leaflet</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} BSC Exclusive — Enterprise Process & Compliance Tracking Platform
      </footer>
    </div>
  )
}
