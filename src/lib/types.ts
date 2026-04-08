// ─── Database types ───────────────────────────────────────────────────────────

export interface State {
  id: string
  name: string
  abbreviation: string
  sort_order: number
}

export interface Chamber {
  id: string
  state_id?: string   // optional — not used with static data
  name: string           // "House", "Senate", "Legislature"
  total_seats: number
  majority_threshold: number
  current_r_seats: number
  current_d_seats: number
  seats_up: number | null      // null = all seats up; integer = staggered senate
  seats_per_district: number   // 1 for most chambers; 2 for AZ House multi-member districts
  is_unicameral: boolean
  // joined
  state?: State
}

export interface District {
  id: string
  chamber_id: string
  district_number: string   // e.g. "1", "HD-45", "A"
  incumbent_party: 'R' | 'D' | null   // null = open seat
  is_open_seat: boolean
  dem_median: number        // 0–1
  gop_median: number        // 0–1
  dem_incumbency_adv: number // 0–0.025, default 0
  gop_incumbency_adv: number // 0–0.025, default 0
  is_seat_up: boolean       // false for staggered seats not up in 2026
  notes: string | null
}

// ─── Wave engine types ────────────────────────────────────────────────────────

export type DistrictClassification = 'safe-r' | 'comp-r' | 'competitive' | 'comp-d' | 'safe-d'

export interface DistrictProjection {
  district: District
  adjusted_dem: number       // dem_median + incumbency + wave
  adjusted_gop: number       // gop_median + incumbency (no wave benefit)
  margin: number             // adjusted_dem - adjusted_gop (positive = D ahead)
  classification: DistrictClassification
  projected_winner: 'D' | 'R'
  win_probability: number    // D's probability of winning (0–1)
}

export interface ChamberProjection {
  chamber: Chamber
  state: State
  districts: DistrictProjection[]
  current_d: number
  current_r: number
  projected_d: number
  projected_r: number
  net_pickups: number        // positive = D gains
  seats_to_flip: number      // how many more D needs for majority
  flipped: boolean
  flip_category: 'highly-contested' | 'within-reach' | 'long-shot'
  competitive_count: number
  leaning_d_count: number
}

export interface SummaryStats {
  chambers_in_play: number   // within 10 seats of flipping
  expected_pickups: number   // sum of net_pickups across all chambers
  chambers_flipped: number
}

// ─── Wave params ─────────────────────────────────────────────────────────────

export interface WaveParams {
  wave: number           // 0–0.20 (decimal), e.g. 0.06 = 6%
}
