import { useEffect, useState } from 'react'
import { ScrollText, Search } from 'lucide-react'
import { get } from '../../lib/api'
import { Spinner, ErrorState, PageHeader } from '../../components/States'
import Modal from '../../components/Modal'
import { fmtDateTime } from '../../lib/format'

interface AuditRow {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  old_values: unknown
  new_values: unknown
  ip_address: string | null
  created_at: string
  user_name: string | null
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-info-bg text-info',
  LOGOUT: 'bg-surface-alt text-text-muted',
  SUBMISSION_APPROVED: 'bg-success-bg text-success',
  SUBMISSION_REJECTED: 'bg-danger-bg text-danger',
  SUBMISSION_AUTO_APPROVED: 'bg-success-bg text-success',
  CHECKPOINT_SUBMITTED: 'bg-primary-light text-primary-deep',
  EVIDENCE_UPLOADED: 'bg-primary-light text-primary-deep',
  EVIDENCE_DELETED: 'bg-danger-bg text-danger',
  USER_CREATED: 'bg-primary-light text-primary-deep',
  USER_DELETED: 'bg-danger-bg text-danger',
}

export default function AdminAuditLogs() {
  const [data, setData] = useState<{ items: AuditRow[]; total: number; page: number; pageSize: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<AuditRow | null>(null)

  const load = () => {
    setLoading(true)
    setError('')
    const q = new URLSearchParams()
    if (search) q.set('user', search)
    q.set('page', String(page))
    q.set('pageSize', '30')
    get<{ items: AuditRow[]; total: number; page: number; pageSize: number }>(`/api/admin/audit-logs?${q.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { void load() }, [search, page])

  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Every system action, fully traceable" />

      <div className="card p-4 mb-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Filter by user..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>IP</th><th className="text-right">Details</th></tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap text-xs text-text-secondary">{fmtDateTime(a.created_at)}</td>
                <td className="font-semibold text-text">{a.user_name || 'System'}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ACTION_COLORS[a.action] || 'bg-surface-alt text-text-secondary'}`}>
                    {a.action}
                  </span>
                </td>
                <td className="text-xs text-text-secondary">{a.entity_type}{a.entity_id ? ` · ${a.entity_id.slice(0, 8)}` : ''}</td>
                <td className="font-mono text-[11px] text-text-muted">{a.ip_address || '—'}</td>
                <td className="text-right">
                  {Boolean(a.old_values || a.new_values) && (
                    <button className="btn btn-outline btn-sm" onClick={() => setDetail(a)}>View</button>
                  )}
                </td>
              </tr>
            ))}
            {(data?.items || []).length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-text-muted">No audit entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mt-3">
        <span>{data?.total || 0} entries</span>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <button className="btn btn-outline btn-sm" disabled={(data?.page || 1) * (data?.pageSize || 30) >= (data?.total || 0)} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Audit detail — ${detail?.action || ''}`} wide>
        {detail && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-alt border border-border p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase">Time</p>
                <p className="text-text mt-1 font-semibold">{fmtDateTime(detail.created_at)}</p>
              </div>
              <div className="rounded-xl bg-surface-alt border border-border p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase">Actor</p>
                <p className="text-text mt-1 font-semibold">{detail.user_name || 'System'} · {detail.ip_address || 'no IP'}</p>
              </div>
            </div>
            {(detail.old_values !== null && detail.old_values !== undefined) && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Before</p>
                <pre className="bg-surface-alt rounded-lg p-3 overflow-x-auto text-[11px] text-text-secondary">{JSON.stringify(detail.old_values, null, 2)}</pre>
              </div>
            )}
            {(detail.new_values !== null && detail.new_values !== undefined) && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">After</p>
                <pre className="bg-primary-faint rounded-lg p-3 overflow-x-auto text-[11px] text-primary-deep">{JSON.stringify(detail.new_values, null, 2)}</pre>
              </div>
            )}
            {detail.old_values === null && detail.new_values === null && (
              <p className="text-text-muted py-4 text-center flex items-center justify-center gap-2"><ScrollText className="w-4 h-4" /> No payload recorded for this action.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
