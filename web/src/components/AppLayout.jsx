import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Jungle from './Jungle.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const links = [
  { to: '/app', label: 'Treehouse', icon: '🏠' },
  { to: '/app/territories', label: 'Territories', icon: '🌍' },
  { to: '/app/agility', label: 'Agility', icon: '⚡' },
  { to: '/app/survival-kit', label: 'Survival Kit', icon: '🧰' },
  { to: '/app/profile', label: 'My Monkey', icon: '🐒' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [conn, setConn] = useState(null)
  useEffect(() => {
    let alive = true
    const tick = async () => {
      try {
        const c = await api.connection()
        if (alive) setConn(c)
      } catch { /* ignore */ }
    }
    tick()
    const id = setInterval(tick, 4000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const connected = !!(conn && conn.active)

  return (
    <Jungle vibrant={connected}>
      <div className="min-h-screen flex">
        <aside className="hidden md:flex flex-col w-64 p-5 gap-4 border-r border-moss-500/20 bg-canopy/60">
          <div className="flex items-center gap-2 text-gold-500 font-display text-xl">
            <span className="text-2xl">🐒</span> Monkey VPN
          </div>
          <nav className="flex flex-col gap-1 mt-2">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-forest-700 text-gold-500' : 'text-moss-300 hover:bg-forest-800/60'}`
                }
              >
                <span>{l.icon}</span><span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-xl bg-forest-800/60 p-3 vine-border">
            <p className="text-xs uppercase tracking-widest text-moss-300">Connection</p>
            <p className="text-gold-500 font-display">{connected ? `Hidden in ${conn.territory.name}` : 'Out in the open'}</p>
            <button onClick={() => { logout(); nav('/') }} className="mt-3 w-full rounded-lg border border-moss-500/30 px-3 py-1.5 text-sm text-moss-300 hover:bg-forest-700">
              Climb down (logout)
            </button>
          </div>
        </aside>
        <main className="flex-1 p-5 md:p-10">
          <header className="md:hidden flex items-center justify-between mb-5">
            <div className="text-gold-500 font-display text-lg">🐒 Monkey VPN</div>
            <button onClick={() => { logout(); nav('/') }} className="text-moss-300 text-sm">Logout</button>
          </header>
          <Outlet context={{ connection: conn, refreshConnection: async () => setConn(await api.connection().catch(()=>({active:false}))) , user }} />
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-canopy/95 border-t border-moss-500/20 grid grid-cols-5">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/app'} className={({isActive}) => `flex flex-col items-center py-2 text-xs ${isActive ? 'text-gold-500' : 'text-moss-300'}`}>
                <span className="text-lg">{l.icon}</span>{l.label}
              </NavLink>
            ))}
          </nav>
        </main>
      </div>
    </Jungle>
  )
}
