export interface ApiError extends Error {
  status?: number
  code?: string
}

// When the frontend is deployed separately (Vercel/Netlify), set
// VITE_API_URL to the backend URL, e.g. https://my-api.onrender.com
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const apiUrl = (path: string): string => `${API_BASE}${path}`

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    headers:
      options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
        : options.headers,
    ...options,
  })
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const err: ApiError = new Error(
      (typeof body === 'object' && body && typeof (body as { message?: string }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`) || `Request failed (${res.status})`
    )
    err.status = res.status
    if (typeof body === 'object' && body) err.code = (body as { code?: string }).code
    throw err
  }
  return (typeof body === 'object' && body && (body as { data?: unknown }).data !== undefined
    ? (body as { data: T }).data
    : (body as T)) as T
}

export const get = <T = unknown>(path: string) => api<T>(path)
export const post = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
export const put = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) })
export const patch = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) })
export const del = <T = unknown>(path: string) => api<T>(path, { method: 'DELETE' })
