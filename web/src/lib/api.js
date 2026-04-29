const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function authHeader() {
  const t = localStorage.getItem('mvpn.token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  let body
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) {
    const msg = body && body.error ? body.error : res.statusText
    const err = new Error(msg)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export const api = {
  health: () => req('/health'),
  register: (email, password, display_name) => req('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password, display_name }) }),
  login: (email, password) => req('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/api/v1/me'),
  updateMe: (patch) => req('/api/v1/me', { method: 'PATCH', body: JSON.stringify(patch) }),
  avatars: () => req('/api/v1/me/avatars'),
  equipAvatar: (slug) => req(`/api/v1/me/avatars/${slug}/equip`, { method: 'POST' }),

  territories: () => req('/api/v1/territories'),
  territory: (id) => req(`/api/v1/territories/${id}`),
  quickSwing: () => req('/api/v1/quick-swing'),

  connect: (territory_id, opts = {}) => req('/api/v1/connect', { method: 'POST', body: JSON.stringify({ territory_id, ...opts }) }),
  disconnect: () => req('/api/v1/disconnect', { method: 'POST' }),
  connection: () => req('/api/v1/connection'),
  wireguardConfigUrl: () => `${BASE}/api/v1/connection/wireguard.conf`,

  agility: (territory_id) => req('/api/v1/agility-test', { method: 'POST', body: JSON.stringify({ territory_id }) }),
  agilityHistory: () => req('/api/v1/agility-test/history'),

  settings: () => req('/api/v1/settings'),
  updateSettings: (s) => req('/api/v1/settings', { method: 'PUT', body: JSON.stringify(s) }),
}

export const tokenStorage = {
  set: (t) => localStorage.setItem('mvpn.token', t),
  clear: () => localStorage.removeItem('mvpn.token'),
  get: () => localStorage.getItem('mvpn.token'),
}
