import { useNavigate } from 'react-router-dom'

// Phase 1: data is managed via static JSON files in src/data/districts/
// To update data: edit the JSON files directly or re-run `npm run generate-data`
// then push to GitHub — Vercel will rebuild automatically.
export function AdminPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-lg shadow-sm">
        <h1 className="text-lg font-bold text-slate-800 mb-1">Data Management</h1>
        <p className="text-sm text-slate-500 mb-6">
          WaveWatch uses static data files. To update district data:
        </p>
        <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
          <li>Edit <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">src/data/districts/*.json</code> directly, or</li>
          <li>Update the source XLSX files and run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">npm run generate-data</code></li>
          <li>Commit and push to GitHub</li>
          <li>Vercel will rebuild and deploy automatically</li>
        </ol>
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  )
}
