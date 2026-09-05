import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { post } from './api'
import { useAuth } from './auth'

const INTERVAL_MS = 30 * 60 * 1000

interface TrackingState {
  supported: boolean
  permissionDenied: boolean
  permissionStatus: string
  lastSync: Date | null
  error: string | null
  syncing: boolean
  syncNow: () => Promise<void>
}

const TrackingContext = createContext<TrackingState>({
  supported: false,
  permissionDenied: false,
  permissionStatus: 'unknown',
  lastSync: null,
  error: null,
  syncing: false,
  syncNow: async () => undefined,
})

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const inFlight = useRef(false)
  const mounted = useRef(true)

  const syncNow = useCallback(async () => {
    if (inFlight.current) return
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser')
      return
    }

    inFlight.current = true
    setSyncing(true)
    setError(null)

    try {
      // First check permission status
      if ('permissions' in navigator) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionStatus(status.state)
          if (status.state === 'denied') {
            setPermissionDenied(true)
            setError('Location permission denied. Please enable it in your browser settings.')
            return
          }
          status.onchange = () => {
            setPermissionStatus(status.state)
            if (status.state === 'denied') setPermissionDenied(true)
          }
        } catch {
          // permissions API not supported, proceed anyway
        }
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 120000,
        })
      )

      let batteryLevel: number | null = null
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery()
          if (battery && typeof battery.level === 'number') {
            batteryLevel = Math.round(battery.level * 100)
          }
        } catch {
          // getBattery not supported or denied
        }
      }

      const c = pos.coords
      await post('/api/tracking', {
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        batteryLevel,
        address: null,
      })

      if (mounted.current) {
        setLastSync(new Date())
        setError(null)
        setPermissionDenied(false)
        setPermissionStatus('granted')
      }
    } catch (e) {
      if (!mounted.current) return
      const err = e as GeolocationPositionError
      if (err?.code === 1) {
        setPermissionDenied(true)
        setPermissionStatus('denied')
        setError('Location access denied. Please allow location in your browser settings and refresh.')
      } else if (err?.code === 2) {
        setError('Location unavailable. Check your device GPS or try again.')
      } else if (err?.code === 3) {
        setError('Location request timed out. Please try again.')
      } else {
        setError('Could not get your location. Please try again.')
      }
    } finally {
      if (mounted.current) setSyncing(false)
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
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
    <TrackingContext.Provider value={{ supported, permissionDenied, permissionStatus, lastSync, error, syncing, syncNow }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  return useContext(TrackingContext)
}

export const TRACKING_INTERVAL_MINUTES = 30
