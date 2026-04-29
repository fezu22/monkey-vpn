import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Jungle from '../components/Jungle.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name)
      nav('/app')
    } catch (e) {
      setErr(e.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Jungle>
      <div className="min-h-screen grid place-items-center p-6">
        <div className="vine-border rounded-3xl bg-forest-800/50 max-w-md w-full p-8">
          <Link to="/" className="text-moss-300 text-sm">← Back to the canopy</Link>
          <h1 className="font-display text-3xl text-gold-500 mt-2">
            {mode === 'login' ? 'Welcome back, explorer.' : 'Join the troop.'}
          </h1>
          <p className="text-moss-300 mt-1 text-sm">
            {mode === 'login' ? 'Pull the right vine to swing in.' : 'Pick a banana, pick a password.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === 'register' && (
              <Field label="Display name" value={name} onChange={setName} placeholder="Banana Joe" />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="explorer@jungle.io" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" required />
            {err && <p className="text-red-300 text-sm">{err}</p>}
            <button
              disabled={busy}
              className="w-full rounded-full bg-gold-500 text-canopy font-display py-3 hover:bg-gold-400 disabled:opacity-60"
            >
              {busy ? 'Swinging…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}
            className="mt-4 text-sm text-moss-300 hover:text-gold-500 w-full text-center"
          >
            {mode === 'login' ? 'New here? Plant a banana →' : 'Already have an account? Sign in →'}
          </button>
        </div>
      </div>
    </Jungle>
  )
}

function Field({ label, value, onChange, ...rest }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-moss-300 mb-1">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-canopy/70 border border-moss-500/30 px-4 py-3 text-moss-100 placeholder:text-moss-500/50 focus:border-gold-500 focus:outline-none"
      />
    </label>
  )
}
