export default function Card({ title, eyebrow, action, children, className = '' }) {
  return (
    <section className={`vine-border rounded-2xl bg-forest-800/40 backdrop-blur p-5 ${className}`}>
      {(title || action) && (
        <header className="flex items-end justify-between gap-3 mb-3">
          <div>
            {eyebrow && <p className="text-xs uppercase tracking-widest text-moss-300">{eyebrow}</p>}
            {title && <h2 className="font-display text-xl text-gold-500">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
