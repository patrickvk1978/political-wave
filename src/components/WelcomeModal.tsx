interface Props {
  onClose: () => void
}

export function WelcomeModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">WaveWatch 2026</h1>
            <p className="text-xs text-slate-400">Legislative Projection Model</p>
          </div>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed mb-6">
          PoliticalWave models how a generic Democratic wave translates to legislative seat pickups
          across 8 battleground states in 2026. Adjust the wave size and probability threshold to
          see which state house and senate districts flip, from safe seats to toss-ups, in real time.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          Explore the map
        </button>
      </div>
    </div>
  )
}
