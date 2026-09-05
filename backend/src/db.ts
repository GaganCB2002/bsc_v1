import pg from 'pg'
import { config } from './config.js'

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: config.dbSsl ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message)
})

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as never[])
}

export async function ping(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch (err: any) {
    console.error('[db] Health ping failed:', err?.message || err)
    return false
  }
}

export async function pingWithRetry(retries = 5, delayMs = 3000): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1')
      return true
    } catch (err: any) {
      console.error(`[db] Connection attempt ${attempt}/${retries} failed:`, err?.message || err)
      if (attempt < retries) {
        console.log(`[db] Retrying in ${delayMs / 1000}s...`)
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }
  return false
}
