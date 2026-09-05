import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { ah, fail, ok } from '../utils/http.js'
import { logAudit } from '../utils/audit.js'
import { destroySession } from '../utils/session.js'
import { config } from '../config.js'

const router = Router()
router.use(requireAuth)

const updateSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  email: z.string().email().max(150).optional(),
  phone: z.string().max(30).nullable().optional(),
})

// GET /api/profile
router.get(
  '/',
  ah(async (req, res) => {
    const user = req.user!
    const { rows } = await query<{
      id: string
      employee_code: string
      full_name: string
      email: string
      phone: string | null
      username: string
      profile_image: string | null
      must_change_password: boolean
      last_login_at: string | null
      role_name: string
      department_name: string | null
      created_at: string
    }>(
      `SELECT u.id, u.employee_code, u.full_name, u.email, u.phone, u.username,
              u.profile_image, u.must_change_password, u.last_login_at, u.created_at,
              r.name AS role_name, d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.id = $1`,
      [user.id]
    )
    ok(res, { profile: rows[0] })
  })
)

// PUT /api/profile
router.put(
  '/',
  ah(async (req, res) => {
    const user = req.user!
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'Invalid profile data')
    const d = parsed.data
    await query(
      `UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email),
       phone = $3, updated_at = NOW() WHERE id = $4`,
      [d.fullName || null, d.email || null, d.phone === undefined ? null : d.phone, user.id]
    )
    await logAudit({ userId: user.id, action: 'PROFILE_UPDATED', entityType: 'user', entityId: user.id, req })
    ok(res, { updated: true })
  })
)

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// PUT /api/profile/password
router.put(
  '/password',
  ah(async (req, res) => {
    const user = req.user!
    const parsed = passwordSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.issues[0]?.message || 'Invalid password')

    const { rows } = await query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    )
    const valid = await bcrypt.compare(parsed.data.currentPassword, rows[0].password_hash)
    if (!valid) return fail(res, 400, 'Current password is incorrect')

    await query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() WHERE id = $2`,
      [await bcrypt.hash(parsed.data.newPassword, 10), user.id]
    )
    // Revoke other sessions
    const token = (req.cookies as Record<string, string>)[config.cookieName]
    await query('DELETE FROM sessions WHERE user_id = $1 AND token <> $2', [user.id, token])
    await logAudit({ userId: user.id, action: 'PASSWORD_CHANGED', entityType: 'user', entityId: user.id, req })
    ok(res, { updated: true })
  })
)

export default router
