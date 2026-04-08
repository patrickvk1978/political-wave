import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { ParameterBar } from '../components/layout/ParameterBar'
import { SummaryStats } from '../components/overview/SummaryStats'
import { OverviewGrid } from '../components/overview/OverviewGrid'
import { DistrictTable } from '../components/districts/DistrictTable'
import { ChamberMap } from '../components/districts/ChamberMap'
import { NationalMap } from '../components/overview/NationalMap'
import { useChambers } from '../hooks/useChambers'
import { useDistricts } from '../hooks/useDistricts'
import { useProjections } from '../hooks/useProjections'
import { useWaveParams } from '../hooks/useWaveParams'

type Tab = 'overview' | 'districts'
type DistrictView = 'map' | 'table'

export function Dashboard() {
  const navigate = useNavigate()
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedChamberId, setSelectedChamberId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [districtView, setDistrictView] = useState<DistrictView>('map')

  const { params, setParams } = useWaveParams()
  const { chambers, loading: chambersLoading } = useChambers()

  // Filter chambers by selected state
  const filteredChambers = useMemo(() => {
    if (!selectedState) return chambers
    return chambers.filter(c => c.state.abbreviation === selectedState)
  }, [chambers, selectedState])

  const chamberIds = useMemo(() => filteredChambers.map(c => c.id), [filteredChambers])
  const { districts, loading: districtsLoading } = useDistricts(chamberIds)

  const { projections, summary } = useProjections(filteredChambers, districts, params)

  // States list derived from chambers
  const states = useMemo(() => {
    const seen = new Set<string>()
    return chambers
      .map(c => c.state)
      .filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true })
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [chambers])

  // For district tab: find the selected chamber's projection
  const selectedProjection = useMemo(() => {
    if (!selectedChamberId) return projections[0] ?? null
    return projections.find(p => p.chamber.id === selectedChamberId) ?? projections[0] ?? null
  }, [projections, selectedChamberId])

  function handleChamberSelect(chamberId: string) {
    setSelectedChamberId(chamberId)
    setActiveTab('districts')
    setDistrictView('map')
  }

  const loading = chambersLoading || districtsLoading

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        states={states}
        selectedState={selectedState}
        onStateChange={abbr => { setSelectedState(abbr); setSelectedChamberId(null) }}
        isAdmin={false}
        onAdminClick={() => navigate('/admin')}
      />
      <ParameterBar params={params} onChange={setParams} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {/* Top-level tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
          {(['overview', 'districts'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-20 bg-slate-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-slate-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SummaryStats stats={summary} />
                <OverviewGrid
                  projections={projections}
                  onChamberSelect={handleChamberSelect}
                />
              </div>
            )}

            {activeTab === 'districts' && (
              <>
                {/* ── No state selected: show national map ── */}
                {!selectedState && (
                  <NationalMap
                    projections={projections}
                    onStateSelect={abbr => {
                      setSelectedState(abbr)
                      setSelectedChamberId(null)
                      setDistrictView('map')
                    }}
                  />
                )}

                {/* ── State selected: show chamber picker + district map ── */}
                {selectedState && (
                  <div className="space-y-4">
                    {/* Chamber pills + Map/Table toggle */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-wrap gap-2">
                        {projections.map(p => (
                          <button
                            key={p.chamber.id}
                            onClick={() => {
                              setSelectedChamberId(p.chamber.id)
                              setDistrictView('map')
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                              (selectedChamberId ?? projections[0]?.chamber.id) === p.chamber.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {p.chamber.name}
                          </button>
                        ))}
                      </div>

                      {/* Map / Table toggle */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                        {(['map', 'table'] as DistrictView[]).map(view => (
                          <button
                            key={view}
                            onClick={() => setDistrictView(view)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
                              districtView === view
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {view === 'map' ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 6v12M14 6v12" />
                              </svg>
                            )}
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chamber heading */}
                    {selectedProjection && (
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-lg font-semibold text-slate-800">
                          {selectedProjection.state.name} {selectedProjection.chamber.name}
                        </h2>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          selectedProjection.flipped
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedProjection.flipped
                            ? `Flips D (+${selectedProjection.net_pickups})`
                            : selectedProjection.net_pickups > 0
                              ? `D +${selectedProjection.net_pickups} — ${selectedProjection.seats_to_flip} short`
                              : `No net pickups`}
                        </span>
                      </div>
                    )}

                    {districtView === 'map' && selectedProjection && (
                      <ChamberMap
                        chamberId={selectedProjection.chamber.id}
                        districts={selectedProjection.districts}
                        height={560}
                      />
                    )}

                    {districtView === 'table' && selectedProjection && (
                      <DistrictTable
                        districts={selectedProjection.districts}
                        chamberName={selectedProjection.chamber.name}
                        stateName={selectedProjection.state.name}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-400">
          <span>WaveWatch 2026 — Legislative Projection Model</span>
          <span>Data reflects median partisan performance + applied wave scenario</span>
        </div>
      </footer>
    </div>
  )
}
