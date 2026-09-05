import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Lock, User, Eye, EyeOff, Info } from 'lucide-react'
import { post } from '../lib/api'
import { useAuth } from '../lib/auth'

function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <img src="/bsc-logo.png" alt="BSC Exclusive" width={size} height={size} className={`rounded-lg object-contain ${className}`} />
}

const DEMO_ACCOUNTS = [
  { role: 'Admin', username: 'admin', password: 'Admin@123456', color: 'bg-sky-500' },
  { role: 'User', username: 'john.doe', password: 'User@123456', color: 'bg-emerald-500' },
  { role: 'Supervisor', username: 'jane.smith', password: 'Supervisor@123', color: 'bg-violet-500' },
  { role: 'Manager', username: 'mike.ross', password: 'Manager@123', color: 'bg-amber-500' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter your username and password')
      return
    }
    setBusy(true)
    try {
      const data = await post<{ redirectUrl: string }>('/api/auth/login', { username: username.trim(), password })
      await refresh()
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || data.redirectUrl || '/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const quickFill = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0c4a6e] via-[#075985] to-[#1e3a5f] text-white flex-col justify-between p-10 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-sky-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <LogoMark size={42} />
            <div>
              <p className="font-bold text-lg leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-200 tracking-[0.2em] font-medium">PROCESS TRACKING</p>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-snug">
            Every checkpoint.<br />Every location.<br />Fully verified.
          </h1>
          <p className="text-sm text-sky-100/80 mt-4 max-w-md leading-relaxed">
            Enterprise compliance tracking with live GPS, evidence uploads, supervisor approvals and full audit trails — all on one dashboard.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-sky-100">
            {[
              'Compliance checkpoints with photo & document evidence',
              'Live GPS tracking every 30 minutes',
              'Auto-approval after 1 hour if unreviewed',
              'Complete audit trail on every action',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sky-200/60 relative z-10">© {new Date().getFullYear()} BSC Exclusive Tracking Platform. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <LogoMark size={36} />
            <div>
              <p className="font-bold text-slate-900 leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-600 font-semibold tracking-wider">PROCESS TRACKING</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1.5 mb-6">Sign in to access your dashboard and manage checkpoints.</p>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-[1px]" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
            <div>
              <label className="label">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-10"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5 text-sm">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in to Dashboard'}
            </button>
          </form>

          {/* Demo accounts - Admin highlighted */}
          <div className="mt-6 card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-slate-50">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Demo Login Credentials</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => quickFill(acc.username, acc.password)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group ${
                    acc.username === 'admin'
                      ? 'border-sky-300 bg-sky-50 hover:bg-sky-100 ring-1 ring-sky-200'
                      : 'border-border hover:border-sky-200 hover:bg-sky-50/50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg ${acc.color} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0`}>
                    {acc.role[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${acc.username === 'admin' ? 'text-sky-700' : 'text-slate-700'}`}>
                        {acc.role}
                      </span>
                      {acc.username === 'admin' && (
                        <span className="px-1.5 py-[1px] rounded bg-sky-500 text-white text-[9px] font-bold tracking-wide">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-500">{acc.username}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-mono text-slate-400">{acc.password}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    FILL →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            <Link to="/" className="hover:text-sky-600 transition-colors font-medium">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
