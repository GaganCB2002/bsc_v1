import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { post } from './api'
import { useAuth } from './auth'

// Live location tracking: reports the user's GPS coordinates every 30 minutes.
const INTERVAL_MS = 30 * 60 * 1000

interface TrackingState {
  supported: boolean
  permissionDenied: boolean
  lastSync: Date | null
  error: string | null
  syncNow: () => Promise<void>
}

const TrackingContext = createContext<TrackingState>({
  supported: false,
  permissionDenied: false,
  lastSync: null,
  error: null,
  syncNow: async () => undefined,
})

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)

  const syncNow = useCallback(async () => {
    if (inFlight.current) return
    if (!('geolocation' in navigator)) return
    inFlight.current = true
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        })
      )
      const c = pos.coords
      await post('/api/tracking', {
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        batteryLevel: null,
        address: null,
      })
      setLastSync(new Date())
      setError(null)
    } catch (e) {
      const err = e as GeolocationPositionError
      if (err && err.code === 1) setPermissionDenied(true)
      else if (err && err.message) setError('Location unavailable')
      else setError('Could not send location')
    } finally {
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    if (!user) return
    if (!user.permissions.includes('tracking:update') && user.roleName !== 'ADMIN') return
    void syncNow()
    const id = setInterval(() => void syncNow(), INTERVAL_MS)
    return () => clearInterval(id)
  }, [user, syncNow])

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  return (
    <TrackingContext.Provider value={{ supported, permissionDenied, lastSync, error, syncNow }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  return useContext(TrackingContext)
}

export const TRACKING_INTERVAL_MINUTES = 30
