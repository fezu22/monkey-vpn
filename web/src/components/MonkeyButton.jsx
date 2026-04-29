import { motion, AnimatePresence } from 'framer-motion'

/**
 * Golden Banana power button.
 *  - disconnected: monkey sleeping, jungle dim
 *  - connecting:   monkey swinging through trees
 *  - connected:    monkey wearing a crown, glow on
 */
export default function MonkeyButton({ state = 'disconnected', onClick }) {
  const isConnected = state === 'connected'
  const isConnecting = state === 'connecting'
  const label =
    state === 'connected' ? 'Tap the banana to disconnect'
    : state === 'connecting' ? 'Swinging through the canopy…'
    : 'Pull the vine to connect'

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.03 }}
        className={[
          'relative grid place-items-center rounded-full',
          'w-64 h-64 md:w-72 md:h-72',
          'bg-gradient-to-br from-forest-700 to-canopy',
          'ring-1 ring-moss-500/30',
          isConnected ? 'shadow-glow' : isConnecting ? 'shadow-glowSoft' : 'shadow-vine',
          'transition-shadow duration-700',
        ].join(' ')}
        aria-label={label}
      >
        {/* Vine that hangs above */}
        <svg className="absolute -top-24 left-1/2 -translate-x-1/2 w-2 h-24 opacity-70" viewBox="0 0 4 100">
          <path d="M2 0 Q 4 25 2 50 T 2 100" stroke="#4F7942" strokeWidth="2" fill="none" />
        </svg>

        {/* Aura when connected */}
        <AnimatePresence>
          {isConnected && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 0.6 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.45), transparent 65%)' }}
            />
          )}
        </AnimatePresence>

        <Monkey state={state} />

        {/* Banana ring */}
        <span className="pointer-events-none absolute inset-0 rounded-full" style={{
          boxShadow: isConnected ? 'inset 0 0 0 4px #FFD700' : 'inset 0 0 0 2px rgba(255,215,0,0.35)',
        }} />
      </motion.button>

      <div className="text-center">
        <p className="font-display text-2xl text-gold-500">
          {state === 'connected' ? 'Connected — the jungle hides you' : state === 'connecting' ? 'Connecting…' : 'Disconnected'}
        </p>
        <p className="text-moss-300 text-sm mt-1">{label}</p>
      </div>
    </div>
  )
}

function Monkey({ state }) {
  if (state === 'connecting') {
    return (
      <div className="relative w-44 h-44">
        <motion.div
          className="absolute inset-0 grid place-items-center"
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MonkeyBody crowned={false} />
        </motion.div>
      </div>
    )
  }
  if (state === 'connected') {
    return (
      <motion.div
        className="w-44 h-44 grid place-items-center"
        initial={{ scale: 0.8, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 12 }}
      >
        <MonkeyBody crowned />
      </motion.div>
    )
  }
  return (
    <motion.div
      className="w-44 h-44 grid place-items-center"
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MonkeyBody sleeping />
    </motion.div>
  )
}

function MonkeyBody({ crowned, sleeping }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="furG" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#5C3A1A" />
          <stop offset="1" stopColor="#2E1A0A" />
        </radialGradient>
        <linearGradient id="crownG" x1="0" x2="1">
          <stop offset="0" stopColor="#FFE45C" />
          <stop offset="1" stopColor="#D4A700" />
        </linearGradient>
      </defs>
      {/* ears */}
      <circle cx="50" cy="80" r="22" fill="url(#furG)" />
      <circle cx="150" cy="80" r="22" fill="url(#furG)" />
      <circle cx="50" cy="80" r="10" fill="#E8C8A2" />
      <circle cx="150" cy="80" r="10" fill="#E8C8A2" />
      {/* head */}
      <circle cx="100" cy="100" r="62" fill="url(#furG)" />
      {/* face */}
      <ellipse cx="100" cy="120" rx="38" ry="32" fill="#E8C8A2" />
      {/* eyes */}
      {sleeping ? (
        <>
          <path d="M75 100 q10 -8 20 0" stroke="#1B1209" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M105 100 q10 -8 20 0" stroke="#1B1209" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="85" cy="105" r="5" fill="#1B1209" />
          <circle cx="115" cy="105" r="5" fill="#1B1209" />
        </>
      )}
      {/* nose */}
      <ellipse cx="100" cy="125" rx="4" ry="3" fill="#1B1209" />
      {/* mouth */}
      {crowned ? (
        <path d="M85 138 q15 12 30 0" stroke="#1B1209" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : sleeping ? (
        <path d="M88 138 q12 4 24 0" stroke="#1B1209" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M88 138 q12 8 24 0" stroke="#1B1209" strokeWidth="3" fill="none" strokeLinecap="round"/>
      )}
      {/* zzz when sleeping */}
      {sleeping && (
        <g fill="#9DC986" opacity="0.8" fontFamily="Fredoka" fontSize="14">
          <text x="158" y="60">z</text>
          <text x="170" y="48">Z</text>
          <text x="180" y="36">Z</text>
        </g>
      )}
      {/* crown when connected */}
      {crowned && (
        <g>
          <path d="M58 60 L 78 30 L 95 55 L 100 25 L 105 55 L 122 30 L 142 60 Z" fill="url(#crownG)" stroke="#7A5A00" strokeWidth="2" />
          <circle cx="100" cy="42" r="5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  )
}
