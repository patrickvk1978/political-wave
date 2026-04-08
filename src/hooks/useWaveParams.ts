import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { WaveParams } from '../lib/types'

const DEFAULTS: WaveParams = {
  wave: 0.06,
}

export function useWaveParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: WaveParams = useMemo(() => {
    const wave = parseFloat(searchParams.get('wave') ?? '')
    return {
      wave: isNaN(wave) ? DEFAULTS.wave : Math.max(0, Math.min(0.20, wave / 100)),
    }
  }, [searchParams])

  const setParams = useCallback((updates: Partial<WaveParams>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (updates.wave !== undefined) next.set('wave', String(Math.round(updates.wave * 100)))
      return next
    }, { replace: true })
  }, [setSearchParams])

  return { params, setParams, defaults: DEFAULTS }
}
