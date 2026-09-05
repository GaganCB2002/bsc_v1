import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2, AlertCircle, Lock, User } from 'lucide-react'
import { post } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-800 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">BSC Exclusive</p>
            <p className="text-xs text-sky-200 tracking-widest">PROCESS TRACKING</p>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-snug">
            Every checkpoint.<br />Every location.<br />Fully verified.
          </h1>
          <ul className="mt-6 space-y-3 text-sm text-sky-100">
            <li className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px]">✓</span> Compliance checkpoints with evidence</li>
            <li className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px]">✓</span> Live GPS tracking every 30 minutes</li>
            <li className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px]">✓</span> Auto-approval after 1 hour</li>
          </ul>
        </div>
        <p className="text-xs text-sky-200/80">© {new Date().getFullYear()} BSC Exclusive Tracking Platform</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-600 font-semibold tracking-wider">PROCESS TRACKING</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to continue to your dashboard.</p>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-bg border border-danger/20 text-danger text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-[1px]" /> {error}
              </div>
            )}
            <div>
              <label className="label">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-9"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  className="input pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5 text-sm">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 card p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Demo accounts</p>
            <div className="space-y-1.5">
              {[
                ['Admin', 'admin', 'Admin@123456'],
                ['User', 'john.doe', 'User@123456'],
                ['Supervisor', 'jane.smith', 'Supervisor@123'],
              ].map(([role, u, p]) => (
                <button
                  key={u}
                  onClick={() => quickFill(u, p)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-primary-faint text-xs transition-colors"
                >
                  <span className="font-medium text-slate-600">{role}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{u}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            <Link to="/" className="hover:text-sky-600 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
