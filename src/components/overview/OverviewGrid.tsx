import type { ChamberProjection } from '../../lib/types'
import { ChamberCard } from './ChamberCard'

interface Props {
  projections: ChamberProjection[]
  onChamberSelect: (chamberId: string) => void
}

const CATEGORY_ORDER = ['highly-contested', 'within-reach', 'long-shot'] as const
const CATEGORY_LABELS = {
  'highly-contested': 'Highly Contested',
  'within-reach': 'Within Reach',
  'long-shot': 'Long Shots',
} as const

export function OverviewGrid({ projections, onChamberSelect }: Props) {
  if (projections.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-lg">No chambers to display.</p>
        <p className="text-sm mt-1">Select a state or adjust parameters.</p>
      </div>
    )
  }

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = projections.filter(p => p.flip_category === cat)
    return acc
  }, {} as Record<typeof CATEGORY_ORDER[number], ChamberProjection[]>)

  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map(cat => {
        const group = grouped[cat]
        if (group.length === 0) return null
        return (
          <section key={cat}>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              {CATEGORY_LABELS[cat]}
              <span className="text-slate-300">({group.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.map(p => (
                <ChamberCard
                  key={p.chamber.id}
                  projection={p}
                  onClick={() => onChamberSelect(p.chamber.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
