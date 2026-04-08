import type { WaveParams } from '../../lib/types'

interface ParameterBarProps {
  params: WaveParams
  onChange: (updates: Partial<WaveParams>) => void
}

export function ParameterBar({ params, onChange }: ParameterBarProps) {
  const pct = (v: number) => `${Math.round(v * 100)}%`

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-6">
        <div className="flex flex-col gap-1 w-48 sm:w-64">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Wave %</span>
            <span className="text-sm font-bold text-blue-700 tabular-nums">{pct(params.wave)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.20}
            step={0.01}
            value={params.wave}
            onChange={e => onChange({ wave: parseFloat(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>20%</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 hidden sm:block">
          Uniform D shift applied to all districts up in 2026
        </p>
      </div>
    </div>
  )
}
