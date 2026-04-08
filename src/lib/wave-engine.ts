import type {
  District,
  Chamber,
  State,
  WaveParams,
  DistrictClassification,
  DistrictProjection,
  ChamberProjection,
  SummaryStats,
} from './types'

// ─── Logistic win probability model ──────────────────────────────────────────

const K = 12  // slope parameter, calibrated on historical state legislative data

/** Convert adjusted margin (decimal) to D win probability via logistic function */
function logisticWinProb(margin: number): number {
  return 1 / (1 + Math.exp(-K * margin))
}

/** Classify based on win probability, not margin bands */
function classifyDistrict(winProb: number): DistrictClassification {
  if (winProb >= 0.90) return 'safe-d'
  if (winProb >= 0.60) return 'comp-d'
  if (winProb <= 0.10) return 'safe-r'
  if (winProb <= 0.40) return 'comp-r'
  return 'competitive'   // 40–60% win probability
}

// ─── Core projection logic ────────────────────────────────────────────────────

export function projectDistrict(
  district: District,
  params: WaveParams
): DistrictProjection {
  // Skip districts not up for election (staggered senates)
  if (!district.is_seat_up) {
    const margin = district.dem_median - district.gop_median
    const winProb = logisticWinProb(margin)
    return {
      district,
      adjusted_dem: district.dem_median,
      adjusted_gop: district.gop_median,
      margin,
      classification: classifyDistrict(winProb),
      projected_winner: district.incumbent_party ?? (margin >= 0 ? 'D' : 'R'),
      win_probability: margin >= 0 ? 1 : 0,  // holdovers keep their seat
    }
  }

  const adjusted_dem = district.dem_median + district.dem_incumbency_adv + params.wave
  const adjusted_gop = district.gop_median + district.gop_incumbency_adv
  const margin = adjusted_dem - adjusted_gop
  const win_probability = logisticWinProb(margin)
  const classification = classifyDistrict(win_probability)
  const projected_winner: 'D' | 'R' = win_probability >= 0.5 ? 'D' : 'R'

  return {
    district,
    adjusted_dem,
    adjusted_gop,
    margin,
    classification,
    projected_winner,
    win_probability,
  }
}

export function projectChamber(
  chamber: Chamber,
  state: State,
  districts: District[],
  params: WaveParams
): ChamberProjection {
  const projections = districts.map(d => projectDistrict(d, params))

  // Seats up for election
  const seats_up = projections.filter(p => p.district.is_seat_up)
  // Holdover seats (staggered senates — keep current holder)
  const holdovers = projections.filter(p => !p.district.is_seat_up)

  const holdover_d = holdovers.filter(p => p.district.incumbent_party === 'D').length
  const holdover_r = holdovers.filter(p => p.district.incumbent_party === 'R').length

  // Expected D wins from contested seats
  const spd = chamber.seats_per_district ?? 1
  const expected_d_wins = seats_up.reduce((sum, p) => {
    if (spd === 1) return sum + p.win_probability
    // 2-member district logic (AZ House)
    if (p.classification === 'safe-d') return sum + 2
    if (p.classification === 'comp-d') return sum + 1 + p.win_probability
    if (p.classification === 'competitive') return sum + 1   // split district
    if (p.classification === 'comp-r') return sum + (1 - p.win_probability)
    return sum  // safe-r → 0 D seats
  }, 0)
  const expected_r_wins = seats_up.length * spd - expected_d_wins

  const projected_d = Math.round(holdover_d + expected_d_wins)
  const projected_r = Math.round(holdover_r + expected_r_wins)

  const net_pickups = projected_d - chamber.current_d_seats

  // Definite flips: seats where the projected winner differs from the current holder
  const definite_r_to_d = seats_up.filter(
    p => p.district.incumbent_party === 'R' && p.projected_winner === 'D'
  ).length
  const definite_d_to_r = seats_up.filter(
    p => p.district.incumbent_party === 'D' && p.projected_winner === 'R'
  ).length

  const seats_to_flip = chamber.majority_threshold - projected_d
  const flipped = projected_d >= chamber.majority_threshold

  const competitive_count = projections.filter(p =>
    p.district.is_seat_up && (p.classification === 'competitive' || p.classification === 'comp-r')
  ).length
  const leaning_d_count = projections.filter(p =>
    p.district.is_seat_up && p.classification === 'comp-d'
  ).length

  let flip_category: ChamberProjection['flip_category']
  const abs_seats_to_flip = Math.abs(seats_to_flip)
  if (abs_seats_to_flip <= 5) flip_category = 'highly-contested'
  else if (abs_seats_to_flip <= 12) flip_category = 'within-reach'
  else flip_category = 'long-shot'

  return {
    chamber,
    state,
    districts: projections,
    current_d: chamber.current_d_seats,
    current_r: chamber.current_r_seats,
    projected_d,
    projected_r,
    net_pickups,
    definite_r_to_d,
    definite_d_to_r,
    seats_to_flip,
    flipped,
    flip_category,
    competitive_count,
    leaning_d_count,
  }
}

export function computeSummary(projections: ChamberProjection[]): SummaryStats {
  const IN_PLAY_THRESHOLD = 10
  return {
    chambers_in_play: projections.filter(p => Math.abs(p.seats_to_flip) <= IN_PLAY_THRESHOLD).length,
    expected_pickups: projections.reduce((sum, p) => sum + p.net_pickups, 0),
    chambers_flipped: projections.filter(p => p.flipped).length,
  }
}

export const CLASSIFICATION_LABELS: Record<DistrictClassification, string> = {
  'safe-d': 'Safe D',
  'comp-d': 'Lean D',
  'competitive': 'Competitive',
  'comp-r': 'Lean R',
  'safe-r': 'Safe R',
}
