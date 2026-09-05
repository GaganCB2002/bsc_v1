import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveUploadDir(): string {
  if (process.env.UPLOAD_DIR) return path.resolve(__dirname, '../', process.env.UPLOAD_DIR)
  // Render's filesystem is ephemeral — use /tmp for cloud environments
  if (process.env.RENDER) return '/tmp/uploads'
  return path.resolve(__dirname, '../', 'uploads')
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/bsc_exclusive_tracking',
  // Enable SSL when connecting to Supabase / managed Postgres, or when DB_SSL=true
  dbSsl:
    process.env.DB_SSL === 'true' ||
    /(supabase|rds\.amazonaws|render\.com)/i.test(process.env.DATABASE_URL || ''),
  sessionSecret:
    process.env.SESSION_SECRET || 'bsc-exclusive-tracking-dev-secret-key-0123456789',
  cookieName: 'bsc_session',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  uploadDir: resolveUploadDir(),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  autoApproveHours: parseFloat(process.env.AUTO_APPROVE_HOURS || '1'),
  sessionTtlDays: 7,
  onlineWindowMinutes: 35,
  // Evidence storage: 'local' (disk) or 'supabase' (Supabase Storage — recommended on Render)
  fileStorageType: (process.env.FILE_STORAGE_TYPE || 'local').toLowerCase(),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'evidence',
}
