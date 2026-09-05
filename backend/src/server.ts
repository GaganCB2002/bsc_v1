import { createApp } from './app.js'
import { config } from './config.js'
import { pingWithRetry } from './db.js'
import { startAutoApprovalJob } from './jobs/autoApproval.js'

async function main() {
  console.log(`[server] Starting BSC Exclusive Tracking API...`)
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV || 'development'}`)
  console.log(`[server] DATABASE_URL is ${config.databaseUrl ? 'set' : 'NOT SET'}`)

  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(`[server] BSC Exclusive Tracking API listening on port ${config.port}`)
    console.log(`[server] Evidence storage: ${config.fileStorageType}${config.fileStorageType === 'local' ? ` (${config.uploadDir})` : ` (Supabase bucket "${config.supabaseBucket}")`}`)
    console.log(`[server] DB SSL: ${config.dbSsl ? 'enabled' : 'disabled'}`)
  })

  console.log('[server] Verifying database connectivity...')
  const dbOk = await pingWithRetry(5, 3000)
  if (!dbOk) {
    console.error('[server] FATAL: Could not connect to the database after 5 attempts.')
    console.error('[server] Check that DATABASE_URL is set correctly in your Render environment.')
    console.error('[server] Supabase pooler format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres')
    console.error('[server] In Render dashboard: your service → Environment → add/set DATABASE_URL')
    server.close(() => {
      process.exit(1)
    })
    return
  }
  console.log('[server] Database connection OK')

  startAutoApprovalJob()
  console.log(`[server] Auto-approval job started (window: ${config.autoApproveHours}h, checked every minute)`)
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err)
  process.exit(1)
})
