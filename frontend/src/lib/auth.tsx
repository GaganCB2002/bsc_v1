import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { get, post } from './api'
import type { User } from './types'

const TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours
const WARNING_MS = 5 * 60 * 1000 // Show warning 5 minutes before logout

interface AuthState {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => undefined,
  logout: async () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const refresh = useCallback(async () => {
    try {
      const data = await get<{ user: User }>('/api/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await post('/api/auth/logout')
    } catch {
      // ignore network errors on logout
    }
    setUser(null)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      lastActivityRef.current = Date.now()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)

      // Set warning timer (5 min before logout)
      warningRef.current = setTimeout(() => {
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed >= TIMEOUT_MS - WARNING_MS) {
          // Show warning banner
          const banner = document.getElementById('session-timeout-banner')
          if (banner) banner.style.display = 'block'
        }
      }, TIMEOUT_MS - WARNING_MS)

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        void logout()
        window.location.href = '/login?expired=1'
      }, TIMEOUT_MS)

      // Hide warning banner when activity resets
      const banner = document.getElementById('session-timeout-banner')
      if (banner) banner.style.display = 'none'
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    const handleActivity = () => {
      const banner = document.getElementById('session-timeout-banner')
      if (banner) banner.style.display = 'none'
      resetTimer()
    }

    events.forEach(e => document.addEventListener(e, handleActivity, { passive: true }))
    resetTimer()

    return () => {
      events.forEach(e => document.removeEventListener(e, handleActivity))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [user, logout])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function can(user: User | null, permission: string): boolean {
  if (!user) return false
  return user.roleName === 'ADMIN' || user.permissions.includes(permission)
}
