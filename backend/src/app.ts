import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import { config } from './config.js'
import authRoutes from './routes/auth.routes.js'
import publicRoutes from './routes/public.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import modulesRoutes from './routes/modules.routes.js'
import checkpointsRoutes from './routes/checkpoints.routes.js'
import submissionsRoutes from './routes/submissions.routes.js'
import evidenceRoutes from './routes/evidence.routes.js'
import calendarRoutes from './routes/calendar.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import profileRoutes from './routes/profile.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import trackingRoutes from './routes/tracking.routes.js'
import adminRoutes from './routes/admin.routes.js'
import supervisorRoutes from './routes/supervisor.routes.js'
import chatRoutes from './routes/chat.routes.js'
import searchRoutes from './routes/search.routes.js'
import whatsappRoutes from './routes/whatsapp.routes.js'
import { ping } from './db.js'
import { apiRateLimiter } from './middleware/rateLimit.js'

fs.mkdirSync(config.uploadDir, { recursive: true })

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)
  app.use(compression())
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin requests and any configured frontend origin
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true)
        return cb(null, false)
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // Serve locally-stored evidence files (supabase mode serves via redirect)
  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      maxAge: '365d',
      immutable: true,
      index: false,
    })
  )

  app.get('/api/health', async (_req, res) => {
    const dbOk = await ping()
    res.json({ status: dbOk ? 'ok' : 'degraded', database: dbOk, uptime: process.uptime() })
  })

  // Global rate limiter for API routes (protects against scrapers and DDoS)
  app.use('/api', apiRateLimiter)

  app.use('/api/auth', authRoutes)
  app.use('/api/public', publicRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/modules', modulesRoutes)
  app.use('/api/checkpoints', checkpointsRoutes)
  app.use('/api/submissions', submissionsRoutes)
  app.use('/api/evidence', evidenceRoutes)
  app.use('/api/calendar', calendarRoutes)
  app.use('/api/reports', reportsRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/notifications', notificationsRoutes)
  app.use('/api/tracking', trackingRoutes)
  app.use('/api/supervisor', supervisorRoutes)
  app.use('/api/chat', chatRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/search', searchRoutes)
  app.use('/api/whatsapp', whatsappRoutes)

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
  })

  // Central error handler
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('[api] error:', err.message)
      if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON body' })
      }
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  )

  return app
}
