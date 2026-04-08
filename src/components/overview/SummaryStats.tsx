import type { SummaryStats as Stats } from '../../lib/types'

interface Props {
  stats: Stats
}

export function SummaryStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden">
      <Stat
        value={stats.chambers_in_play}
        label="Chambers in Play"
        sublabel="within 10 seats of flipping"
      />
      <Stat
        value={stats.expected_pickups > 0 ? `+${stats.expected_pickups}` : stats.expected_pickups}
        label="Expected Pickups"
        sublabel="Democratic net gain"
        valueClass={stats.expected_pickups > 0 ? 'text-blue-700' : stats.expected_pickups < 0 ? 'text-red-600' : 'text-slate-700'}
      />
      <Stat
        value={stats.chambers_flipped}
        label="Chambers Flipped"
        sublabel="projected majority change"
        valueClass={stats.chambers_flipped > 0 ? 'text-blue-700' : 'text-slate-700'}
      />
    </div>
  )
}

function Stat({
  value,
  label,
  sublabel,
  valueClass = 'text-slate-800',
}: {
  value: number | string
  label: string
  sublabel: string
  valueClass?: string
}) {
  return (
    <div className="px-6 py-4 flex flex-col">
      <span className={`text-3xl font-bold tabular-nums ${valueClass}`}>{value}</span>
      <span className="text-sm font-medium text-slate-700 mt-0.5">{label}</span>
      <span className="text-xs text-slate-400 mt-0.5">{sublabel}</span>
    </div>
  )
}
