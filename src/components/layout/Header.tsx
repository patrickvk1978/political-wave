import type { State } from '../../lib/types'

interface HeaderProps {
  states: State[]
  selectedState: string | null   // abbreviation or null = all states
  onStateChange: (abbr: string | null) => void
  isAdmin: boolean
  onAdminClick: () => void
}

export function Header({ states, selectedState, onStateChange, isAdmin, onAdminClick }: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-2 min-w-0">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-wide">WaveWatch</span>
          <span className="text-slate-500 text-xs hidden sm:block">2026 Legislative Projections</span>
        </div>

        {/* State selector — scrollable on mobile */}
        <nav className="flex-1 overflow-x-auto min-w-0">
          <div className="flex items-center gap-1 w-max mx-auto">
            <button
              onClick={() => onStateChange(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedState === null
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              All States
            </button>
            {states.map(state => (
              <button
                key={state.abbreviation}
                onClick={() => onStateChange(state.abbreviation)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  selectedState === state.abbreviation
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {state.abbreviation}
              </button>
            ))}
          </div>
        </nav>

        {/* Admin */}
        <button
          onClick={onAdminClick}
          className="shrink-0 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Sign in'}</span>
        </button>
      </div>
    </header>
  )
}
