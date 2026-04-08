import type { Chamber, State } from '../lib/types'

export interface ChamberWithState extends Chamber {
  state: State
}

const AK: State = { id: 'ak', name: 'Alaska',     abbreviation: 'AK', sort_order: 1 }
const AZ: State = { id: 'az', name: 'Arizona',    abbreviation: 'AZ', sort_order: 2 }
const GA: State = { id: 'ga', name: 'Georgia',    abbreviation: 'GA', sort_order: 3 }
const MI: State = { id: 'mi', name: 'Michigan',   abbreviation: 'MI', sort_order: 4 }
const MN: State = { id: 'mn', name: 'Minnesota',  abbreviation: 'MN', sort_order: 5 }
const NE: State = { id: 'ne', name: 'Nebraska',   abbreviation: 'NE', sort_order: 6 }
const TX: State = { id: 'tx', name: 'Texas',      abbreviation: 'TX', sort_order: 7 }
const WI: State = { id: 'wi', name: 'Wisconsin',  abbreviation: 'WI', sort_order: 8 }

export const CHAMBERS: ChamberWithState[] = [
  {
    // AK House: 40 seats, all up each cycle. Current: R 21, D 14 (5 independent/other)
    id: 'ak-house', state: AK, name: 'House',
    total_seats: 40, majority_threshold: 21,
    current_r_seats: 21, current_d_seats: 14,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // AK Senate: 20 seats, ~10 up each cycle (staggered). Current: R 11, D 9
    id: 'ak-senate', state: AK, name: 'Senate',
    total_seats: 20, majority_threshold: 11,
    current_r_seats: 11, current_d_seats: 9,
    seats_up: 10, seats_per_district: 1, is_unicameral: false,
  },
  {
    // AZ House: 30 districts × 2 members = 60 seats. Data has 60 individual rows (one per seat).
    // seats_per_district: 1 since each JSON row represents one individual seat.
    // Current after 2024: R 33, D 27
    id: 'az-house', state: AZ, name: 'House',
    total_seats: 60, majority_threshold: 31,
    current_r_seats: 33, current_d_seats: 27,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // AZ Senate: 30 single-member districts. Current after 2024: R 17, D 13
    id: 'az-senate', state: AZ, name: 'Senate',
    total_seats: 30, majority_threshold: 16,
    current_r_seats: 17, current_d_seats: 13,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // GA Senate: 56 seats. Current: R 33, D 23
    id: 'ga-senate', state: GA, name: 'Senate',
    total_seats: 56, majority_threshold: 29,
    current_r_seats: 33, current_d_seats: 23,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // GA House: 180 seats. Current: R 100, D 80
    id: 'ga-house', state: GA, name: 'House',
    total_seats: 180, majority_threshold: 91,
    current_r_seats: 100, current_d_seats: 80,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // MI House: 110 seats. Current after 2024: R 58, D 52
    id: 'mi-house', state: MI, name: 'House',
    total_seats: 110, majority_threshold: 56,
    current_r_seats: 58, current_d_seats: 52,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // MI Senate: 38 seats. Current after 2024: D 19, R 18, 1 vacancy
    id: 'mi-senate', state: MI, name: 'Senate',
    total_seats: 38, majority_threshold: 20,
    current_r_seats: 18, current_d_seats: 19,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // MN House: 134 seats. Current after 2024: R 67, DFL 67 (tied)
    id: 'mn-house', state: MN, name: 'House',
    total_seats: 134, majority_threshold: 68,
    current_r_seats: 67, current_d_seats: 67,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // MN Senate: 67 seats. Current after 2024: DFL 34, R 33
    id: 'mn-senate', state: MN, name: 'Senate',
    total_seats: 67, majority_threshold: 34,
    current_r_seats: 33, current_d_seats: 34,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // NE Legislature: 49 seats, unicameral, officially nonpartisan.
    // Partisan lean: ~33 R-aligned, 14 D-aligned, 2 independent
    id: 'ne-legislature', state: NE, name: 'Legislature',
    total_seats: 49, majority_threshold: 25,
    current_r_seats: 33, current_d_seats: 14,
    seats_up: null, seats_per_district: 1, is_unicameral: true,
  },
  {
    // TX House: 150 seats. Current after 2024: R 88, D 62
    id: 'tx-house', state: TX, name: 'House',
    total_seats: 150, majority_threshold: 76,
    current_r_seats: 88, current_d_seats: 62,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // WI Assembly: 99 seats, all up every cycle. Current after 2024: R 54, D 45
    id: 'wi-assembly', state: WI, name: 'Assembly',
    total_seats: 99, majority_threshold: 50,
    current_r_seats: 54, current_d_seats: 45,
    seats_up: null, seats_per_district: 1, is_unicameral: false,
  },
  {
    // WI Senate: 33 seats, staggered — ~11 up per cycle. Current after 2024: R 18, D 15
    id: 'wi-senate', state: WI, name: 'Senate',
    total_seats: 33, majority_threshold: 17,
    current_r_seats: 18, current_d_seats: 15,
    seats_up: 11, seats_per_district: 1, is_unicameral: false,
  },
]

export const STATES: State[] = [...new Map(CHAMBERS.map(c => [c.state.id, c.state])).values()]
  .sort((a, b) => a.sort_order - b.sort_order)
