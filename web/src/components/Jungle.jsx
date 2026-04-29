import { motion } from 'framer-motion'

/** Animated jungle backdrop: vines, fireflies, leaves. Lit when connected. */
export default function Jungle({ vibrant = false, children }) {
  const fireflies = Array.from({ length: 18 })
  return (
    <div className="relative min-h-full overflow-hidden bg-jungle-radial leaf-overlay">
      {/* Vines from the top */}
      <svg className="absolute inset-x-0 top-0 w-full h-40 opacity-70 pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vineG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0F4F3C" />
            <stop offset="1" stopColor="#4F7942" />
          </linearGradient>
        </defs>
        <path d="M0 0 C 200 80, 200 -20, 400 60 S 800 120, 1000 30 S 1200 100, 1200 0 L 1200 0 L 0 0 Z" fill="url(#vineG)" />
      </svg>

      {/* Fireflies */}
      {fireflies.map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${(i * 53) % 90 + 5}%`,
            left: `${(i * 37) % 95 + 2}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            background: vibrant ? '#FFE45C' : '#9DC986',
            boxShadow: vibrant ? '0 0 10px #FFE45C' : '0 0 6px #9DC986',
            opacity: 0.45,
          }}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -8, 0] }}
          transition={{ duration: 2 + (i % 5) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: (i * 0.13) % 2 }}
        />
      ))}

      {/* Big leaves left/right */}
      <Leaf className="absolute -left-10 top-1/3 w-72 -rotate-12 opacity-40" vibrant={vibrant} />
      <Leaf className="absolute -right-12 bottom-10 w-80 rotate-12 opacity-40" vibrant={vibrant} />

      <div className="relative z-10">{children}</div>
    </div>
  )
}

function Leaf({ className, vibrant }) {
  return (
    <svg viewBox="0 0 200 80" className={className}>
      <defs>
        <linearGradient id="leafG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={vibrant ? '#6B9C58' : '#0F4F3C'} />
          <stop offset="1" stopColor={vibrant ? '#9DC986' : '#13624A'} />
        </linearGradient>
      </defs>
      <path d="M5 40 C 60 -10, 160 -10, 195 40 C 160 90, 60 90, 5 40 Z" fill="url(#leafG)" />
      <path d="M10 40 L 190 40" stroke="#062418" strokeOpacity="0.6" strokeWidth="2" />
    </svg>
  )
}
