import { useEffect, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { DistrictProjection } from '../../lib/types'
import type { Feature, FeatureCollection } from 'geojson'

// ─── Classification colors ────────────────────────────────────────────────────

const COLORS: Record<string, string> = {
  'safe-d':      '#1d4ed8',
  'comp-d':      '#93c5fd',
  'competitive': '#a78bfa',
  'comp-r':      '#fca5a5',
  'safe-r':      '#b91c1c',
}

const LABELS: Record<string, string> = {
  'safe-d':      'Safe D',
  'comp-d':      'Likely D',
  'competitive': 'Toss-up',
  'comp-r':      'Likely R',
  'safe-r':      'Safe R',
}

function getColor(cls: string | undefined): string {
  return COLORS[cls ?? ''] ?? '#cbd5e1'
}

// ─── Hardcoded fallback bounds for antimeridian-crossing states ───────────────
// Alaska GeoJSON wraps across ±180°, so computed bounds are unreliable

const CHAMBER_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  'ak-house':  [[54.5, -168], [71.5, -130]],
  'ak-senate': [[54.5, -168], [71.5, -130]],
}

// ─── Map bounds fitter ────────────────────────────────────────────────────────

function FitBounds({ chamberId, data }: { chamberId: string; data: FeatureCollection }) {
  const map = useMap()
  useEffect(() => {
    const hardcoded = CHAMBER_BOUNDS[chamberId]
    if (hardcoded) {
      map.fitBounds(hardcoded, { padding: [20, 20] })
      return
    }
    try {
      const layer = L.geoJSON(data as Parameters<typeof L.geoJSON>[0])
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    } catch {
      // ignore invalid bounds
    }
  }, [chamberId, data, map])
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ChamberMapProps {
  chamberId: string
  districts: DistrictProjection[]
  height?: number
}

export function ChamberMap({ chamberId, districts, height = 520 }: ChamberMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Build lookup: district_number → projection
  const projMap = useMemo(() => {
    const m = new Map<string, DistrictProjection>()
    districts.forEach(d => m.set(d.district.district_number, d))
    return m
  }, [districts])

  // Load GeoJSON lazily when chamber changes
  useEffect(() => {
    setLoading(true)
    setError(false)
    setGeoData(null)
    const filename = chamberId.replace(/-/g, '_') + '_districts.geojson'
    fetch(`/geodata/${filename}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FeatureCollection>
      })
      .then(data => {
        setGeoData(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [chamberId])

  // Style function — re-runs when wave params change via projMap dependency
  const getStyle = useCallback(
    (feature?: Feature) => {
      const dn = String((feature?.properties as Record<string, unknown>)?.district_number ?? '')
      const proj = projMap.get(dn)
      return {
        fillColor: getColor(proj?.classification),
        fillOpacity: 0.75,
        color: '#ffffff',
        weight: 0.8,
      }
    },
    [projMap],
  )

  // Tooltip on hover
  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const dn = String((feature?.properties as Record<string, unknown>)?.district_number ?? '')
      const proj = projMap.get(dn)
      if (!proj) return
      const winPct  = (proj.win_probability * 100).toFixed(0)
      const dVote   = (proj.adjusted_dem * 100).toFixed(1)
      const label   = LABELS[proj.classification] ?? '—'
      const path = layer as L.Path
      path.bindTooltip(
        `<div style="font-family:inherit;font-size:12px;min-width:148px">
          <div style="font-weight:600;color:#1e293b;font-size:13px;margin-bottom:5px">District ${dn}</div>
          <div style="color:#475569;margin-bottom:2px">${label}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;color:#64748b;margin-top:3px">
            <span>D Win Prob</span><strong style="color:#1e293b">${winPct}%</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;color:#64748b;margin-top:2px">
            <span>D Vote Share</span><strong style="color:#1e293b">${dVote}%</strong>
          </div>
        </div>`,
        { sticky: true, opacity: 1 },
      )
      path.on('mouseover', () => path.setStyle({ fillOpacity: 0.95, weight: 1.5 }))
      path.on('mouseout',  () => path.setStyle({ fillOpacity: 0.75, weight: 0.8 }))
    },
    [projMap],
  )

  if (loading) {
    return (
      <div
        className="bg-slate-100 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-slate-400 animate-pulse">Loading map…</p>
      </div>
    )
  }

  if (error || !geoData) {
    return (
      <div
        className="bg-slate-100 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-slate-400">Map unavailable for this chamber</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={[39, -98]}
        zoom={5}
        style={{ height, width: '100%' }}
        zoomControl
        scrollWheelZoom={false}
        attributionControl={false}
      >
        {/* Clean minimal base tiles — no API key needed */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />

        {/* District polygons — key forces remount when chamber changes */}
        <GeoJSON
          key={chamberId + '-' + districts.length}
          data={geoData as Parameters<typeof GeoJSON>[0]['data']}
          style={getStyle}
          onEachFeature={onEachFeature}
        />

        {/* Auto-fit to state boundaries */}
        <FitBounds chamberId={chamberId} data={geoData} />
      </MapContainer>

      {/* Legend — positioned over map bottom-left */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-3 py-2.5 text-xs space-y-1.5">
        {Object.entries(LABELS).map(([cls, label]) => (
          <div key={cls} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[cls] }}
            />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 bg-slate-300" />
          <span className="text-slate-400">No data</span>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-2 z-[1000] text-[10px] text-slate-400">
        © CARTO · Census TIGER
      </div>
    </div>
  )
}
