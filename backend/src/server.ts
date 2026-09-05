import { createApp } from './app.js'
import { config } from './config.js'
import { ping } from './db.js'
import { startAutoApprovalJob } from './jobs/autoApproval.js'

async function main() {
  const dbOk = await ping()
  if (!dbOk) {
    console.error('[server] Cannot reach the database. Check DATABASE_URL in backend/.env')
    console.error('[server] Tip: run `npm run init` in the database folder first.')
    process.exit(1)
  }
  console.log('[server] Database connection OK')

  const app = createApp()
  app.listen(config.port, () => {
    console.log(`[server] BSC Exclusive Tracking API running on port ${config.port}`)
    console.log(`[server] Evidence storage: ${config.fileStorageType}${config.fileStorageType === 'local' ? ` (${config.uploadDir})` : ` (Supabase bucket "${config.supabaseBucket}")`}`)
    console.log(`[server] DB SSL: ${config.dbSsl ? 'enabled' : 'disabled'}`)
  })

  startAutoApprovalJob()
  console.log(`[server] Auto-approval job started (window: ${config.autoApproveHours}h, checked every minute)`)
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err)
  process.exit(1)
})
