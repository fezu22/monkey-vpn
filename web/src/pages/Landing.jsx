import { Link } from 'react-router-dom'
import Jungle from '../components/Jungle.jsx'

export default function Landing() {
  return (
    <Jungle>
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between p-5 md:px-10">
          <div className="flex items-center gap-2 text-gold-500 font-display text-2xl">
            <span className="text-3xl">🐒</span> Monkey VPN
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-moss-300 hover:text-gold-500 text-sm">Sign in</Link>
            <Link to="/onboarding" className="rounded-full bg-gold-500 text-canopy font-display px-4 py-2 text-sm hover:bg-gold-400">Start the Expedition</Link>
          </nav>
        </header>

        <section className="flex-1 grid md:grid-cols-2 gap-10 items-center px-6 md:px-10 pb-20">
          <div>
            <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">Lush Tropical Night</p>
            <h1 className="font-display text-5xl md:text-7xl text-gold-500 mt-3 leading-tight">
              Swing through the<br/>jungle of the internet.
            </h1>
            <p className="text-moss-300 max-w-xl mt-5 text-lg">
              Monkey VPN is a high-security, gamified VPN built for fearless explorers.
              WireGuard speed. AES-256-GCM encryption. RAM-only servers. Zero logs.
              And one very smart monkey watching your back.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/onboarding" className="rounded-full bg-gold-500 text-canopy font-display px-6 py-3 hover:bg-gold-400">Pull the Vine →</Link>
              <Link to="/login" className="rounded-full border border-moss-500/40 text-moss-300 px-6 py-3 hover:bg-forest-800/60">I already have a banana</Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 text-sm text-moss-300">
              <li className="vine-border rounded-lg p-3">🌿 The Vines kill switch</li>
              <li className="vine-border rounded-lg p-3">🦎 Camo Mode obfuscation</li>
              <li className="vine-border rounded-lg p-3">🐒🐒 Double Jungle multi-hop</li>
              <li className="vine-border rounded-lg p-3">🍌 Quick Swing — ripest fruit</li>
            </ul>
          </div>

          <div className="relative">
            <div className="vine-border rounded-3xl p-6 bg-forest-800/50">
              <div className="aspect-square grid place-items-center">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-forest-700 to-canopy ring-4 ring-gold-500/40 shadow-glow" />
                  <div className="absolute inset-0 grid place-items-center text-9xl">🐒</div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl">👑</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                <Stat label="Territories" value="50+" />
                <Stat label="Logs kept" value="0" />
                <Stat label="Encryption" value="AES-256" />
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-moss-300/70 text-xs pb-6">
          Built for explorers. The jungle is a wild place — let the monkey guide you safely through the canopy.
        </footer>
      </div>
    </Jungle>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-canopy/60 p-3 vine-border">
      <p className="font-display text-2xl text-gold-500">{value}</p>
      <p className="text-xs uppercase tracking-widest text-moss-300">{label}</p>
    </div>
  )
}
