import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Jungle from '../components/Jungle.jsx'

const screens = [
  {
    title: 'The Internet is a wild place.',
    body: 'Trackers lurk behind every leaf. ISPs watch every footprint. Public Wi-Fi is a swamp full of crocodiles.',
    emoji: '🌴',
  },
  {
    title: 'A monkey knows the safe paths.',
    body: 'Monkey VPN routes your traffic through encrypted vines. WireGuard for speed. OpenVPN when censors are listening.',
    emoji: '🦍',
  },
  {
    title: 'Your trail disappears in the canopy.',
    body: 'AES-256-GCM data, RSA-4096 handshakes, RAM-only servers. We literally cannot keep logs — there is no disk.',
    emoji: '🌿',
  },
  {
    title: 'Pick your monkey. Pick your territory.',
    body: 'Unlock new monkey avatars as you raise your Stealth Level. Quick Swing finds the ripest fruit (lowest latency).',
    emoji: '🍌',
  },
]

export default function Onboarding() {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const last = i === screens.length - 1
  return (
    <Jungle>
      <div className="min-h-screen grid place-items-center p-6">
        <div className="vine-border rounded-3xl bg-forest-800/50 max-w-xl w-full p-8 text-center">
          <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">Expedition Briefing · {i + 1} / {screens.length}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-7xl my-6">{screens[i].emoji}</div>
              <h1 className="font-display text-3xl text-gold-500">{screens[i].title}</h1>
              <p className="text-moss-300 mt-3">{screens[i].body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-2 mt-6">
            {screens.map((_, idx) => (
              <span key={idx} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-gold-500' : 'w-2 bg-moss-500/40'}`} />
            ))}
          </div>
          <div className="flex justify-between gap-3 mt-6">
            <button
              onClick={() => i === 0 ? nav('/') : setI(i - 1)}
              className="rounded-full px-5 py-2 text-moss-300 border border-moss-500/30 hover:bg-forest-700"
            >
              {i === 0 ? 'Back' : 'Previous'}
            </button>
            {last ? (
              <Link to="/login" className="rounded-full bg-gold-500 text-canopy font-display px-6 py-2 hover:bg-gold-400">Enter the jungle →</Link>
            ) : (
              <button onClick={() => setI(i + 1)} className="rounded-full bg-gold-500 text-canopy font-display px-6 py-2 hover:bg-gold-400">Next →</button>
            )}
          </div>
        </div>
      </div>
    </Jungle>
  )
}
