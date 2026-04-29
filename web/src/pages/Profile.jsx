import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'

const monkeyEmoji = {
  lemur: '🦝', capuchin: '🐒', spider: '🕷️', orangutan: '🦧', gorilla: '🦍', mandrill: '🐵',
}

export default function Profile() {
  const { user, refresh } = useAuth()
  const [avatars, setAvatars] = useState([])
  const [name, setName] = useState(user?.display_name || '')

  useEffect(() => { api.avatars().then(r => setAvatars(r.avatars)) }, [user])

  const equip = async (slug) => {
    await api.equipAvatar(slug)
    await refresh()
    setAvatars((await api.avatars()).avatars)
  }
  const saveName = async (e) => {
    e.preventDefault()
    await api.updateMe({ display_name: name })
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-moss-300 uppercase tracking-[0.3em] text-xs">My Monkey</p>
        <h1 className="font-display text-3xl text-gold-500">Profile & gamification</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        <Card title="The Explorer" eyebrow="You">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 grid place-items-center rounded-full bg-canopy/70 ring-2 ring-gold-500/40 text-5xl">
              {monkeyEmoji[user?.avatar_slug] || '🐒'}
            </div>
            <div>
              <p className="font-display text-xl text-gold-500">{user?.display_name}</p>
              <p className="text-sm text-moss-300">{user?.email}</p>
              <p className="text-xs text-moss-300 mt-1">Tier: <span className="text-gold-500">{user?.tier}</span> · Stealth Lv {user?.stealth_level}</p>
            </div>
          </div>

          <form onSubmit={saveName} className="mt-5 flex gap-2">
            <input
              value={name} onChange={e => setName(e.target.value)}
              className="flex-1 rounded-xl bg-canopy/70 border border-moss-500/30 px-3 py-2 text-moss-100"
            />
            <button className="rounded-full bg-gold-500 text-canopy font-display px-4 py-2 hover:bg-gold-400">Save</button>
          </form>
        </Card>

        <Card title="Unlock more monkeys" eyebrow="Avatars">
          <div className="grid sm:grid-cols-2 gap-3">
            {avatars.map(a => (
              <button
                key={a.slug}
                disabled={!a.unlocked}
                onClick={() => equip(a.slug)}
                className={`text-left rounded-xl p-3 vine-border transition ${a.unlocked ? 'hover:bg-forest-700' : 'opacity-50 cursor-not-allowed'} ${user?.avatar_slug === a.slug ? 'ring-2 ring-gold-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{monkeyEmoji[a.slug] || '🐒'}</div>
                  <div className="flex-1">
                    <p className="font-display text-gold-500">{a.name}</p>
                    <p className="text-xs text-moss-300">{a.description}</p>
                  </div>
                  {!a.unlocked && (
                    <span className="text-xs text-moss-300">Lv {a.unlock_level} · {a.unlock_tier}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
