import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { ah, fail, ok } from '../utils/http.js'
import { clearCookie, createSession, destroySession } from '../utils/session.js'
import { logAudit } from '../utils/audit.js'
import { config } from '../config.js'
import {
  authRateLimiter,
  checkLoginLockout,
  recordFailedAttempt,
  resetFailedAttempts,
} from '../middleware/rateLimit.js'

const router = Router()

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
})

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  ah(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'Username and password are required')

    const { username, password } = parsed.data
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip'

    // 1. Check if account or IP is locked out
    const lockout = checkLoginLockout(username, clientIp)
    if (lockout.locked) {
      const min = Math.floor(lockout.remainingSec / 60)
      const sec = lockout.remainingSec % 60
      const timeStr = min > 0 ? `${min}m ${sec}s` : `${sec}s`
      return fail(
        res,
        429,
        `Too many failed login attempts. Account temporarily locked for 5 minutes. Try again in ${timeStr}.`,
        'ACCOUNT_LOCKED'
      )
    }

    const { rows } = await query<{
      id: string
      password_hash: string
      status: string
      role_name: string
    }>(
      `SELECT u.id, u.password_hash, u.status, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.username = $1 OR u.email = $1`,
      [username]
    )
    const user = rows[0]

    if (!user) {
      const attempt = recordFailedAttempt(username, clientIp)
      if (attempt.locked) {
        return fail(
          res,
          429,
          'Too many failed login attempts (5/5). Account temporarily locked for 5 minutes.',
          'ACCOUNT_LOCKED'
        )
      }
      return fail(
        res,
        401,
        `Invalid username or password. ${attempt.remainingAttempts} attempt(s) remaining before a 5-minute lockout.`,
        'INVALID_CREDENTIALS'
      )
    }

    if (user.status !== 'ACTIVE') {
      return fail(res, 403, 'Your account is not active. Contact your administrator.', 'ACCOUNT_INACTIVE')
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      const attempt = recordFailedAttempt(username, clientIp)
      if (attempt.locked) {
        return fail(
          res,
          429,
          'Too many failed login attempts (5/5). Account temporarily locked for 5 minutes.',
          'ACCOUNT_LOCKED'
        )
      }
      return fail(
        res,
        401,
        `Invalid username or password. ${attempt.remainingAttempts} attempt(s) remaining before a 5-minute lockout.`,
        'INVALID_CREDENTIALS'
      )
    }

    // Reset failed attempts on successful login
    resetFailedAttempts(username, clientIp)

    await createSession(user.id, req, res)
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])
    await logAudit({ userId: user.id, action: 'LOGIN', entityType: 'user', entityId: user.id, req })

    return ok(res, {
      redirectUrl:
        user.role_name === 'ADMIN'
          ? '/admin'
          : ['SUPERVISOR', 'MANAGER'].includes(user.role_name)
            ? '/supervisor'
            : '/dashboard',
    })
  })
)

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => ok(res, { user: req.user }))

// POST /api/auth/logout
router.post(
  '/logout',
  ah(async (req, res) => {
    const token = (req.cookies as Record<string, string>)[config.cookieName]
    if (token) {
      const user = await import('../middleware/auth.js').then((m) => m.loadUser(req))
      await destroySession(token)
      if (user) {
        await logAudit({ userId: user.id, action: 'LOGOUT', entityType: 'user', entityId: user.id, req })
      }
    }
    clearCookie(res)
    return ok(res, { loggedOut: true })
  })
)

export default router
