import { useState } from 'react'
import type { WaveParams } from '../../lib/types'

interface SliderProps {
  label: string
  value: number      // 0–1 or 0–0.20 (decimal)
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step, format, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[160px] flex-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-slate-800 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-600`}
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

interface ParameterBarProps {
  params: WaveParams
  onChange: (updates: Partial<WaveParams>) => void
}

export function ParameterBar({ params, onChange }: ParameterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const pct = (v: number) => `${Math.round(v * 100)}%`

  if (collapsed) {
    return (
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-3 sm:gap-6 text-sm text-slate-600">
            <span>Wave <strong className="text-blue-700">{pct(params.wave)}</strong></span>
            <span>Win Prob <strong className="text-blue-700">{pct(params.win_probability)}</strong></span>
            {showAdvanced && (
              <span>Range <strong className="text-slate-700">{pct(params.competitive_range)}</strong></span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
          >
            <span>Expand</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 sm:flex-wrap">
          {/* Wave % */}
          <Slider
            label="Wave %"
            value={params.wave}
            min={0}
            max={0.20}
            step={0.01}
            format={pct}
            onChange={v => onChange({ wave: v })}
          />

          {/* Win Probability */}
          <Slider
            label="Win Probability"
            value={params.win_probability}
            min={0}
            max={1}
            step={0.05}
            format={pct}
            onChange={v => onChange({ win_probability: v })}
          />

          {/* Competitive Range (advanced) */}
          {showAdvanced && (
            <Slider
              label="Competitive Range"
              value={params.competitive_range}
              min={0.02}
              max={0.20}
              step={0.01}
              format={pct}
              onChange={v => onChange({ competitive_range: v })}
            />
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 sm:ml-auto pb-0.5">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showAdvanced ? 'Hide advanced' : 'Advanced'}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <span>Collapse</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
