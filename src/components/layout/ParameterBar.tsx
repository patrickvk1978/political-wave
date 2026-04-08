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
  const crestY = 48 - normalized * 34
  const shoulderY = 24 + normalized * 5
  const taperY = 52 - normalized * 10
  const innerStartY = 54 - normalized * 18
  const innerEndY = 60 - normalized * 4

  const areaPath = [
    `M 0 60`,
    `L 0 ${crestY}`,
    `C 4 ${crestY - 4} 10 ${crestY - 5} 14 ${shoulderY}`,
    `C 22 ${shoulderY + 2} 42 ${shoulderY + 8} 66 ${taperY}`,
    `C 78 ${taperY + 6} 90 58 100 60`,
    `L 0 60 Z`,
  ].join(' ')

  const linePath = [
    `M 10 ${innerStartY}`,
    `C 16 ${innerStartY - 6} 20 ${innerStartY + 5} 26 ${innerStartY - 1}`,
    `S 36 ${innerStartY + 10} 42 ${innerStartY + 4}`,
    `S 54 ${innerStartY + 16} 60 ${innerStartY + 10}`,
    `S 72 ${innerEndY - 1} 78 ${innerEndY - 4}`,
    `S 90 ${innerEndY + 2} 96 ${innerEndY}`,
  ].join(' ')

  return (
    <div className="wave-fill-shell absolute inset-x-0 top-0 bottom-0 overflow-visible pointer-events-none">
      <div className="wave-fill-clip h-full" style={{ width: `${progress}%` }}>
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="wave-fill-svg h-full w-full min-w-full"
          aria-hidden="true"
        >
          <path d={areaPath} className="wave-fill-area" />
          <path d={linePath} className="wave-fill-line wave-fill-line-a" />
          <path d={linePath} className="wave-fill-line wave-fill-line-b" />
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
        <div className="relative hidden sm:block h-8 mb-1">
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

          <div className="relative h-18 sm:h-20">
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
