export default function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer py-3">
      <span className="flex-1">
        <span className="block font-display text-gold-500">{label}</span>
        {hint && <span className="block text-sm text-moss-300 mt-0.5">{hint}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked) } }}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-gold-500' : 'bg-forest-700'} ring-1 ring-moss-500/40`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-canopy transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
    </label>
  )
}
