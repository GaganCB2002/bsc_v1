import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Search, Plus, Pencil, Trash2, KeyRound, UserCheck, UserX, Loader2 } from 'lucide-react'
import { get, post, put, del } from '../../lib/api'
import { Spinner, ErrorState, PageHeader } from '../../components/States'
import Modal from '../../components/Modal'
import { fmtDateTime } from '../../lib/format'

interface AdminUser {
  id: string
  employee_code: string
  full_name: string
  email: string
  phone: string | null
  username: string
  status: string
  role_name: string
  department_name: string | null
  last_login_at: string | null
  created_at: string
}

interface Option { id: string; name: string }
interface RoleOption extends Option { }

const emptyForm = {
  employeeCode: '', fullName: '', email: '', phone: '', username: '', password: '',
  roleId: '', departmentId: '', reportingManagerId: '',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [departments, setDepartments] = useState<Option[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'password' | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (roleFilter) q.set('role', roleFilter)
    if (statusFilter) q.set('status', statusFilter)
    get<{ users: AdminUser[] }>(`/api/admin/users?${q.toString()}`)
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void load()
    get<{ roles: RoleOption[] }>('/api/admin/roles').then((d) => setRoles(d.roles)).catch(() => undefined)
    get<{ departments: Option[] }>('/api/admin/departments').then((d) => setDepartments(d.departments)).catch(() => undefined)
  }, [search, roleFilter, statusFilter])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setModal('create') }
  const openEdit = (u: AdminUser) => {
    setEditing(u)
    setForm({ employeeCode: u.employee_code, fullName: u.full_name, email: u.email, phone: u.phone || '', username: u.username, password: '', roleId: '', departmentId: '', reportingManagerId: '' })
    setFormError('')
    setModal('edit')
  }
  const openPassword = (u: AdminUser) => { setEditing(u); setNewPassword(''); setFormError(''); setModal('password') }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFormError('')
    try {
      await post('/api/admin/users', {
        employeeCode: form.employeeCode, fullName: form.fullName, email: form.email,
        phone: form.phone || null, username: form.username, password: form.password,
        roleId: form.roleId, departmentId: form.departmentId || null,
      })
      setModal(null)
      await load()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    setFormError('')
    try {
      await put(`/api/admin/users/${editing.id}`, {
        fullName: form.fullName, email: form.email, phone: form.phone || null,
        roleId: form.roleId || undefined, departmentId: form.departmentId || null,
      })
      setModal(null)
      await load()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    setFormError('')
    try {
      await post(`/api/admin/users/${editing.id}/reset-password`, { newPassword })
      setModal(null)
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async (u: AdminUser) => {
    try {
      await put(`/api/admin/users/${u.id}`, { status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const removeUser = async (u: AdminUser) => {
    if (!window.confirm(`Delete user "${u.full_name}"? This cannot be undone.`)) return
    try {
      await del(`/api/admin/users/${u.id}`)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create and manage all system users"
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> New user
          </button>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Search name, email, username or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option>
        </select>
      </div>

      {error && <p className="text-xs text-danger mb-3 font-semibold">{error}</p>}

      {loading ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th><th>Employee Code</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-text-muted">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <p className="font-semibold text-text">{u.full_name}</p>
                      <p className="text-[11px] text-text-muted">{u.email}</p>
                    </td>
                    <td className="font-mono text-xs">{u.employee_code}</td>
                    <td><span className="px-2 py-0.5 rounded-full bg-primary-light text-primary-deep text-[10px] font-bold">{u.role_name}</span></td>
                    <td>{u.department_name || '—'}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-xs text-text-secondary">{fmtDateTime(u.last_login_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></button>
                        <button className="btn btn-ghost btn-sm" title="Reset password" onClick={() => openPassword(u)}><KeyRound className="w-3.5 h-3.5" /></button>
                        <button className="btn btn-ghost btn-sm" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => void toggleStatus(u)}>
                          {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button className="btn btn-ghost btn-sm text-danger" title="Delete" onClick={() => void removeUser(u)}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create user">
        <form onSubmit={submitCreate} className="space-y-3">
          {formError && <p className="text-xs text-danger font-semibold">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Full name *</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
            <div><label className="label">Employee code *</label><input className="input" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} required /></div>
            <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Username *</label><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
            <div><label className="label">Password * (min 8 chars)</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required>
                <option value="">Select role...</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">None</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create user'}</button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={`Edit ${editing?.full_name || 'user'}`}>
        <form onSubmit={submitEdit} className="space-y-3">
          {formError && <p className="text-xs text-danger font-semibold">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Full name</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                <option value="">Keep current</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">None</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}</button>
        </form>
      </Modal>

      {/* Password modal */}
      <Modal open={modal === 'password'} onClose={() => setModal(null)} title={`Reset password — ${editing?.full_name || ''}`}>
        <form onSubmit={submitPassword} className="space-y-3">
          {formError && <p className="text-xs text-danger font-semibold">{formError}</p>}
          <div>
            <label className="label">New password (min 8 chars)</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <p className="text-[11px] text-text-muted">The user will be asked to change this password at next login, and all their sessions will be revoked.</p>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset password'}</button>
        </form>
      </Modal>
    </div>
  )
}
