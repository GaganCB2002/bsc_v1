import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Building2, FolderOpen, ListChecks, ClipboardCheck, Paperclip,
  Satellite, CheckCircle2, Clock, AlertTriangle, Activity, ArrowRight, MapPin,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { get } from '../../lib/api'
import { Spinner, ErrorState, PageHeader } from '../../components/States'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { fmtDateTime, timeAgo } from '../../lib/format'

interface AdminDashboardData {
  counts: {
    users: number
    departments: number
    modules: number
    checkpoints: number
    submissions: number
    pendingReview: number
    approvedToday: number
    evidence: number
    onlineTrackers: number
  }
  trend: { day: string; total: number; approved: number }[]
  statusDistribution: { status: string; c: number }[]
  departmentPerformance: { name: string; total: number; approved: number; pending: number; rejected: number }[]
  recentSubmissions: { id: string; user_name: string; checkpoint_title: string; module_name: string; status: string; submission_date: string; updated_at: string }[]
  latestTracks: { full_name: string; role_name: string; department_name: string | null; latitude: number; longitude: number; address: string | null; battery_level: number | null; tracked_at: string; online: boolean }[]
  recentAudit: { id: string; user_name: string | null; action: string; entity_type: string; created_at: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#16a34a', SUBMITTED: '#0ea5e9', REJECTED: '#dc2626', DRAFT: '#d97706', PENDING: '#94a3b8', OVERDUE: '#7f1d1d',
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    get<AdminDashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <Spinner text="Loading admin dashboard..." />
  if (error || !data) return <ErrorState message={error || 'Failed to load'} onRetry={load} />

  const trend = data.trend.map((t) => ({ ...t, label: new Date(t.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))
  const statusPie = data.statusDistribution.map((s) => ({ name: s.status, value: s.c }))

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Complete overview of the tracking system" />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <StatCard label="Active Users" value={data.counts.users} icon={Users} />
        <StatCard label="Departments" value={data.counts.departments} icon={Building2} />
        <StatCard label="Modules" value={data.counts.modules} icon={FolderOpen} />
        <StatCard label="Checkpoints" value={data.counts.checkpoints} icon={ListChecks} />
        <StatCard label="Total Submissions" value={data.counts.submissions} icon={ClipboardCheck} />
        <StatCard label="Pending Review" value={data.counts.pendingReview} icon={Clock} tone="warning" hint="Auto-approve after 1h" />
        <StatCard label="Approved Today" value={data.counts.approvedToday} icon={CheckCircle2} tone="success" />
        <StatCard label="Evidence Files" value={data.counts.evidence} icon={Paperclip} tone="info" />
        <StatCard label="Online Trackers" value={data.counts.onlineTrackers} icon={Satellite} tone="primary" hint="Live GPS · 30 min cycle" />
        <StatCard label="Log Entries" value="Live" icon={Activity} tone="success" hint="Audit trail active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Trend */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-bold text-text mb-3">Submissions — last 14 days</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={trend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="total" name="Total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-text mb-3">Status distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={3}>
                {statusPie.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 flex-wrap text-[10px] font-semibold text-text-secondary mt-1">
            {statusPie.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#94a3b8' }} /> {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live locations */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Satellite className="w-4 h-4 text-primary" /> Live Locations
            </h3>
            <Link to="/admin/tracking" className="text-xs text-primary hover:text-primary-dark font-semibold">Open map →</Link>
          </div>
          <div className="divide-y divide-border-light max-h-80 overflow-y-auto">
            {data.latestTracks.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-text-muted">No location data yet</p>
            ) : (
              data.latestTracks.map((t) => (
                <div key={t.full_name} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-text truncate">{t.full_name}</p>
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${t.online ? 'text-success' : 'text-text-muted'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.online ? 'bg-success' : 'bg-slate-300'}`} />
                      {t.online ? 'Online' : timeAgo(t.tracked_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {t.latitude ? `${t.latitude.toFixed(5)}, ${t.longitude.toFixed(5)}` : 'No fix yet'}
                    {t.address ? ` · ${t.address}` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" /> Recent Submissions
            </h3>
            <Link to="/admin/submissions" className="text-xs text-primary hover:text-primary-dark font-semibold">Review →</Link>
          </div>
          <div className="divide-y divide-border-light max-h-80 overflow-y-auto">
            {data.recentSubmissions.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-text-muted">No submissions yet</p>
            ) : (
              data.recentSubmissions.map((s) => (
                <div key={s.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-text truncate">{s.checkpoint_title}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {s.user_name} · {s.module_name} · {s.submission_date}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent audit */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Audit Activity
            </h3>
            <Link to="/admin/audit-logs" className="text-xs text-primary hover:text-primary-dark font-semibold">All logs →</Link>
          </div>
          <div className="divide-y divide-border-light max-h-80 overflow-y-auto">
            {data.recentAudit.map((a) => (
              <div key={a.id} className="px-5 py-3">
                <p className="text-xs font-bold text-text">{a.action}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {a.user_name || 'System'} · {a.entity_type} · {fmtDateTime(a.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-4 mt-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Quick actions:</span>
        {[
          ['Create user', '/admin/users'],
          ['New module', '/admin/modules'],
          ['Assign checkpoint', '/admin/assignments'],
          ['Review submissions', '/admin/submissions'],
          ['Live tracking map', '/admin/tracking'],
        ].map(([label, to]) => (
          <Link key={to} to={to} className="btn btn-outline btn-sm">
            {label} <ArrowRight className="w-3 h-3" />
          </Link>
        ))}
      </div>
    </div>
  )
}
