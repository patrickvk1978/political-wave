import type { ChamberProjection } from '../../lib/types'

const CATEGORY_STYLES = {
  'highly-contested': {
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-red-300',
    label: 'Highly Contested',
  },
  'within-reach': {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    border: 'border-amber-300',
    label: 'Within Reach',
  },
  'long-shot': {
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    border: 'border-slate-200',
    label: 'Long Shot',
  },
} as const

interface Props {
  projection: ChamberProjection
  onClick?: () => void
}

export function ChamberCard({ projection, onClick }: Props) {
  const { chamber, state, flip_category, flipped } = projection
  const style = CATEGORY_STYLES[flip_category]

  const totalSeats = projection.projected_d + projection.projected_r
  const dPct = totalSeats > 0 ? (projection.projected_d / totalSeats) * 100 : 50
  const majorityPct = (chamber.majority_threshold / (chamber.current_d_seats + chamber.current_r_seats)) * 100

  const pickupDisplay = projection.net_pickups > 0
    ? `+${projection.net_pickups}`
    : String(projection.net_pickups)

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${style.border} ${flipped ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{state.abbreviation}</p>
          <h3 className="text-base font-bold text-slate-800 leading-tight">{state.name} {chamber.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}>
            {style.label}
          </span>
          {flipped && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
              Flipped!
            </span>
          )}
        </div>
      </div>

      {/* Seat bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>D {projection.projected_d}</span>
          <span className="text-slate-400 font-medium">
            {Math.abs(projection.seats_to_flip)} {projection.seats_to_flip > 0 ? 'needed' : 'over majority'}
          </span>
          <span>R {projection.projected_r}</span>
        </div>
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${dPct}%` }}
          />
          {/* Majority line */}
          <div
            className="absolute top-0 h-full w-px bg-slate-500 opacity-60"
            style={{ left: `${majorityPct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs">
          <span className="text-slate-500">
            <span className="font-semibold text-slate-700">{projection.competitive_count}</span> comp
          </span>
          <span className="text-slate-500">
            <span className="font-semibold text-slate-700">{projection.leaning_d_count}</span> lean D
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className={`text-sm font-bold tabular-nums ${
            projection.net_pickups > 0 ? 'text-blue-700' : projection.net_pickups < 0 ? 'text-red-600' : 'text-slate-500'
          }`}>
            {pickupDisplay} exp
          </div>
          {(projection.definite_r_to_d > 0 || projection.definite_d_to_r > 0) && (
            <div className="text-[10px] text-slate-400 tabular-nums">
              {projection.definite_r_to_d > 0 && (
                <span className="text-blue-500">+{projection.definite_r_to_d}</span>
              )}
              {projection.definite_r_to_d > 0 && projection.definite_d_to_r > 0 && (
                <span className="mx-0.5">/</span>
              )}
              {projection.definite_d_to_r > 0 && (
                <span className="text-red-400">−{projection.definite_d_to_r}</span>
              )}
              <span className="ml-0.5">flips</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
