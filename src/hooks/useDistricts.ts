import { useMemo } from 'react'
import { ALL_DISTRICTS } from '../data/districts/index'
import type { District } from '../lib/types'

export function useDistricts(chamberIds: string[]) {
  const districts = useMemo<District[]>(() => {
    if (chamberIds.length === 0) return []
    const idSet = new Set(chamberIds)
    return ALL_DISTRICTS.filter(d => idSet.has(d.chamber_id))
  }, [chamberIds.join(',')])

  return { districts, loading: false, error: null }
}
