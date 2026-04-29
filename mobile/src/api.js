import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://10.0.2.2:8080'; // Android emulator → host loopback. Override per-build for prod.
const TOKEN_KEY = 'mvpn.token';

export const tokenStorage = {
  set: (t) => AsyncStorage.setItem(TOKEN_KEY, t),
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
};

async function authHeader() {
  const t = await tokenStorage.get();
  return t ? {Authorization: `Bearer ${t}`} : {};
}

async function req(path, opts = {}) {
  const auth = await authHeader();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...auth,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = body && body.error ? body.error : res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  health: () => req('/health'),
  register: (email, password, display_name) =>
    req('/api/v1/auth/register', {method: 'POST', body: JSON.stringify({email, password, display_name})}),
  login: (email, password) =>
    req('/api/v1/auth/login', {method: 'POST', body: JSON.stringify({email, password})}),
  me: () => req('/api/v1/me'),
  avatars: () => req('/api/v1/me/avatars'),
  equipAvatar: (slug) => req(`/api/v1/me/avatars/${slug}/equip`, {method: 'POST'}),
  territories: () => req('/api/v1/territories'),
  quickSwing: () => req('/api/v1/quick-swing'),
  connect: (territory_id, opts = {}) =>
    req('/api/v1/connect', {method: 'POST', body: JSON.stringify({territory_id, ...opts})}),
  disconnect: () => req('/api/v1/disconnect', {method: 'POST'}),
  connection: () => req('/api/v1/connection'),
  agility: (territory_id) =>
    req('/api/v1/agility-test', {method: 'POST', body: JSON.stringify({territory_id})}),
  agilityHistory: () => req('/api/v1/agility-test/history'),
  settings: () => req('/api/v1/settings'),
  updateSettings: (s) => req('/api/v1/settings', {method: 'PUT', body: JSON.stringify(s)}),
};
