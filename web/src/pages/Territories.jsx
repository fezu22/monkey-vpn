import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import { api } from '../lib/api.js'
import { useOutletContext } from 'react-router-dom'

export default function Territories() {
  const { refreshConnection } = useOutletContext()
  const [list, setList] = useState([])
  const [region, setRegion] = useState('All')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(null)

  useEffect(() => { api.territories().then(r => setList(r.territories)) }, [])

  const regions = useMemo(() => ['All', ...Array.from(new Set(list.map(t => t.region)))], [list])
  const filtered = list.filter(t =>
    (region === 'All' || t.region === region) &&
    (q === '' || t.name.toLowerCase().includes(q.toLowerCase()) || t.region.toLowerCase().includes(q.toLowerCase()))
  )

  const connect = async (t) => {
    setBusy(t.id)
    try {
      await api.connect(t.id, { obfuscation: t.obfuscation })
      await refreshConnection()
    } finally { setBusy(null) }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">All Territories</p>
        <h1 className="font-display text-3xl text-gold-500">Where shall we hide today?</h1>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search territories…"
          className="flex-1 min-w-[200px] rounded-xl bg-canopy/70 border border-moss-500/30 px-4 py-2 text-moss-100 placeholder:text-moss-500/50 focus:border-gold-500 focus:outline-none"
        />
        <select
          value={region} onChange={e => setRegion(e.target.value)}
          className="rounded-xl bg-canopy/70 border border-moss-500/30 px-4 py-2 text-moss-100 focus:border-gold-500 focus:outline-none"
        >
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <Card key={t.id} eyebrow={t.region} title={`${t.flag} ${t.name}`}>
            <p className="text-moss-300 italic">{t.tagline}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <Stat label="Ping" value={`${t.latency_ms} ms`} />
              <Stat label="Load" value={`${t.load_pct}%`} />
              <Stat label="Tier" value={t.tier} />
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-moss-300">
              {t.obfuscation && <span className="rounded-full bg-forest-700 px-2 py-1">🦎 Camo</span>}
              {t.multi_hop && <span className="rounded-full bg-forest-700 px-2 py-1">🐒🐒 Multi-hop</span>}
            </div>
            <button
              disabled={busy === t.id}
              onClick={() => connect(t)}
              className="mt-4 w-full rounded-full bg-gold-500 text-canopy font-display py-2 hover:bg-gold-400 disabled:opacity-60"
            >
              {busy === t.id ? 'Swinging…' : 'Connect to this Territory'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-canopy/50 p-2">
      <p className="font-display text-lg text-gold-500">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-moss-300">{label}</p>
    </div>
  )
}
