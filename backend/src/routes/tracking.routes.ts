import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { query } from '../db.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { ah, fail, ok } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

const trackSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  batteryLevel: z.number().min(0).max(100).optional().nullable(),
})

// POST /api/tracking — client reports its location (every 30 minutes)
router.post(
  '/',
  requirePermission('tracking:update'),
  ah(async (req, res) => {
    const user = req.user!
    const parsed = trackSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'Invalid location data')

    const t = parsed.data
    const { rows } = await query<{ id: string; tracked_at: string }>(
      `INSERT INTO location_tracks (user_id, latitude, longitude, accuracy, address, battery_level)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, tracked_at`,
      [user.id, t.latitude, t.longitude, t.accuracy ?? null, t.address ?? null, t.batteryLevel ?? null]
    )
    ok(res, { trackId: rows[0].id, trackedAt: rows[0].tracked_at })
  })
)

// GET /api/tracking/me — my recent tracks
router.get(
  '/me',
  ah(async (req, res) => {
    const { rows } = await query(
      `SELECT id, latitude, longitude, accuracy, address, battery_level, tracked_at
       FROM location_tracks WHERE user_id = $1 ORDER BY tracked_at DESC LIMIT 50`,
      [req.user!.id]
    )
    ok(res, {
      items: rows.map((r) => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        accuracy: r.accuracy,
        address: r.address,
        batteryLevel: r.battery_level,
        trackedAt: r.tracked_at,
      })),
    })
  })
)

// GET /api/tracking/latest — live overview of all users (admins/supervisors/managers)
router.get(
  '/latest',
  requirePermission('tracking:view_all'),
  ah(async (_req, res) => {
    const { rows } = await query<{
      user_id: string
      full_name: string
      employee_code: string
      role_name: string
      department_name: string | null
      profile_image: string | null
      latitude: number
      longitude: number
      accuracy: number | null
      address: string | null
      battery_level: number | null
      tracked_at: string
      online: boolean
    }>(
      `SELECT DISTINCT ON (u.id)
              u.id AS user_id, u.full_name, u.employee_code, r.name AS role_name,
              d.name AS department_name, u.profile_image,
              lt.latitude, lt.longitude, lt.accuracy, lt.address, lt.battery_level, lt.tracked_at,
              (lt.tracked_at >= NOW() - ($1 * INTERVAL '1 minute')) AS online
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN location_tracks lt ON lt.user_id = u.id
       WHERE u.status = 'ACTIVE' AND r.name <> 'ADMIN'
       ORDER BY u.id, lt.tracked_at DESC NULLS LAST`,
      [config.onlineWindowMinutes]
    )
    const { rows: offices } = await query<{
      id: string
      name: string
      code: string
      address: string | null
      latitude: number | null
      longitude: number | null
    }>(`SELECT id, name, code, address, latitude, longitude FROM locations WHERE status = 'ACTIVE'`)
    ok(res, {
      users: rows.map((r) => ({
        userId: r.user_id,
        fullName: r.full_name,
        employeeCode: r.employee_code,
        roleName: r.role_name,
        departmentName: r.department_name,
        profileImage: r.profile_image,
        latitude: r.latitude,
        longitude: r.longitude,
        accuracy: r.accuracy,
        address: r.address,
        batteryLevel: r.battery_level,
        trackedAt: r.tracked_at,
        online: r.online,
      })),
      offices,
    })
  })
)

// GET /api/tracking/history?userId= — track history for one user
router.get(
  '/history',
  requirePermission('tracking:view_all'),
  ah(async (req, res) => {
    const userId = req.query.userId as string
    if (!userId) return fail(res, 400, 'userId is required')
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '200', 10) || 200, 1), 500)
    const { rows } = await query(
      `SELECT id, latitude, longitude, accuracy, address, battery_level, tracked_at
       FROM location_tracks WHERE user_id = $1 ORDER BY tracked_at DESC LIMIT $2`,
      [userId, limit]
    )
    ok(res, {
      items: rows.map((r) => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        accuracy: r.accuracy,
        address: r.address,
        batteryLevel: r.battery_level,
        trackedAt: r.tracked_at,
      })),
    })
  })
)

export default router
