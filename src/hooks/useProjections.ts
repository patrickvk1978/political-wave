import { useMemo } from 'react'
import type { WaveParams, ChamberProjection, SummaryStats } from '../lib/types'
import { projectChamber, computeSummary } from '../lib/wave-engine'
import type { ChamberWithState } from './useChambers'
import type { District } from '../lib/types'

export function useProjections(
  chambers: ChamberWithState[],
  districts: District[],
  params: WaveParams
): { projections: ChamberProjection[]; summary: SummaryStats } {
  return useMemo(() => {
    const districtsByChamber = new Map<string, District[]>()
    for (const d of districts) {
      const arr = districtsByChamber.get(d.chamber_id) ?? []
      arr.push(d)
      districtsByChamber.set(d.chamber_id, arr)
    }

    const projections: ChamberProjection[] = chambers.map(c =>
      projectChamber(c, c.state, districtsByChamber.get(c.id) ?? [], params)
    )

    return {
      projections,
      summary: computeSummary(projections),
    }
  }, [chambers, districts, params.wave])
}
