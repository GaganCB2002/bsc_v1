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
  Cookie,
  Shield,
  X,
  ExternalLink,
  Check,
  Sun,
  Moon,
} from 'lucide-react'
import { get } from '../lib/api'
import { useTheme } from '../lib/theme'

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

export default function Landing() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activePolicyModal, setActivePolicyModal] = useState<'terms' | 'privacy' | 'cookies' | null>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    get<Stats>('/api/public/stats')
      .then(setStats)
      .catch(() => undefined)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col justify-between transition-colors duration-300">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-tight text-[15px]">BSC Exclusive</p>
              <p className="text-[9px] text-sky-600 dark:text-sky-400 font-bold tracking-[0.2em] uppercase">Process Tracking</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Features</a>
            <a href="#how" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">How it works</a>
            <a href="#tracking" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Live tracking</a>
            <a href="#security" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Security & Rate Limits</a>
            <button
              onClick={() => setActivePolicyModal('privacy')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium text-slate-500 dark:text-slate-400"
            >
              Policies
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/30 dark:bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur text-sky-700 dark:text-sky-300 text-xs font-bold mb-6 border border-sky-200 dark:border-sky-700 shadow-sm">
            <Satellite className="w-3.5 h-3.5" /> Enterprise Process & Compliance Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 leading-[1.1] tracking-tight">
            Track every process.
            <br />
            <span className="bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">Verify every location.</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Enterprise process compliance tracking with live GPS, evidence uploads, supervisor reviews and complete audit trails — all on one unified dashboard.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn btn-primary btn-lg shadow-lg shadow-sky-500/25">
              Sign In to Platform <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="btn btn-outline btn-lg">
              Learn How It Works
            </a>
          </div>

          {/* Quick policy tags */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-sky-600 dark:hover:text-sky-400 underline">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-sky-600 dark:hover:text-sky-400 underline">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('cookies')} className="hover:text-sky-600 dark:hover:text-sky-400 underline">
              Web Cookies
            </button>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="card shadow-xl border border-slate-100 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100 dark:divide-slate-700 transition-colors">
          {[
            { label: 'Modules', value: stats?.modules ?? '—' },
            { label: 'Checkpoints', value: stats?.checkpoints ?? '—' },
            { label: 'Team Members', value: stats?.users ?? '—' },
            { label: 'Departments', value: stats?.departments ?? '—' },
            { label: 'Submissions', value: stats?.submissions ?? '—' },
            { label: 'Approval Rate', value: stats ? `${stats.approvalRate}%` : '—' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold mb-3">Platform Features</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Everything your team needs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Built for enterprise operational rigor.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 hover:shadow-md dark:hover:border-sky-700 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700 py-20 transition-colors">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold mb-3">Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">How BSC Exclusive works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">From assignment to audit-ready signoff in 4 steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:border-sky-700 transition-all duration-200">
                <span className="text-3xl font-black text-slate-100 dark:text-slate-700 absolute top-4 right-4">{s.step}</span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live tracking */}
      <section id="tracking" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4 border border-emerald-200 dark:border-emerald-800">
              <Satellite className="w-3.5 h-3.5" /> Live GPS Tracking
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Your team's location, updated every 30 minutes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              Every signed-in team member's browser reports its GPS coordinates on a
              <b className="text-slate-700 dark:text-slate-200"> 30-minute cycle</b>. The admin dashboard shows a
              live map with every team member — online/offline status, coordinates, accuracy, battery and full history.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {[
                'Automatic updates — no manual check-ins required',
                'Device battery level reporting on every ping',
                'Registered office locations pinned on the same map',
                'Full historical tracking trail with accuracy bounds',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Team Coordinates</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'John Doe', loc: '19.11360, 72.86970 · Andheri East, Mumbai', online: true, battery: '82%' },
                { name: 'Sarah Lee', loc: '19.21830, 72.97810 · Ghodbunder Road, Thane', online: true, battery: '91%' },
                { name: 'Jane Smith', loc: '19.03300, 73.02970 · Dombivli East, Thane', online: false, battery: '76%' },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-600 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.loc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`block text-[10px] font-bold ${u.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      ● {u.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">{u.battery}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Rate Limiting */}
      <section id="security" className="max-w-6xl mx-auto px-4 py-20 border-t border-slate-100 dark:border-slate-700">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold mb-3">Security & Compliance</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Enterprise-grade protections & Rate Limits</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Active defense mechanisms built into every endpoint.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Lock, title: '5-Attempt Lockout', desc: '5 consecutive incorrect password entries locks the account for 5 minutes to prevent brute-force attacks.' },
            { icon: ShieldCheck, title: 'API Rate Limiting', desc: 'Automated rate limiters throttle unauthorized scraping and DDoS requests with HTTP 429 Retry-After protection.' },
            { icon: Cookie, title: 'Secure Web Cookies', desc: 'HTTP-only SameSite session cookies protect credentials from cross-site scripting and interception.' },
            { icon: ScrollText, title: 'Immutable Audit Trail', desc: 'Every login, state change, and file upload is signed with actor, before/after JSON, and IP address.' },
          ].map((s) => (
            <div key={s.title} className="card p-5 text-center hover:shadow-md dark:hover:border-sky-700 transition-all duration-200">
              <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/40 dark:to-blue-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-border bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center gap-8 flex-wrap text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> React 19 + Vite</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> PostgreSQL · Supabase</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Express REST API · Rate Limited</span>
          <span className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Live GPS · Leaflet</span>
        </div>
      </section>

      {/* Enterprise Multi-Column Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-[#0a0f1a] text-slate-300 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="text-white font-extrabold text-base">BSC Exclusive</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise process and checkpoint compliance verification platform with live GPS audit trail and automated signoffs.
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Compliance Checkpoints</a></li>
                <li><a href="#how" className="hover:text-white transition-colors">4-Step Workflow</a></li>
                <li><a href="#tracking" className="hover:text-white transition-colors">Live GPS Tracking</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Admin & Team Portal</Link></li>
              </ul>
            </div>

            {/* Col 3: Security & Rate Limits */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security & Controls</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-sky-400" /> 5-Attempt / 5-Min Lockout</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sky-400" /> API Rate Limiting</li>
                <li className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-sky-400" /> 30-Min GPS Geolocation</li>
                <li className="flex items-center gap-1.5"><ScrollText className="w-3.5 h-3.5 text-sky-400" /> Immutable Audit Logs</li>
              </ul>
            </div>

            {/* Col 4: Legal & Policies */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Policies</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyModal('terms')}
                    className="hover:text-white transition-colors flex items-center gap-1 text-slate-300"
                  >
                    Terms & Conditions <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyModal('privacy')}
                    className="hover:text-white transition-colors flex items-center gap-1 text-slate-300"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyModal('cookies')}
                    className="hover:text-white transition-colors flex items-center gap-1 text-slate-300"
                  >
                    Web Cookie Policy <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <span className="text-[11px] text-slate-500">ISO/IEC 27001 Aligned</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BSC Exclusive Process Tracking. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setActivePolicyModal('terms')} className="hover:text-slate-300 transition-colors">Terms</button>
              <span>•</span>
              <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-slate-300 transition-colors">Privacy</button>
              <span>•</span>
              <button onClick={() => setActivePolicyModal('cookies')} className="hover:text-slate-300 transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Full Policy Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative border border-slate-100 dark:border-slate-700 transition-colors">
            <button
              onClick={() => setActivePolicyModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tab switchers in modal header */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 pr-8 flex-wrap">
              <button
                type="button"
                onClick={() => setActivePolicyModal('terms')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePolicyModal === 'terms'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" /> Terms & Conditions
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyModal('privacy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePolicyModal === 'privacy'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyModal('cookies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePolicyModal === 'cookies'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Cookie className="w-3.5 h-3.5" /> Web Cookie Policy
              </button>
            </div>

            {/* Modal Body: Terms */}
            {activePolicyModal === 'terms' && (
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Terms & Conditions</h2>
                  <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">Active Policy</span>
                </div>
                <p className="text-slate-400">Effective Date: September 2026 · BSC Exclusive Enterprise Terms</p>

                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">1. Scope of Enterprise Access</h3>
                    <p>BSC Exclusive is an internal operational platform. User accounts are created and configured exclusively by system administrators. No public account registration is permitted.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">2. Password Security & 5-Attempt Lockout Policy</h3>
                    <p>Users are strictly responsible for maintaining credential secrecy. If an incorrect password is entered 5 times consecutively, the platform initiates an automated 5-minute security lockout on that user account and originating IP address.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">3. Automated Rate Limiting</h3>
                    <p>To ensure 99.9% platform availability and protect against automated denial of service, all API and submission endpoints enforce strict rate limiting. Requests exceeding safe thresholds will receive HTTP 429 status codes.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">4. Live GPS Location Tracking Consent</h3>
                    <p>By using the platform, users grant consent to periodic GPS coordinate collection (every 30 minutes during active work hours) for field compliance verification. Falsifying GPS locations or using mock location tools is strictly prohibited.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">5. Evidence Submission & Auto-Approval</h3>
                    <p>All photos, documents, and audio attachments must be authentic representations of checkpoint compliance. Submissions unreviewed by supervisors within 1 hour will be auto-approved by the automated workflow engine.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">6. Audit Trail & Investigation</h3>
                    <p>Every login, session termination, location update, submission, and review is recorded in an immutable audit trail accessible to organizational auditors.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Privacy */}
            {activePolicyModal === 'privacy' && (
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Privacy Policy</h2>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">GDPR & ISO Aligned</span>
                </div>
                <p className="text-slate-400">Effective Date: September 2026 · Confidential Enterprise Platform</p>

                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">1. Information We Collect</h3>
                    <p>We collect and process: Employee full name, employee code, work email, assigned department, supervisor linkages, GPS coordinates, device battery status, and uploaded compliance evidence files.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">2. Location Data Handling & Privacy Safeguards</h3>
                    <p>GPS tracking is strictly operational. Coordinates are collected only during active sessions, encrypted, and accessible solely to assigned supervisors and system administrators. Location histories are purged after 90 days.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">3. Data Encryption Standards</h3>
                    <p>All API communication is encrypted in transit using TLS 1.3. Uploaded evidence files (images, audio, PDF, CSV) and database backups are secured with AES-256 encryption within private Supabase storage buckets.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">4. Zero Data Selling</h3>
                    <p>BSC Exclusive does not sell, license, or share employee data with third-party advertisers, marketing networks, or external aggregators.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">5. Data Access & Rights</h3>
                    <p>Employees have the right to inspect their stored compliance history, audit logs, and submission records by requesting an export from their administrator.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Cookies */}
            {activePolicyModal === 'cookies' && (
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Web Cookie & Local Storage Policy</h2>
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">Mandatory Acceptance</span>
                </div>
                <p className="text-slate-400">Effective Date: September 2026 · Enterprise Session Security</p>

                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">1. Essential Authentication Cookies</h3>
                    <p>We use the HTTP-only cookie <code className="font-mono text-sky-700 dark:text-sky-300 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">bsc_session</code> containing a cryptographically signed JWT token. This cookie is marked SameSite=Lax and cannot be accessed via client-side JavaScript, protecting against XSS attacks.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">2. Rate Limiting & Anti-Brute Force Tokens</h3>
                    <p>Security cookies and memory stores track login attempts to enforce the 5-attempt / 5-minute lockout rule. This prevents automated scripts from guessing credentials.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">3. Local Storage Tokens</h3>
                    <p>We store consent tokens (<code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">bsc_consent_accepted</code>, <code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">bsc_cookies_accepted</code>) and offline draft saves so uncompleted checkpoint answers are never lost.</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">4. Cookie Requirement</h3>
                    <p>Because these cookies and storage items are strictly essential for platform security and basic operation, users must accept web cookies to access the platform.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="btn btn-primary btn-sm text-xs px-6"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
