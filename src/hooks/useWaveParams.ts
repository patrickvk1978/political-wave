import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { WaveParams } from '../lib/types'

const DEFAULTS: WaveParams = {
  wave: 0.06,
  win_probability: 0.5,
  competitive_range: 0.08,
}

export function useWaveParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: WaveParams = useMemo(() => {
    const wave = parseFloat(searchParams.get('wave') ?? '')
    const prob = parseFloat(searchParams.get('prob') ?? '')
    const range = parseFloat(searchParams.get('range') ?? '')
    return {
      wave: isNaN(wave) ? DEFAULTS.wave : Math.max(0, Math.min(0.20, wave / 100)),
      win_probability: isNaN(prob) ? DEFAULTS.win_probability : Math.max(0, Math.min(1, prob / 100)),
      competitive_range: isNaN(range) ? DEFAULTS.competitive_range : Math.max(0, Math.min(0.20, range / 100)),
    }
  }, [searchParams])

  const setParams = useCallback((updates: Partial<WaveParams>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (updates.wave !== undefined) next.set('wave', String(Math.round(updates.wave * 100)))
      if (updates.win_probability !== undefined) next.set('prob', String(Math.round(updates.win_probability * 100)))
      if (updates.competitive_range !== undefined) next.set('range', String(Math.round(updates.competitive_range * 100)))
      return next
    }, { replace: true })
  }, [setSearchParams])

  return { params, setParams, defaults: DEFAULTS }
}
