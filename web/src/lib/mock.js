// In-browser mock backend used only for the static demo build (VITE_DEMO=true).
// Mirrors the Go backend's API surface so the same UI works without a server.

const TERRITORIES = [
  ['t-amazon','The Amazon','South America','BR','🇧🇷',42,18,false,false,'explorer','amazon.monkeyvpn.io:51820','Where the canopy hides every footprint.'],
  ['t-bamboo','The Bamboo Forest','Asia','CN','🇨🇳',88,64,true,false,'explorer','bamboo.monkeyvpn.io:51820','Slip past the Great Wall in silence.'],
  ['t-congo','The Congo Basin','Africa','CD','🇨🇩',110,22,false,false,'explorer','congo.monkeyvpn.io:51820','Deep, dark, and impossible to track.'],
  ['t-borneo','The Borneo Highlands','Asia','MY','🇲🇾',76,41,false,false,'explorer','borneo.monkeyvpn.io:51820','Home of the orangutan stealth elders.'],
  ['t-mada','The Madagascar Reserve','Africa','MG','🇲🇬',95,30,false,false,'explorer','madagascar.monkeyvpn.io:51820','Lemurs lead the way.'],
  ['t-andes','The Andes Cloud Forest','South America','PE','🇵🇪',68,27,false,true,'wanderer','andes.monkeyvpn.io:51820','Hop above the clouds, twice.'],
  ['t-tokyo','The Tokyo Canopy','Asia','JP','🇯🇵',23,55,true,false,'wanderer','tokyo.monkeyvpn.io:51820','Neon vines, zero logs.'],
  ['t-rey','The Reykjavik Glacier','Europe','IS','🇮🇸',31,12,false,true,'wanderer','reykjavik.monkeyvpn.io:51820','Cold servers, hot privacy.'],
  ['t-zur','The Zurich Vault','Europe','CH','🇨🇭',18,38,false,true,'silverback','zurich.monkeyvpn.io:51820','Swiss-grade jungle banking.'],
  ['t-sg','The Singapore Mangrove','Asia','SG','🇸🇬',29,47,true,true,'silverback','singapore.monkeyvpn.io:51820','Roots so deep, no one finds you.'],
  ['t-cr','The Costa Rica Wilds','North America','CR','🇨🇷',52,19,false,false,'explorer','cr.monkeyvpn.io:51820','Pura vida, pura privacidad.'],
  ['t-pnw','The Pacific Northwest','North America','US','🇺🇸',12,71,false,false,'explorer','pnw.monkeyvpn.io:51820','Old-growth privacy.'],
  ['t-sah','The Sahara Oasis','Africa','MA','🇲🇦',84,24,true,false,'wanderer','sahara.monkeyvpn.io:51820','Mirages confuse the trackers.'],
  ['t-gal','The Galápagos Refuge','South America','EC','🇪🇨',78,14,false,true,'silverback','galapagos.monkeyvpn.io:51820','Evolved beyond surveillance.'],
  ['t-out','The Outback Bushland','Oceania','AU','🇦🇺',110,33,false,false,'explorer','outback.monkeyvpn.io:51820','G\u2019day, anonymous.'],
].map(([id,name,region,cc,flag,lat,load,obf,mh,tier,ep,tg]) => ({
  id,name,region,country_code:cc,flag,latency_ms:lat,load_pct:load,
  obfuscation:obf,multi_hop:mh,tier,endpoint:ep,
  pubkey:'DEMO+pubkey'+id,tagline:tg,
}))

const AVATARS = [
  {slug:'lemur',name:'Lemur Scout',description:'Quick, curious, the perfect rookie.',unlock_level:1,unlock_tier:'explorer'},
  {slug:'capuchin',name:'Capuchin Trickster',description:'Steals snacks and packets.',unlock_level:5,unlock_tier:'explorer'},
  {slug:'spider',name:'Spider Climber',description:'Reaches the highest canopies.',unlock_level:10,unlock_tier:'wanderer'},
  {slug:'orangutan',name:'Orangutan Sage',description:'Slow, deliberate, never seen.',unlock_level:20,unlock_tier:'wanderer'},
  {slug:'gorilla',name:'Silverback Guardian',description:'Protects the troop, fears nothing.',unlock_level:35,unlock_tier:'silverback'},
  {slug:'mandrill',name:'Mandrill Sentinel',description:'Painted for war, painted for stealth.',unlock_level:50,unlock_tier:'silverback'},
]

const KEY_USER = 'mvpn.demo.user'
const KEY_CONN = 'mvpn.demo.conn'
const KEY_SET  = 'mvpn.demo.settings'
const KEY_HIST = 'mvpn.demo.agility'

const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } }
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

function ensureUser() {
  const u = load(KEY_USER, null)
  if (u) return u
  const fresh = {id:'u-demo',email:'demo@jungle.io',display_name:'Demo Explorer',avatar_slug:'lemur',stealth_level:1,tier:'explorer'}
  save(KEY_USER, fresh)
  return fresh
}
function ensureSettings() {
  const s = load(KEY_SET, null)
  if (s) return s
  const fresh = {kill_switch:true,dns_leak_protection:true,camo_mode:false,multi_hop:false,split_tunnel_apps:[],auto_connect:false,protocol:'wireguard'}
  save(KEY_SET, fresh)
  return fresh
}

const tierRank = (t) => t === 'silverback' ? 3 : t === 'wanderer' ? 2 : 1

export async function mock(path, opts = {}) {
  await new Promise(r => setTimeout(r, 80))
  const method = (opts.method || 'GET').toUpperCase()
  const body = opts.body ? JSON.parse(opts.body) : null

  if (path === '/health') return {status:'ok',monkey:'awake'}

  if (path === '/api/v1/auth/register' || path === '/api/v1/auth/login') {
    const u = ensureUser()
    if (body?.display_name) { u.display_name = body.display_name; save(KEY_USER, u) }
    if (body?.email) { u.email = body.email; save(KEY_USER, u) }
    return {token: 'demo-token', user: u}
  }
  if (path === '/api/v1/me' && method === 'GET') return ensureUser()
  if (path === '/api/v1/me' && method === 'PATCH') {
    const u = ensureUser(); if (body?.display_name) u.display_name = body.display_name
    save(KEY_USER, u); return u
  }
  if (path === '/api/v1/me/avatars') {
    const u = ensureUser()
    return {avatars: AVATARS.map(a => ({...a, unlocked: u.stealth_level >= a.unlock_level && tierRank(u.tier) >= tierRank(a.unlock_tier)}))}
  }
  const equip = path.match(/^\/api\/v1\/me\/avatars\/(.+)\/equip$/)
  if (equip) {
    const u = ensureUser(); const a = AVATARS.find(x => x.slug === equip[1])
    if (!a || u.stealth_level < a.unlock_level || tierRank(u.tier) < tierRank(a.unlock_tier))
      throw Object.assign(new Error('this monkey is still hiding — level up first'), {status:403})
    u.avatar_slug = equip[1]; save(KEY_USER, u); return {avatar_slug: u.avatar_slug}
  }

  if (path === '/api/v1/territories') return {territories: TERRITORIES}
  const tMatch = path.match(/^\/api\/v1\/territories\/(.+)$/)
  if (tMatch) {
    const t = TERRITORIES.find(x => x.id === tMatch[1])
    if (!t) throw Object.assign(new Error('territory not found'), {status:404})
    return t
  }
  if (path === '/api/v1/quick-swing') {
    const t = [...TERRITORIES].sort((a,b) => (a.latency_ms+a.load_pct) - (b.latency_ms+b.load_pct))[0]
    return {territory: t, reason: 'ripest fruit (lowest latency × load)'}
  }

  if (path === '/api/v1/connect') {
    const t = TERRITORIES.find(x => x.id === body.territory_id)
    if (!t) throw Object.assign(new Error('territory not found'), {status:404})
    const conn = {
      id: 'conn-' + Math.random().toString(36).slice(2, 10),
      active: true, territory: t,
      obfuscation: !!body.obfuscation, multi_hop: !!body.multi_hop,
      client_address: '10.66.66.' + (Math.floor(Math.random()*250)+2) + '/32',
      client_public_key: 'DEMO+clientpub',
      started_at: new Date().toISOString(),
    }
    save(KEY_CONN, conn)
    const u = ensureUser(); u.stealth_level = (u.stealth_level||1) + 1; save(KEY_USER, u)
    return conn
  }
  if (path === '/api/v1/disconnect') {
    save(KEY_CONN, null); return {closed: 1}
  }
  if (path === '/api/v1/connection') {
    const c = load(KEY_CONN, null); return c || {active: false}
  }

  if (path === '/api/v1/agility-test') {
    const t = TERRITORIES.find(x => x.id === body.territory_id)
    if (!t) throw Object.assign(new Error('territory not found'), {status:404})
    const ping = Math.max(5, t.latency_ms + (Math.floor(Math.random()*15) - 7))
    const dl = Math.max(50, 950 - t.load_pct*7 - Math.random()*50)
    const ul = dl * 0.45
    const score = Math.max(1, 1000 - ping*2 - Math.round(1000 - dl) - t.load_pct)
    const verdict = score >= 800 ? '🦍 Silverback grade — untouchable.'
      : score >= 600 ? '🐒 Swift swinger — solid territory.'
      : score >= 400 ? '🐵 Steady climber — good enough.'
      : score >= 200 ? '🐾 Lazy sloth pace — try another territory.'
      : '🪨 Stuck in the mud — pick somewhere else.'
    const row = {id:'a-'+Date.now(), territory_id:t.id, territory_name:t.name, ping_ms:ping, download_mbps:dl, upload_mbps:ul, score, created_at:new Date().toISOString()}
    const hist = [row, ...load(KEY_HIST, [])].slice(0, 50)
    save(KEY_HIST, hist)
    return {id:row.id, territory:t, ping_ms:ping, download_mbps:dl, upload_mbps:ul, score, verdict}
  }
  if (path === '/api/v1/agility-test/history') {
    return {history: load(KEY_HIST, [])}
  }

  if (path === '/api/v1/settings' && method === 'GET') return ensureSettings()
  if (path === '/api/v1/settings' && method === 'PUT') { save(KEY_SET, body); return body }

  throw Object.assign(new Error('not found in demo'), {status: 404})
}
