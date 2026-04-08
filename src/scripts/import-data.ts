/**
 * Import district data from XLSX files into Supabase.
 *
 * Usage:
 *   npx tsx src/scripts/import-data.ts
 *
 * Requires .env.local with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import * as ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Use service role key to bypass RLS for imports
const supabase = createClient(supabaseUrl, serviceRoleKey)

// ─── Data root (one level up from app/) ──────────────────────────────────────
const DATA_DIR = path.resolve(__dirname, '../../../')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFloat0(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function normalizeParty(val: unknown): 'R' | 'D' | null {
  if (!val) return null
  const s = String(val).trim().toUpperCase()
  if (s === 'R' || s === 'REP' || s === 'REPUBLICAN' || s === 'GOP') return 'R'
  if (s === 'D' || s === 'DEM' || s === 'DEMOCRAT' || s === 'DEMOCRATIC' || s === 'DFL') return 'D'
  return null
}

function normalizeYN(val: unknown): boolean {
  if (!val) return false
  return String(val).trim().toUpperCase() === 'Y'
}

async function getChamber(stateAbbr: string, chamberName: string): Promise<string> {
  const { data, error } = await supabase
    .from('chambers')
    .select('id, state_id, states!inner(abbreviation)')
    .eq('name', chamberName)
    .eq('states.abbreviation', stateAbbr)
    .single()
  if (error || !data) throw new Error(`Chamber not found: ${stateAbbr} ${chamberName} — ${error?.message}`)
  return data.id
}

async function upsertDistricts(_chamberId: string, rows: object[]) {
  const { error } = await supabase
    .from('districts')
    .upsert(rows, { onConflict: 'chamber_id,district_number' })
  if (error) throw new Error(`Upsert error: ${error.message}`)
  console.log(`  ✓ Upserted ${rows.length} districts`)
}

async function readSheet(file: string, sheetIndex = 0): Promise<ExcelJS.Row[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path.join(DATA_DIR, file))
  const ws = wb.worksheets[sheetIndex]
  const rows: ExcelJS.Row[] = []
  ws.eachRow((row, idx) => { if (idx > 1) rows.push(row) }) // skip header
  return rows
}

// ─── State importers ──────────────────────────────────────────────────────────

/**
 * GA / TX format:
 * Col 1: district number
 * Col 2: party held
 * Col 3: dem_median
 * Col 4: gop_median
 * Col 5: dem_incumbency_adv
 * Col 6: gop_incumbency_adv
 * (cols 7-11: COH, wave %, finals — skipped for Phase 1)
 */
async function importFullModel(file: string, stateAbbr: string, chamberName: string) {
  console.log(`Importing ${stateAbbr} ${chamberName} from ${file}…`)
  const chamberId = await getChamber(stateAbbr, chamberName)
  const rows = await readSheet(file)
  const districts = rows
    .filter(row => row.getCell(1).value !== null)
    .map(row => {
      const party = normalizeParty(row.getCell(2).value)
      const demMedian = parseFloat0(row.getCell(3).value)
      const gopMedian = parseFloat0(row.getCell(4).value)
      const demInc = parseFloat0(row.getCell(5).value)
      const gopInc = parseFloat0(row.getCell(6).value)
      return {
        chamber_id: chamberId,
        district_number: String(row.getCell(1).value).trim(),
        incumbent_party: party,
        is_open_seat: party === null,
        dem_median: demMedian,
        gop_median: gopMedian,
        dem_incumbency_adv: demInc,
        gop_incumbency_adv: gopInc,
        is_seat_up: true,
      }
    })
  await upsertDistricts(chamberId, districts)
}

/**
 * AK / WI format:
 * Col 1: district (AK=letter, WI=number)
 * Col 2: party
 * Col 3: up_in_26 (Y/N)
 * Col 4: dem_median
 * Col 5: gop_median
 */
async function importWithUpFlag(file: string, stateAbbr: string, chamberName: string) {
  console.log(`Importing ${stateAbbr} ${chamberName} from ${file}…`)
  const chamberId = await getChamber(stateAbbr, chamberName)
  const rows = await readSheet(file)
  const districts = rows
    .filter(row => row.getCell(1).value !== null)
    .map(row => {
      const party = normalizeParty(row.getCell(2).value)
      const isUp = normalizeYN(row.getCell(3).value)
      return {
        chamber_id: chamberId,
        district_number: String(row.getCell(1).value).trim(),
        incumbent_party: party,
        is_open_seat: party === null,
        dem_median: parseFloat0(row.getCell(4).value),
        gop_median: parseFloat0(row.getCell(5).value),
        dem_incumbency_adv: 0,
        gop_incumbency_adv: 0,
        is_seat_up: isUp,
      }
    })
  await upsertDistricts(chamberId, districts)
}

/**
 * AZ / MN format:
 * Col 1: district
 * Col 2: party
 * Col 3: (empty or gap)
 * Col 4: dem_median
 * Col 5: gop_median
 */
async function importSimple(file: string, stateAbbr: string, chamberName: string, demCol = 3, gopCol = 4, partyCol = 2) {
  console.log(`Importing ${stateAbbr} ${chamberName} from ${file}…`)
  const chamberId = await getChamber(stateAbbr, chamberName)
  const rows = await readSheet(file)
  const districts = rows
    .filter(row => row.getCell(1).value !== null)
    .map(row => {
      const party = normalizeParty(row.getCell(partyCol).value)
      return {
        chamber_id: chamberId,
        district_number: String(row.getCell(1).value).trim(),
        incumbent_party: party,
        is_open_seat: party === null,
        dem_median: parseFloat0(row.getCell(demCol).value),
        gop_median: parseFloat0(row.getCell(gopCol).value),
        dem_incumbency_adv: 0,
        gop_incumbency_adv: 0,
        is_seat_up: true,
      }
    })
  await upsertDistricts(chamberId, districts)
}

/**
 * Michigan format:
 * Col 1: district, Col 2: party
 * Col 5: dem_gov22, Col 6: gop_gov22, Col 7: dem_pres20, Col 8: gop_pres20
 * Median = average of Gov22 and Pres20 results
 */
async function importMichigan(file: string, stateAbbr: string, chamberName: string) {
  console.log(`Importing ${stateAbbr} ${chamberName} from ${file}…`)
  const chamberId = await getChamber(stateAbbr, chamberName)
  const rows = await readSheet(file)
  const districts = rows
    .filter(row => row.getCell(1).value !== null)
    .map(row => {
      const party = normalizeParty(row.getCell(2).value)
      const demGov22 = parseFloat0(row.getCell(5).value)
      const gopGov22 = parseFloat0(row.getCell(6).value)
      const demPres20 = parseFloat0(row.getCell(7).value)
      const gopPres20 = parseFloat0(row.getCell(8).value)
      const demMedian = (demGov22 + demPres20) / 2
      const gopMedian = (gopGov22 + gopPres20) / 2
      return {
        chamber_id: chamberId,
        district_number: String(row.getCell(1).value).trim(),
        incumbent_party: party,
        is_open_seat: party === null,
        dem_median: demMedian,
        gop_median: gopMedian,
        dem_incumbency_adv: 0,
        gop_incumbency_adv: 0,
        is_seat_up: true,
      }
    })
  await upsertDistricts(chamberId, districts)
}

/**
 * Nebraska format:
 * Col 1: district (no party data — unicameral, officially nonpartisan)
 * Col 4: dem_pres24, Col 5: gop_pres24, Col 6: dem_pres20, Col 7: gop_pres20
 * Median = average of Pres24 and Pres20
 * Note: party data must be added manually after import
 */
async function importNebraska(file: string) {
  console.log(`Importing NE Legislature from ${file}…`)
  const chamberId = await getChamber('NE', 'Legislature')
  const rows = await readSheet(file)
  const districts = rows
    .filter(row => row.getCell(1).value !== null)
    .map(row => {
      const demPres24 = parseFloat0(row.getCell(4).value)
      const gopPres24 = parseFloat0(row.getCell(5).value)
      const demPres20 = parseFloat0(row.getCell(6).value)
      const gopPres20 = parseFloat0(row.getCell(7).value)
      const demMedian = (demPres24 + demPres20) / 2
      const gopMedian = (gopPres24 + gopPres20) / 2
      return {
        chamber_id: chamberId,
        district_number: String(row.getCell(1).value).trim(),
        incumbent_party: null,   // NE is officially nonpartisan — update manually
        is_open_seat: false,
        dem_median: demMedian,
        gop_median: gopMedian,
        dem_incumbency_adv: 0,
        gop_incumbency_adv: 0,
        is_seat_up: true,
      }
    })
  await upsertDistricts(chamberId, districts)
}

// ─── Seed chambers (run once before importing districts) ─────────────────────

async function seedChambers() {
  console.log('Seeding chambers…')

  // Fetch state IDs
  const { data: states } = await supabase.from('states').select('id, abbreviation')
  const stateId = (abbr: string) => states!.find(s => s.abbreviation === abbr)!.id

  const chambers = [
    // AK Senate (20 seats, staggered — only ~10 up per cycle)
    { state_id: stateId('AK'), name: 'Senate', total_seats: 20, majority_threshold: 11, current_r_seats: 13, current_d_seats: 7,  seats_up: 10, is_unicameral: false },
    // AZ House (30 districts × 2 members = 60 seats)
    { state_id: stateId('AZ'), name: 'House',  total_seats: 60, majority_threshold: 31, current_r_seats: 33, current_d_seats: 27, seats_up: null, is_unicameral: false },
    // AZ Senate
    { state_id: stateId('AZ'), name: 'Senate', total_seats: 30, majority_threshold: 16, current_r_seats: 16, current_d_seats: 14, seats_up: null, is_unicameral: false },
    // GA House
    { state_id: stateId('GA'), name: 'House',  total_seats: 180, majority_threshold: 91, current_r_seats: 100, current_d_seats: 80, seats_up: null, is_unicameral: false },
    // GA Senate
    { state_id: stateId('GA'), name: 'Senate', total_seats: 56, majority_threshold: 29, current_r_seats: 33, current_d_seats: 23, seats_up: null, is_unicameral: false },
    // MI House (all 110 seats up each cycle)
    { state_id: stateId('MI'), name: 'House',  total_seats: 110, majority_threshold: 56, current_r_seats: 58, current_d_seats: 52, seats_up: null, is_unicameral: false },
    // MN House (134 seats)
    { state_id: stateId('MN'), name: 'House',  total_seats: 134, majority_threshold: 68, current_r_seats: 71, current_d_seats: 63, seats_up: null, is_unicameral: false },
    // MN Senate (67 seats, staggered)
    { state_id: stateId('MN'), name: 'Senate', total_seats: 67,  majority_threshold: 34, current_r_seats: 34, current_d_seats: 33, seats_up: null, is_unicameral: false },
    // NE Legislature (49 seats, unicameral, officially nonpartisan)
    { state_id: stateId('NE'), name: 'Legislature', total_seats: 49, majority_threshold: 25, current_r_seats: 33, current_d_seats: 16, seats_up: null, is_unicameral: true },
    // TX House (150 seats)
    { state_id: stateId('TX'), name: 'House',  total_seats: 150, majority_threshold: 76, current_r_seats: 88, current_d_seats: 62, seats_up: null, is_unicameral: false },
    // WI Senate (33 seats, staggered — ~11 up per cycle)
    { state_id: stateId('WI'), name: 'Senate', total_seats: 33, majority_threshold: 17, current_r_seats: 22, current_d_seats: 11, seats_up: 11, is_unicameral: false },
  ]

  const { error } = await supabase
    .from('chambers')
    .upsert(chambers, { onConflict: 'state_id,name' })
  if (error) throw new Error(`Chamber seed error: ${error.message}`)
  console.log(`  ✓ Seeded ${chambers.length} chambers`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await seedChambers()

    // Georgia
    await importFullModel('Georgia Lege District 2026 Projections-2.xlsx', 'GA', 'House')

    // Texas House (no TX Senate per user request)
    await importFullModel('Texas Lege Districts 2026 Projections_Revised.xlsx', 'TX', 'House')

    // Alaska Senate
    await importWithUpFlag('Alaska.xlsx', 'AK', 'Senate')

    // Wisconsin Senate
    await importWithUpFlag('Wisconsin.xlsx', 'WI', 'Senate')

    // Arizona — House and Senate share same district numbers (2-member districts)
    await importSimple('Arizona.xlsx', 'AZ', 'House', 3, 4)
    await importSimple('Arizona.xlsx', 'AZ', 'Senate', 3, 4)

    // Minnesota — House (col 4=Dem, 5=GOP) — Senate would need separate file
    await importSimple('Minnesota.xlsx', 'MN', 'House', 4, 5)

    // Michigan House
    await importMichigan('Michigan.xlsx', 'MI', 'House')

    // Nebraska Legislature
    await importNebraska('Nebraska.xlsx')

    console.log('\n✅ All imports complete.')
    console.log('⚠️  Nebraska incumbent_party is NULL — update manually in Supabase dashboard.')
    console.log('⚠️  Georgia Senate data not in provided files — add separately.')
  } catch (err) {
    console.error('Import failed:', err)
    process.exit(1)
  }
}

main()
