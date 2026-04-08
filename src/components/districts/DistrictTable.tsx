import { useState } from 'react'
import type { DistrictProjection, DistrictClassification } from '../../lib/types'
import { CLASSIFICATION_LABELS } from '../../lib/wave-engine'

const CLASS_STYLES: Record<DistrictClassification, string> = {
  'safe-d': 'bg-blue-50 text-blue-800',
  'comp-d': 'bg-blue-100 text-blue-700',
  'competitive': 'bg-amber-50 text-amber-700',
  'comp-r': 'bg-red-100 text-red-600',
  'safe-r': 'bg-red-50 text-red-700',
}

type SortKey = 'district_number' | 'margin' | 'classification' | 'incumbent_party'
type SortDir = 'asc' | 'desc'

interface Props {
  districts: DistrictProjection[]
  chamberName: string
  stateName: string
}

export function DistrictTable({ districts, chamberName, stateName }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('margin')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...districts].sort((a, b) => {
    let av: string | number, bv: string | number
    switch (sortKey) {
      case 'district_number': {
        const an = parseInt(a.district.district_number), bn = parseInt(b.district.district_number)
        av = isNaN(an) ? a.district.district_number : an
        bv = isNaN(bn) ? b.district.district_number : bn
        break
      }
      case 'margin': av = a.margin; bv = b.margin; break
      case 'classification': av = a.classification; bv = b.classification; break
      case 'incumbent_party': av = a.district.incumbent_party ?? ''; bv = b.district.incumbent_party ?? ''; break
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return av < bv ? -dir : av > bv ? dir : 0
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const marginDisplay = (v: number) => {
    const p = Math.round(v * 100)
    return p > 0 ? `D+${p}` : p < 0 ? `R+${Math.abs(p)}` : 'Even'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">{stateName} {chamberName}</h3>
        <span className="text-xs text-slate-400">{districts.length} districts</span>
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <Th onClick={() => handleSort('district_number')}>
                District <SortIcon col="district_number" />
              </Th>
              <Th onClick={() => handleSort('incumbent_party')}>
                Held by <SortIcon col="incumbent_party" />
              </Th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Baseline
              </th>
              <Th onClick={() => handleSort('margin')}>
                Margin <SortIcon col="margin" />
              </Th>
              <Th onClick={() => handleSort('classification')}>
                Category <SortIcon col="classification" />
              </Th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Projected
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(dp => {
              const { district: d } = dp
              const baseMargin = d.dem_median - d.gop_median
              return (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-xs font-medium text-slate-700">
                    {d.district_number}
                  </td>
                  <td className="px-3 py-2.5">
                    {d.is_open_seat ? (
                      <span className="text-xs text-slate-400 italic">Open</span>
                    ) : (
                      <span className={`text-xs font-semibold ${d.incumbent_party === 'D' ? 'text-blue-700' : 'text-red-600'}`}>
                        {d.incumbent_party}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 tabular-nums">
                    {marginDisplay(baseMargin)}
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">
                    <span className={dp.margin >= 0 ? 'text-blue-700' : 'text-red-600'}>
                      {marginDisplay(dp.margin)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${CLASS_STYLES[dp.classification]}`}>
                      {CLASSIFICATION_LABELS[dp.classification]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold ${dp.projected_winner === 'D' ? 'text-blue-700' : 'text-red-600'}`}>
                      {dp.projected_winner}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <th
      onClick={onClick}
      className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 select-none"
    >
      {children}
    </th>
  )
}
