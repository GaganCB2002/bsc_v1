import { useEffect, useState } from 'react'
import { ShieldCheck, Loader2, Save } from 'lucide-react'
import { get, put } from '../../lib/api'
import { Spinner, ErrorState, PageHeader } from '../../components/States'
import Modal from '../../components/Modal'

interface Role {
  id: string
  name: string
  description: string | null
  user_count: number
  permission_count: number
  permission_ids: string[] | null
}

interface Permission {
  id: string
  name: string
  description: string | null
  category: string
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [grouped, setGrouped] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Role | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([
      get<{ roles: Role[] }>('/api/admin/roles'),
      get<{ grouped: Record<string, Permission[]> }>('/api/admin/roles/permissions'),
    ])
      .then(([r, p]) => {
        setRoles(r.roles)
        setGrouped(p.grouped)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { void load() }, [])

  const openRole = async (role: Role) => {
    setSelected(role)
    setMsg('')
    setChecked(new Set(role.permission_ids || []))
  }

  const toggle = (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }

  const save = async () => {
    if (!selected) return
    setBusy(true)
    setMsg('')
    try {
      await put(`/api/admin/roles/${selected.id}`, { permissionIds: Array.from(checked) })
      setMsg('Permissions saved')
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner text="Loading roles..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const allPermissions = Object.values(grouped).flat()

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Granular access control for every role" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="card p-5 hover:border-primary transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-deep flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-text-muted">{r.user_count} user{r.user_count === 1 ? '' : 's'}</span>
            </div>
            <h3 className="text-sm font-bold text-text mt-3">{r.name}</h3>
            <p className="text-xs text-text-muted mt-1 min-h-[2rem]">{r.description || '—'}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-text-secondary">{r.permission_count} permissions</span>
              {r.name !== 'ADMIN' ? (
                <button className="btn btn-outline btn-sm" onClick={() => void openRole(r)}>Edit permissions</button>
              ) : (
                <span className="text-[11px] font-semibold text-success">All permissions</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Permissions — ${selected?.name || ''}`} wide>
        {msg && <p className={`text-xs font-semibold mb-3 ${msg === 'Permissions saved' ? 'text-success' : 'text-danger'}`}>{msg}</p>}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([category, perms]) => (
            <div key={category}>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-2">{category}</h4>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {perms.map((p) => (
                  <label key={p.id} className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors">
                    <input type="checkbox" className="accent-sky-500 mt-0.5" checked={checked.has(p.id)} onChange={() => toggle(p.id)} />
                    <span>
                      <span className="block text-xs font-semibold text-text">{p.name}</span>
                      {p.description && <span className="block text-[10px] text-text-muted">{p.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <button className="btn btn-outline btn-sm" onClick={() => setChecked(new Set(allPermissions.map((p) => p.id)))}>Select all</button>
          <button className="btn btn-primary" onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save permissions
          </button>
        </div>
      </Modal>
    </div>
  )
}
