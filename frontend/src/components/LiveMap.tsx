import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapMarker {
  id: string
  name: string
  latitude: number
  longitude: number
  online?: boolean
  role?: string
  kind?: 'user' | 'office'
  address?: string | null
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0ea5e9;border:3px solid #fff;box-shadow:0 2px 6px rgba(2,132,199,.5)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
})
const ONLINE_ICON = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#16a34a;border:3px solid #fff;box-shadow:0 2px 6px rgba(22,163,74,.6)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})
const OFFICE_ICON = L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;border-radius:6px;background:#0369a1;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(3,105,161,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px">★</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

export default function LiveMap({
  markers,
  center,
  zoom = 11,
  onMarkerClick,
}: {
  markers: MapMarker[]
  center: [number, number]
  zoom?: number
  onMarkerClick?: (m: MapMarker) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    for (const m of markers) {
      if (m.latitude === null || m.longitude === null) continue
      const icon = m.kind === 'office' ? OFFICE_ICON : m.online ? ONLINE_ICON : USER_ICON
      const marker = L.marker([m.latitude, m.longitude], { icon })
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;font-size:12px">
          <b>${m.name}</b>${m.role ? ` · ${m.role}` : ''}<br/>
          <span style="color:#475569">${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}</span><br/>
          ${m.kind === 'office' ? '<span style="color:#0369a1;font-weight:600">Registered office</span>' : m.online ? '<span style="color:#16a34a;font-weight:600">● Online — GPS live</span>' : '<span style="color:#94a3b8">○ Offline</span>'}
          ${m.address ? `<br/><span style="color:#64748b">${m.address}</span>` : ''}
        </div>`
      )
      marker.on('click', () => onMarkerClick?.(m))
      layer.addLayer(marker)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers])

  return <div ref={containerRef} className="w-full h-full min-h-[420px] rounded-xl border border-border" />
}
