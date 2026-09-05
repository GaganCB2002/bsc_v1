import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Lock, User, Eye, EyeOff, ArrowRight, Shield, Satellite, CheckCircle2, MapPin } from 'lucide-react'
import { post } from '../lib/api'
import { useAuth } from '../lib/auth'

function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <img src="/bsc-logo.png" alt="BSC Exclusive" width={size} height={size} className={`rounded-lg object-contain ${className}`} />
}

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

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9]" />

        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
            {/* Glowing orbs */}
            <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] right-[5%] w-60 h-60 bg-sky-300/20 rounded-full blur-[80px]" />
            <div className="absolute top-[60%] left-[40%] w-40 h-40 bg-blue-400/10 rounded-full blur-[60px]" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <LogoMark size={32} />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-200 tracking-[0.25em] font-semibold">PROCESS TRACKING</p>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="my-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Shield className="w-4 h-4 text-sky-200" />
              <span className="text-xs font-semibold text-sky-100">Enterprise-Grade Security</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Track every process.
              <br />
              <span className="text-sky-200">Verify every location.</span>
            </h1>

            <p className="text-sky-100/70 text-sm mt-6 leading-relaxed max-w-md">
              Enterprise compliance tracking with live GPS, evidence uploads, supervisor approvals and complete audit trails — all on one powerful dashboard.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                { icon: CheckCircle2, text: 'Compliance checkpoints with photo & document evidence' },
                { icon: MapPin, text: 'Live GPS tracking every 30 minutes' },
                { icon: Satellite, text: 'Smart auto-approval after 1 hour if unreviewed' },
                { icon: Shield, text: 'Complete audit trail on every action' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-sky-200" />
                  </div>
                  <span className="text-sm text-sky-50">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Footer */}
          <p className="text-xs text-sky-200/40">© {new Date().getFullYear()} BSC Exclusive Tracking Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <LogoMark size={28} />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">BSC Exclusive</p>
              <p className="text-[10px] text-sky-600 font-semibold tracking-wider">PROCESS TRACKING</p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-2">Sign in to access your dashboard and manage checkpoints.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm mb-6 animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-[1px]" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Username or Email</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-slate-200">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  className="w-full pl-14 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-slate-200">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-14 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Secure Login</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSL Encrypted</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-500" />
              <span>JWT Auth</span>
            </span>
          </div>

          {/* Back to home */}
          <p className="text-center text-xs text-slate-400 mt-8">
            <Link to="/" className="hover:text-sky-600 transition-colors font-medium inline-flex items-center gap-1">
              <span className="text-slate-300">←</span> Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
