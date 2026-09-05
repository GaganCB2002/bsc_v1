import type { Request, Response } from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { config } from '../config.js'
import { query } from '../db.js'

const secret = new TextEncoder().encode(config.sessionSecret)

export async function createSession(
  userId: string,
  req: Request,
  res: Response
): Promise<void> {
  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 3600 * 1000)
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret)

  await query(
    `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5)`,
    [userId, token, expiresAt, req.ip || null, req.headers['user-agent'] || null]
  )

  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: config.sessionTtlDays * 24 * 3600 * 1000,
  })
}

export async function destroySession(token: string): Promise<void> {
  try {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  } catch (err) {
    console.error('[session] destroy failed:', (err as Error).message)
  }
}

export function clearCookie(res: Response): void {
  res.clearCookie(config.cookieName, { path: '/' })
}

export async function verifyToken(token: string): Promise<{ uid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    if (typeof payload.uid === 'string') return { uid: payload.uid }
    return null
  } catch {
    return null
  }
}
