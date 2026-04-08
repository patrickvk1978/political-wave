/**
 * Reads XLSX files and generates static JSON data files in src/data/districts/
 *
 * Usage:
 *   npm run generate-data
 */

import ExcelJS from 'exceljs'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../../')   // PoliticalWave/
const OUT_DIR  = path.resolve(__dirname, '../data/districts')

interface DistrictRow {
  chamber_id: string
  district_number: string
  incumbent_party: 'R' | 'D' | null
  is_open_seat: boolean
  dem_median: number
  gop_median: number
  dem_incumbency_adv: number
  gop_incumbency_adv: number
  is_seat_up: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function n(val: unknown): number {
  const v = Number(val)
  return isNaN(v) ? 0 : v
}

function party(val: unknown): 'R' | 'D' | null {
  if (!val) return null
  const s = String(val).trim().toUpperCase()
  if (['R', 'REP', 'REPUBLICAN', 'GOP'].includes(s)) return 'R'
  if (['D', 'DEM', 'DEMOCRAT', 'DEMOCRATIC', 'DFL'].includes(s)) return 'D'
  return null
}

function yn(val: unknown): boolean {
  return String(val ?? '').trim().toUpperCase() === 'Y'
}

const INC_ADV = 0.025
function incAdv(p: 'R' | 'D' | null) {
  return {
    dem_incumbency_adv: p === 'D' ? INC_ADV : 0,
    gop_incumbency_adv: p === 'R' ? INC_ADV : 0,
  }
}

async function rows(file: string, sheetIdx = 0): Promise<ExcelJS.Row[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path.join(DATA_DIR, file))
  const ws = wb.worksheets[sheetIdx]
  const out: ExcelJS.Row[] = []
  ws.eachRow((row, idx) => { if (idx > 1) out.push(row) })
  return out
}

function write(chamberId: string, data: DistrictRow[]) {
  const file = path.join(OUT_DIR, `${chamberId}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`  ✓ ${chamberId}.json  (${data.length} districts)`)
}

// ─── Importers ────────────────────────────────────────────────────────────────

/** GA / TX: dist, party, dem_med, gop_med, dem_inc, gop_inc, ... */
async function fullModel(file: string, chamberId: string) {
  const data = (await rows(file))
    .filter(r => r.getCell(1).value != null)
    .map(r => ({
      chamber_id: chamberId,
      district_number: String(r.getCell(1).value).replace(/^HD\s*/i, '').trim(),
      incumbent_party: party(r.getCell(2).value),
      is_open_seat: party(r.getCell(2).value) === null,
      dem_median: n(r.getCell(3).value),
      gop_median: n(r.getCell(4).value),
      dem_incumbency_adv: n(r.getCell(5).value),
      gop_incumbency_adv: n(r.getCell(6).value),
      is_seat_up: true,
    }))
  write(chamberId, data)
}

/** AK / WI Senate: dist, party, up_in_26, dem_med, gop_med */
async function withUpFlag(file: string, chamberId: string, sheetIdx = 0) {
  const data = (await rows(file, sheetIdx))
    .filter(r => r.getCell(1).value != null)
    .map(r => ({
      chamber_id: chamberId,
      district_number: String(r.getCell(1).value).trim(),
      incumbent_party: party(r.getCell(2).value),
      is_open_seat: party(r.getCell(2).value) === null,
      dem_median: n(r.getCell(4).value),
      gop_median: n(r.getCell(5).value),
      ...incAdv(party(r.getCell(2).value)),
      is_seat_up: yn(r.getCell(3).value),
    }))
  write(chamberId, data)
}

/** AZ / MN / WI Assembly: flexible column mapping */
async function simple(file: string, chamberId: string, demCol: number, gopCol: number, partyCol = 2, distCol = 1, sheetIdx = 0) {
  const data = (await rows(file, sheetIdx))
    .filter(r => r.getCell(distCol).value != null)
    .map(r => ({
      chamber_id: chamberId,
      district_number: String(r.getCell(distCol).value).trim(),
      incumbent_party: party(r.getCell(partyCol).value),
      is_open_seat: party(r.getCell(partyCol).value) === null,
      dem_median: n(r.getCell(demCol).value),
      gop_median: n(r.getCell(gopCol).value),
      ...incAdv(party(r.getCell(partyCol).value)),
      is_seat_up: true,
    }))
  write(chamberId, data)
}

/** Michigan: dist, party, [gap], [gap], dem_gov22, gop_gov22, dem_pres20, gop_pres20 */
async function michigan(file: string, chamberId: string) {
  const data = (await rows(file))
    .filter(r => r.getCell(1).value != null)
    .map(r => {
      const p      = party(r.getCell(2).value)
      const demGov  = n(r.getCell(5).value)
      const gopGov  = n(r.getCell(6).value)
      const demPres = n(r.getCell(7).value)
      const gopPres = n(r.getCell(8).value)
      return {
        chamber_id: chamberId,
        district_number: String(r.getCell(1).value).trim(),
        incumbent_party: p,
        is_open_seat: p === null,
        dem_median: (demGov + demPres) / 2,
        gop_median: (gopGov + gopPres) / 2,
        ...incAdv(p),
        is_seat_up: true,
      }
    })
  write(chamberId, data)
}

/** Nebraska: dist, [gap], [gap], dem_pres24, gop_pres24, dem_pres20, gop_pres20 */
async function nebraska(file: string, chamberId: string) {
  const data = (await rows(file))
    .filter(r => r.getCell(1).value != null)
    .map(r => {
      const demP24 = n(r.getCell(4).value)
      const gopP24 = n(r.getCell(5).value)
      const demP20 = n(r.getCell(6).value)
      const gopP20 = n(r.getCell(7).value)
      return {
        chamber_id: chamberId,
        district_number: String(r.getCell(1).value).trim(),
        incumbent_party: null as null,   // NE officially nonpartisan — set manually in JSON
        is_open_seat: false,
        dem_median: (demP24 + demP20) / 2,
        gop_median: (gopP24 + gopP20) / 2,
        ...incAdv(null),   // NE nonpartisan — set manually in JSON
        is_seat_up: true,
      }
    })
  write(chamberId, data)
}

/** MN House: dist (1A/1B format), party, null, pres24_d, pres24_r, gov22_d, gov22_r, pres20_d, pres20_r
 *  Maps "1A"→"1", "1B"→"2", "2A"→"3" ... to match GeoJSON sequential numbering */
async function mnHouse(file: string, chamberId: string) {
  const data = (await rows(file, 1))
    .filter(r => r.getCell(1).value != null)
    .map(r => {
      const raw = String(r.getCell(1).value).trim()  // e.g. "1A", "66B"
      const match = raw.match(/^(\d+)([AB])$/i)
      const distNum = match
        ? String((parseInt(match[1]) * 2) - (match[2].toUpperCase() === 'A' ? 1 : 0))
        : raw
      const p      = party(r.getCell(2).value)
      const demP24 = n(r.getCell(4).value)
      const gopP24 = n(r.getCell(5).value)
      const demG22 = n(r.getCell(6).value)
      const gopG22 = n(r.getCell(7).value)
      const demP20 = n(r.getCell(8).value)
      const gopP20 = n(r.getCell(9).value)
      return {
        chamber_id: chamberId,
        district_number: distNum,
        incumbent_party: p,
        is_open_seat: p === null,
        dem_median: (demP24 + demG22 + demP20) / 3,
        gop_median: (gopP24 + gopG22 + gopP20) / 3,
        ...incAdv(p),
        is_seat_up: true,
      }
    })
  write(chamberId, data)
}

/** Michigan House: dist, party, null, dem_gov22, rep_gov22, dem_pres20, rep_pres20 */
async function miHouse(file: string, chamberId: string) {
  const data = (await rows(file, 1))
    .filter(r => r.getCell(1).value != null)
    .map(r => {
      const p       = party(r.getCell(2).value)
      const demGov  = n(r.getCell(4).value)
      const gopGov  = n(r.getCell(5).value)
      const demPres = n(r.getCell(6).value)
      const gopPres = n(r.getCell(7).value)
      return {
        chamber_id: chamberId,
        district_number: String(r.getCell(1).value).trim(),
        incumbent_party: p,
        is_open_seat: p === null,
        dem_median: (demGov + demPres) / 2,
        gop_median: (gopGov + gopPres) / 2,
        ...incAdv(p),
        is_seat_up: true,
      }
    })
  write(chamberId, data)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating district data files…\n')

  await fullModel('Georgia Lege District 2026 Projections-2.xlsx', 'ga-house')
  await fullModel('Texas Lege Districts 2026 Projections_Revised.xlsx', 'tx-house')
  // Alaska: Senate=sheet0 (dist,party,up26,dem,gop), House=sheet1 (dist,party,medD,medR)
  await withUpFlag('Alaska.xlsx',   'ak-senate', 0)
  await simple('Alaska.xlsx',       'ak-house',  3, 4, 2, 1, 1)  // House sheet, medD=c3, medR=c4
  // Wisconsin: Senate=sheet0, Assembly=sheet1
  await withUpFlag('Wisconsin.xlsx', 'wi-senate', 0)
  await simple('Wisconsin.xlsx',    'wi-assembly', 3, 4, 2, 1, 1)
  // Arizona: Senate=sheet0, House=sheet1 (same column layout)
  await simple('Arizona.xlsx',  'az-senate',  3, 4, 2, 1, 0)
  await simple('Arizona.xlsx',  'az-house',   3, 4, 2, 1, 1)
  // Minnesota: Senate=sheet0 (dem=c4,gop=c5), House=sheet1 (1A/1B format, multi-cycle medians)
  await simple('Minnesota.xlsx','mn-senate',  4, 5, 2, 1, 0)
  await mnHouse('Minnesota.xlsx', 'mn-house')
  // Michigan: Senate=sheet0, House=sheet1 (col offsets differ)
  await michigan('Michigan.xlsx', 'mi-senate')
  await miHouse('Michigan.xlsx',  'mi-house')
  await nebraska('Nebraska.xlsx', 'ne-legislature')

  console.log('\n✅ Done. Files written to src/data/districts/')
  console.log('⚠️  Nebraska: set incumbent_party manually in ne-legislature.json')
  console.log('⚠️  GA Senate not in provided files — add ga-senate.json manually')
}

main().catch(err => { console.error(err); process.exit(1) })
