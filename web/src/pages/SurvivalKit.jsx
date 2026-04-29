import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import Toggle from '../components/Toggle.jsx'
import { api } from '../lib/api.js'

const presetApps = ['Banana Bank', 'Treehouse Browser', 'Vine Streamer', 'Coconut Mail', 'Jungle Maps', 'Howler Chat']

export default function SurvivalKit() {
  const [s, setS] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { api.settings().then(setS) }, [])

  const update = async (patch) => {
    const next = { ...s, ...patch }
    setS(next)
    setSaving(true)
    try { await api.updateSettings(next) } finally { setSaving(false) }
  }
  const toggleApp = (app) => {
    const has = s.split_tunnel_apps.includes(app)
    const next = has ? s.split_tunnel_apps.filter(a => a !== app) : [...s.split_tunnel_apps, app]
    update({ split_tunnel_apps: next })
  }

  if (!s) return <p className="text-moss-300">Opening the kit…</p>

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">Survival Kit</p>
          <h1 className="font-display text-3xl text-gold-500">Tools every monkey carries.</h1>
        </div>
        <span className="text-xs text-moss-300">{saving ? 'Saving…' : 'Saved'}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Privacy" eyebrow="Defenses">
          <Toggle
            label="The Vines (Kill Switch)"
            hint="Cuts internet instantly if the tunnel drops. No leaks, no exceptions."
            checked={s.kill_switch}
            onChange={v => update({ kill_switch: v })}
          />
          <Toggle
            label="DNS Leak Protection"
            hint="Force all DNS through our private encrypted resolvers."
            checked={s.dns_leak_protection}
            onChange={v => update({ dns_leak_protection: v })}
          />
          <Toggle
            label="Camo Mode (Obfuscation)"
            hint="Disguise VPN traffic as normal HTTPS to slip past the Great Firewalls."
            checked={s.camo_mode}
            onChange={v => update({ camo_mode: v })}
          />
          <Toggle
            label="Double Jungle (Multi-Hop)"
            hint="Route through two territories for paranoid-grade anonymity."
            checked={s.multi_hop}
            onChange={v => update({ multi_hop: v })}
          />
        </Card>

        <Card title="Behaviour" eyebrow="Habits">
          <Toggle
            label="Auto-Connect on launch"
            hint="The monkey doesn't wait — it swings as soon as you open the app."
            checked={s.auto_connect}
            onChange={v => update({ auto_connect: v })}
          />
          <div className="py-3">
            <p className="font-display text-gold-500">Protocol</p>
            <p className="text-sm text-moss-300 mb-2">WireGuard for speed; OpenVPN to bypass deep packet inspection.</p>
            <div className="flex gap-2">
              {['wireguard','openvpn'].map(p => (
                <button
                  key={p}
                  onClick={() => update({ protocol: p })}
                  className={`rounded-full px-4 py-2 text-sm border ${s.protocol === p ? 'bg-gold-500 text-canopy border-gold-500' : 'border-moss-500/30 text-moss-300 hover:bg-forest-700'}`}
                >
                  {p === 'wireguard' ? 'WireGuard' : 'OpenVPN'}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Choose Your Path (Split Tunneling)" eyebrow="Apps that go through the VPN">
        <p className="text-sm text-moss-300 mb-3">Selected apps tunnel through Monkey VPN. Everything else stays on your local connection.</p>
        <div className="flex flex-wrap gap-2">
          {presetApps.map(app => {
            const on = s.split_tunnel_apps.includes(app)
            return (
              <button
                key={app}
                onClick={() => toggleApp(app)}
                className={`rounded-full px-3 py-1.5 text-sm border ${on ? 'bg-gold-500 text-canopy border-gold-500' : 'border-moss-500/30 text-moss-300 hover:bg-forest-700'}`}
              >
                {on ? '🍌 ' : ''}{app}
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
