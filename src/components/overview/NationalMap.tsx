import { useState, useMemo } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-simple-maps has no bundled types
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { ChamberProjection } from '../../lib/types'

const GEO_URL = '/geodata/us-states-10m.json'

// States tracked in this tool
const TARGET_STATES = new Set(['AK', 'AZ', 'GA', 'MI', 'MN', 'NE', 'TX', 'WI'])

// FIPS → state abbreviation (all 50 + DC)
const FIPS: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY',
}

type ChamberView = 'house' | 'senate'

// Classify chamber name into house or senate bucket
function chamberBucket(name: string): ChamberView {
  return name.toLowerCase().includes('senate') ? 'senate' : 'house'
}

// Fill color for a target state based on its projection
function stateColor(proj: ChamberProjection | undefined): string {
  if (!proj) return '#e2e8f0'
  if (proj.flipped) return '#1d4ed8'
  switch (proj.flip_category) {
    case 'highly-contested': return '#7c3aed'
    case 'within-reach':     return '#a78bfa'
    case 'long-shot':        return '#cbd5e1'
    default:                 return '#e2e8f0'
  }
}

const LEGEND = [
  { color: '#1d4ed8', label: 'Flips D' },
  { color: '#7c3aed', label: 'Highly Contested' },
  { color: '#a78bfa', label: 'Within Reach' },
  { color: '#cbd5e1', label: 'Long Shot' },
]

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function statusLabel(proj: ChamberProjection): string {
  if (proj.flipped) return `Flips D (+${proj.net_pickups})`
  if (proj.net_pickups > 0) return `D +${proj.net_pickups} — ${proj.seats_to_flip} short`
  return 'No net pickups'
}

// ─── Component ───────────────────────────────────────────────────────────────

interface NationalMapProps {
  projections: ChamberProjection[]
  onStateSelect: (abbr: string) => void
}

export function NationalMap({ projections, onStateSelect }: NationalMapProps) {
  const [chamberView, setChamberView] = useState<ChamberView>('house')
  const [tooltip, setTooltip] = useState<{ abbr: string; x: number; y: number } | null>(null)

  // Build state → best-matching projection map
  const stateProj = useMemo(() => {
    const map = new Map<string, ChamberProjection>()
    // First pass: exact chamber bucket match
    for (const p of projections) {
      if (chamberBucket(p.chamber.name) === chamberView) {
        map.set(p.state.abbreviation, p)
      }
    }
    // Second pass: fallback for states with only one chamber type (TX, NE)
    for (const p of projections) {
      if (!map.has(p.state.abbreviation)) {
        map.set(p.state.abbreviation, p)
      }
    }
    return map
  }, [projections, chamberView])

  const hoveredProj = tooltip ? stateProj.get(tooltip.abbr) : undefined

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Chamber:</span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
            {(['house', 'senate'] as ChamberView[]).map(v => (
              <button
                key={v}
                onClick={() => setChamberView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  chamberView === v
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'house' ? 'House / Assembly' : 'Senate'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">Click a state to view districts</p>
      </div>

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-[#f8fafc]">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const fips = String(geo.id).padStart(2, '0')
                const abbr = FIPS[fips]
                const isTarget = TARGET_STATES.has(abbr)
                const proj   = stateProj.get(abbr)
                const fill   = isTarget ? stateColor(proj) : '#dde1e7'
                const isHovered = tooltip?.abbr === abbr

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={isTarget ? 0.8 : 0.4}
                    style={{
                      default: { outline: 'none', opacity: 1, cursor: isTarget ? 'pointer' : 'default' },
                      hover:   { outline: 'none', opacity: isTarget ? 0.85 : 1 },
                      pressed: { outline: 'none' },
                    }}
                    fillOpacity={isHovered ? 0.82 : 1}
                    onClick={() => {
                      if (isTarget && abbr) onStateSelect(abbr)
                    }}
                    onMouseEnter={(evt: React.MouseEvent) => {
                      if (isTarget && abbr) {
                        setTooltip({ abbr, x: evt.clientX, y: evt.clientY })
                      }
                    }}
                    onMouseMove={(evt: React.MouseEvent) => {
                      if (isTarget && abbr) {
                        setTooltip({ abbr, x: evt.clientX, y: evt.clientY })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Floating tooltip */}
        {tooltip && hoveredProj && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
          >
            <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5 text-xs min-w-[160px]">
              <div className="font-semibold text-slate-800 text-sm mb-1">
                {hoveredProj.state.name}
              </div>
              <div className="text-slate-500 mb-1">{hoveredProj.chamber.name}</div>
              <div
                className="font-medium"
                style={{ color: hoveredProj.flipped ? '#1d4ed8' : hoveredProj.flip_category === 'highly-contested' ? '#7c3aed' : '#64748b' }}
              >
                {statusLabel(hoveredProj)}
              </div>
              <div className="text-slate-400 mt-1">
                {hoveredProj.competitive_count} comp · {hoveredProj.leaning_d_count} lean D
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 bg-[#dde1e7]" />
          Not tracked
        </div>
      </div>
    </div>
  )
}
