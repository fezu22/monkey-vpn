import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import { api } from '../lib/api.js'

export default function Agility() {
  const [list, setList] = useState([])
  const [chosen, setChosen] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(false)

  const refreshHistory = async () => {
    try { setHistory((await api.agilityHistory()).history) } catch {}
  }

  useEffect(() => {
    api.territories().then(r => {
      setList(r.territories)
      if (r.territories.length) setChosen(r.territories[0].id)
    })
    refreshHistory()
  }, [])

  const run = async () => {
    if (!chosen) return
    setBusy(true); setResult(null)
    try {
      const r = await api.agility(chosen)
      setResult(r)
      refreshHistory()
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">Monkey Agility Test</p>
        <h1 className="font-display text-3xl text-gold-500">How fast can the troop swing?</h1>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-[200px]">
            <span className="block text-xs uppercase tracking-widest text-moss-300 mb-1">Territory</span>
            <select
              value={chosen} onChange={e => setChosen(e.target.value)}
              className="w-full rounded-xl bg-canopy/70 border border-moss-500/30 px-4 py-3 text-moss-100"
            >
              {list.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
            </select>
          </label>
          <button onClick={run} disabled={busy} className="rounded-full bg-gold-500 text-canopy font-display px-6 py-3 hover:bg-gold-400 disabled:opacity-60">
            {busy ? 'Running…' : '⚡ Run Agility Test'}
          </button>
        </div>

        {result && (
          <div className="mt-6 grid sm:grid-cols-4 gap-3">
            <Stat label="Ping" value={`${result.ping_ms} ms`} />
            <Stat label="Download" value={`${result.download_mbps.toFixed(1)} Mbps`} />
            <Stat label="Upload" value={`${result.upload_mbps.toFixed(1)} Mbps`} />
            <Stat label="Score" value={result.score} />
            <p className="sm:col-span-4 text-moss-300 italic">{result.verdict}</p>
          </div>
        )}
      </Card>

      <Card title="Recent agility runs" eyebrow="History">
        {history.length === 0 ? (
          <p className="text-moss-300">No runs yet. The monkey is well-rested.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-moss-300 text-xs uppercase tracking-widest">
              <tr><th className="text-left py-2">Territory</th><th>Ping</th><th>Down</th><th>Up</th><th>Score</th><th>When</th></tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-t border-moss-500/10">
                  <td className="py-2 text-gold-500 font-display">{h.territory_name}</td>
                  <td className="text-center">{h.ping_ms} ms</td>
                  <td className="text-center">{h.download_mbps.toFixed(0)} Mbps</td>
                  <td className="text-center">{h.upload_mbps.toFixed(0)} Mbps</td>
                  <td className="text-center text-moss-300">{h.score}</td>
                  <td className="text-center text-moss-300">{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-canopy/60 p-3 vine-border text-center">
      <p className="font-display text-2xl text-gold-500">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-moss-300">{label}</p>
    </div>
  )
}
