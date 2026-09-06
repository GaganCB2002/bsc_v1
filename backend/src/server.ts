import cluster from 'node:cluster'
import { createApp } from './app.js'
import { config } from './config.js'
import { pingWithRetry } from './db.js'
import { startAutoApprovalJob } from './jobs/autoApproval.js'
import { initWebSocket } from './websocket.js'
import { registerGracefulShutdown } from './lib/gracefulShutdown.js'
import { isPrimary, forkWorkers, getWorkerCount } from './cluster.js'

if (isPrimary()) {
  forkWorkers()
} else {
  startWorker()
}

async function startWorker() {
  console.log(`[server] Worker ${process.pid} starting...`)
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV || 'development'}`)

  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(`[server] Worker ${process.pid} listening on port ${config.port}`)
  })

  registerGracefulShutdown(server)

  initWebSocket(server)

  console.log(`[server] Worker ${process.pid} verifying database connectivity...`)
  const dbOk = await pingWithRetry(5, 3000)
  if (!dbOk) {
    console.error(`[server] Worker ${process.pid} FATAL: Could not connect to database.`)
    server.close(() => process.exit(1))
    return
  }
  console.log(`[server] Worker ${process.pid} database connection OK`)

  startAutoApprovalJob()
  console.log(`[server] Worker ${process.pid} auto-approval job started`)
}
