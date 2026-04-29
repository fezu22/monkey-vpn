import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import MonkeyButton from '../components/MonkeyButton.jsx'
import Card from '../components/Card.jsx'
import { api } from '../lib/api.js'

export default function Dashboard() {
  const { connection, refreshConnection, user } = useOutletContext()
  const [territories, setTerritories] = useState([])
  const [chosen, setChosen] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.territories().then(r => {
      setTerritories(r.territories)
      if (!chosen && r.territories.length) setChosen(r.territories[0])
    }).catch(() => {})
  }, [])

  const state = busy ? 'connecting' : connection?.active ? 'connected' : 'disconnected'

  const toggle = async () => {
    setError('')
    if (state === 'connected') {
      setBusy(true)
      try { await api.disconnect() } catch (e) { setError(e.message) }
      await refreshConnection()
      setBusy(false)
      return
    }
    if (!chosen) return
    setBusy(true)
    try {
      // Tiny delay so the swinging animation is visible.
      await new Promise(r => setTimeout(r, 1200))
      await api.connect(chosen.id, { obfuscation: chosen.obfuscation, multi_hop: false })
    } catch (e) {
      setError(e.message)
    }
    await refreshConnection()
    setBusy(false)
  }

  const quickSwing = async () => {
    try {
      const r = await api.quickSwing()
      setChosen(r.territory)
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
      <div className="flex flex-col items-center justify-center p-6 vine-border rounded-3xl bg-forest-800/40 min-h-[480px]">
        <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">Welcome back, {user?.display_name || 'Explorer'}</p>
        <h1 className="font-display text-3xl text-gold-500 mt-1 mb-6">Pull the vine to disappear.</h1>
        <MonkeyButton state={state} onClick={toggle} />
        <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
          <button onClick={quickSwing} className="rounded-xl border border-moss-500/30 px-4 py-3 text-moss-300 hover:bg-forest-700/60 text-sm">
            🍌 Quick Swing — Ripest Fruit
          </button>
          <a href={connection?.active ? api.wireguardConfigUrl() : '#'} className={`rounded-xl border border-moss-500/30 px-4 py-3 text-sm ${connection?.active ? 'text-gold-500 hover:bg-forest-700/60' : 'text-moss-500/40 cursor-not-allowed'}`}>
            🔑 Download WireGuard config
          </a>
        </div>
        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
      </div>

      <div className="flex flex-col gap-6">
        <Card title={connection?.active ? 'Hidden in the jungle' : 'Selected Territory'} eyebrow="Territory">
          {chosen ? (
            <div>
              <p className="font-display text-2xl text-gold-500">{chosen.flag} {chosen.name}</p>
              <p className="text-moss-300 italic">{chosen.tagline}</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <Stat label="Latency" value={`${chosen.latency_ms} ms`} />
                <Stat label="Load" value={`${chosen.load_pct}%`} />
                <Stat label="Tier" value={chosen.tier} />
              </div>
              <p className="text-xs text-moss-300 mt-3">
                {chosen.obfuscation && '🦎 Camo · '}{chosen.multi_hop && '🐒🐒 Multi-hop · '}{chosen.endpoint}
              </p>
            </div>
          ) : <p className="text-moss-300">Pick a territory →</p>}
        </Card>
        <Card title="Pick a Territory" eyebrow="Top 5">
          <ul className="space-y-1">
            {territories.slice(0, 6).map(t => (
              <li key={t.id}>
                <button
                  onClick={() => setChosen(t)}
                  className={`w-full text-left rounded-lg px-3 py-2 flex items-center justify-between gap-3 ${chosen?.id === t.id ? 'bg-forest-700' : 'hover:bg-forest-800/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{t.flag}</span>
                    <span>
                      <span className="block text-gold-500 font-display">{t.name}</span>
                      <span className="block text-xs text-moss-300">{t.region}</span>
                    </span>
                  </span>
                  <span className="text-sm text-moss-300">{t.latency_ms} ms</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
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
