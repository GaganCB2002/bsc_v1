import type { Request, Response, NextFunction } from 'express'
import { fail } from '../utils/http.js'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: Request) => string
}

interface ClientRecord {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const store = new Map<string, ClientRecord>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown-ip',
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.baseUrl || ''}:${req.path}:${keyGenerator(req)}`
    const now = Date.now()

    let record = store.get(key)
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      }
      store.set(key, record)
    } else {
      record.count += 1
    }

    const remaining = Math.max(0, max - record.count)
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000)

    res.setHeader('RateLimit-Limit', max)
    res.setHeader('RateLimit-Remaining', remaining)
    res.setHeader('RateLimit-Reset', resetSeconds)

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds)
      return fail(res, 429, message, 'RATE_LIMIT_EXCEEDED')
    }

    next()
  }
}

// ------------------------------------------------------------
// Preset Limiters
// ------------------------------------------------------------

// General API: 300 requests per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Too many API requests from this IP. Please slow down.',
})

// Auth endpoints: 15 requests per minute
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please try again shortly.',
})

// Submissions/Uploads: 60 requests per minute
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Upload rate limit reached. Please wait a moment before sending more files.',
})

// ------------------------------------------------------------
// Login Account Lockout (5 attempts, 5 minute lockout)
// ------------------------------------------------------------

interface LoginAttemptRecord {
  failedAttempts: number
  lockoutUntil: number | null
  firstAttemptAt: number
}

const loginAttempts = new Map<string, LoginAttemptRecord>()

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

function getLoginKey(username: string, ip: string): string {
  return `${username.toLowerCase().trim()}:${ip}`
}

export function checkLoginLockout(username: string, ip: string): {
  locked: boolean
  remainingSec: number
  attempts: number
} {
  const key = getLoginKey(username, ip)
  const record = loginAttempts.get(key)
  const now = Date.now()

  if (!record) {
    return { locked: false, remainingSec: 0, attempts: 0 }
  }

  // If lockout expired, reset
  if (record.lockoutUntil && now >= record.lockoutUntil) {
    loginAttempts.delete(key)
    return { locked: false, remainingSec: 0, attempts: 0 }
  }

  if (record.lockoutUntil && now < record.lockoutUntil) {
    const remainingSec = Math.ceil((record.lockoutUntil - now) / 1000)
    return { locked: true, remainingSec, attempts: record.failedAttempts }
  }

  return { locked: false, remainingSec: 0, attempts: record.failedAttempts }
}

export function unlockUser(username: string): void {
  const userLower = username.toLowerCase().trim()
  for (const key of loginAttempts.keys()) {
    if (key.startsWith(`${userLower}:`)) {
      loginAttempts.delete(key)
    }
  }
}

export function recordFailedAttempt(
  username: string,
  ip: string
): {
  locked: boolean
  remainingAttempts: number
  lockoutSec: number
} {
  const key = getLoginKey(username, ip)
  const now = Date.now()
  let record = loginAttempts.get(key)

  if (!record) {
    record = {
      failedAttempts: 1,
      lockoutUntil: null,
      firstAttemptAt: now,
    }
    loginAttempts.set(key, record)
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - 1,
      lockoutSec: 0,
    }
  }

  record.failedAttempts += 1

  if (record.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutSec: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    }
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - record.failedAttempts),
    lockoutSec: 0,
  }
}

export function resetFailedAttempts(username: string, ip: string): void {
  const key = getLoginKey(username, ip)
  loginAttempts.delete(key)
}
