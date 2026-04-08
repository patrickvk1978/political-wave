import { CHAMBERS } from '../data/chambers'
import type { ChamberWithState } from '../data/chambers'

export type { ChamberWithState }

export function useChambers() {
  return { chambers: CHAMBERS, loading: false, error: null }
}
