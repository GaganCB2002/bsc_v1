import type { Request } from 'express'
import { query } from '../db.js'

export async function logAudit(input: {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldValues?: unknown
  newValues?: unknown
  req?: Request
}) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        input.userId || null,
        input.action,
        input.entityType,
        input.entityId || null,
        input.oldValues ? JSON.stringify(input.oldValues) : null,
        input.newValues ? JSON.stringify(input.newValues) : null,
        input.req?.ip || null,
        input.req?.headers['user-agent'] || null,
      ]
    )
  } catch (err) {
    console.error('[audit] write failed:', (err as Error).message)
  }
}
