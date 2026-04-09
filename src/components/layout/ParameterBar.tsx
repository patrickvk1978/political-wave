import type { WaveParams } from '../../lib/types'

interface ParameterBarProps {
  params: WaveParams
  onChange: (updates: Partial<WaveParams>) => void
}

const MAX = 0.20

// Reference markers — positioned as fraction of slider range
const MARKERS = [
  { value: 0.068, pctLabel: '6.8%', desc: '2010 R wave',         row: 'above' as const },
  { value: 0.083, pctLabel: '8.3%', desc: '2018 D wave',         row: 'below' as const },
  { value: 0.116, pctLabel: '11.6%', desc: 'State special avg',  row: 'below' as const },
  { value: 0.185, pctLabel: '18.5%', desc: 'Federal special avg', row: 'below' as const },
]

function WaveFill({ progress }: { progress: number }) {
  const normalized = Math.max(0, Math.min(progress / 100, 1))
  const effectiveWidth = Math.max(progress, 2)
  const railY = 58
  const tailTopY = railY - normalized * 8
  const midTopY = railY - normalized * 18
  const crestY = railY - normalized * 56
  const frontShoulderY = railY - normalized * 30
  const frontLipY = railY - normalized * 44
  const frontDropY = railY - normalized * 2

  const areaPath = [
    `M 0 ${railY}`,
    `C 12 ${tailTopY} 28 ${tailTopY - 1} 50 ${midTopY}`,
    `C 70 ${midTopY - 3} 82 ${frontShoulderY} 90 ${crestY}`,
    `C 94 ${frontLipY} 98 ${frontDropY - 10} 100 ${frontDropY}`,
    `L 100 ${railY}`,
    `L 0 ${railY} Z`,
  ].join(' ')

  return (
    <div className="wave-fill-shell absolute inset-x-0 top-0 bottom-0 overflow-visible pointer-events-none">
      <div
        className="wave-fill-clip h-full"
        style={{ left: '0%', width: `${effectiveWidth}%` }}
      >
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="wave-fill-svg h-full w-full min-w-full"
          aria-hidden="true"
        >
          <path d={areaPath} className="wave-fill-area" />
        </svg>
      </div>
    </div>
  )
}

export function ParameterBar({ params, onChange }: ParameterBarProps) {
  const pct = (v: number) => `${Math.round(v * 100)}%`
  const progress = (params.wave / MAX) * 100

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">

        {/* Label row */}
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Wave %</span>
          <span className="text-sm font-bold text-blue-700 tabular-nums">{pct(params.wave)}</span>
        </div>

        {/* Markers above track */}
        <div className="relative hidden sm:block h-11 mb-1">
          {MARKERS.filter(m => m.row === 'above').map(m => {
            const left = (m.value / MAX) * 100
            return (
              <div
                key={m.value}
                className="absolute flex flex-col items-center"
                style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{m.pctLabel}</span>
                <span className="text-[9px] text-slate-400 whitespace-nowrap leading-tight">{m.desc}</span>
              </div>
            )
          })}
        </div>

        {/* Slider track with tick marks */}
        <div className="relative">
          {/* Tick marks */}
          <div className="absolute inset-x-0 bottom-3 h-5 pointer-events-none hidden sm:block">
            {MARKERS.map(m => {
              const left = (m.value / MAX) * 100
              return (
                <div
                  key={m.value}
                  className="absolute top-0 bottom-0 flex items-center"
                  style={{ left: `${left}%` }}
                >
                  <div className="w-px h-5 bg-slate-300/80" />
                </div>
              )
            })}
          </div>

          <div className="relative h-22 sm:h-24">
            <WaveFill progress={progress} />
            <div className="wave-slider-track absolute inset-x-0 bottom-3 h-5 rounded-full" />
            <input
              type="range"
              min={0}
              max={MAX}
              step={0.01}
              value={params.wave}
              onChange={e => onChange({ wave: parseFloat(e.target.value) })}
              className="wave-slider absolute inset-x-0 bottom-3 z-10 w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Markers below track */}
        <div className="relative hidden sm:block h-7 mt-0.5">
          {/* Min/max labels */}
          <span className="absolute left-0 text-[10px] text-slate-400">0%</span>
          <span className="absolute right-0 text-[10px] text-slate-400">20%</span>

          {MARKERS.filter(m => m.row === 'below').map(m => {
            const left = (m.value / MAX) * 100
            return (
              <div
                key={m.value}
                className="absolute flex flex-col items-center"
                style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{m.pctLabel}</span>
                <span className="text-[9px] text-slate-400 whitespace-nowrap leading-tight">{m.desc}</span>
              </div>
            )
          })}
        </div>

        {/* Mobile: just min/max */}
        <div className="flex justify-between text-[10px] text-slate-400 sm:hidden mt-1">
          <span>0%</span>
          <span>20%</span>
        </div>

      </div>
    </div>
  )
}
