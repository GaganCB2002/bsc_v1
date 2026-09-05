import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FolderOpen, Plus, Pencil, Trash2, Layers, Loader2 } from 'lucide-react'
import { get, post, put, del } from '../../lib/api'
import { Spinner, ErrorState, PageHeader } from '../../components/States'
import Modal from '../../components/Modal'

interface ModuleItem {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  status: string
  department_id: string
  department_name: string
  checkpoint_count: number
  submission_count: number
}

interface Dept { id: string; name: string }

export default function AdminModules() {
  const [items, setItems] = useState<ModuleItem[]>([])
  const [depts, setDepts] = useState<Dept[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<ModuleItem | null>(null)
  const [form, setForm] = useState({ departmentId: '', name: '', slug: '', description: '', displayOrder: 0 })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    get<{ modules: ModuleItem[] }>('/api/admin/modules')
      .then((d) => setItems(d.modules))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    void load()
    get<{ departments: Dept[] }>('/api/admin/departments').then((d) => setDepts(d.departments)).catch(() => undefined)
  }, [])

  const openCreate = () => { setEditing(null); setForm({ departmentId: depts[0]?.id || '', name: '', slug: '', description: '', displayOrder: items.length + 1 }); setFormError(''); setModal(true) }
  const openEdit = (m: ModuleItem) => { setEditing(m); setForm({ departmentId: m.department_id, name: m.name, slug: m.slug, description: m.description || '', displayOrder: m.display_order }); setFormError(''); setModal(true) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFormError('')
    try {
      if (editing) {
        await put(`/api/admin/modules/${editing.id}`, { departmentId: form.departmentId || undefined, name: form.name, slug: form.slug || undefined, description: form.description || null, displayOrder: form.displayOrder })
      } else {
        await post('/api/admin/modules', { departmentId: form.departmentId, name: form.name, slug: form.slug || undefined, description: form.description || null, displayOrder: form.displayOrder })
      }
      setModal(false)
      await load()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (m: ModuleItem) => {
    if (!window.confirm(`Delete module "${m.name}" and all its checkpoints?`)) return
    try {
      await del(`/api/admin/modules/${m.id}`)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Modules"
        subtitle="Process modules grouped by department"
        actions={<button onClick={openCreate} className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Plus className="w-3.5 h-3.5" /> New module</button>}
      />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Module</th><th>Department</th><th>Order</th><th>Checkpoints</th><th>Submissions</th><th>Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>
                  <p className="font-semibold text-text">{m.name}</p>
                  <p className="text-[11px] text-text-muted font-mono">/{m.slug}</p>
                </td>
                <td>{m.department_name}</td>
                <td>{m.display_order}</td>
                <td><span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-primary" /> {m.checkpoint_count}</span></td>
                <td>{m.submission_count}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{m.status}</span></td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => void remove(m)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `Edit ${editing.name}` : 'New module'}>
        <form onSubmit={submit} className="space-y-3">
          {formError && <p className="text-xs text-danger font-semibold">{formError}</p>}
          <div>
            <label className="label">Department *</label>
            <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
              <option value="">Select...</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Slug (auto if empty)</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-module" /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Display order</label><input className="input" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value || '0', 10) })} /></div>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Save changes' : 'Create module'}</button>
        </form>
      </Modal>
    </div>
  )
}
