# 🐒 Monkey VPN

> Swing through the jungle of the internet.

A high-security, gamified VPN with a **Lush Tropical Night** theme.
WireGuard for speed. OpenVPN for stubborn censors. AES-256-GCM data, RSA-4096 handshakes,
and **RAM-only servers** so there is literally no disk for logs.

This monorepo contains:

| Path | What it is | Stack |
| --- | --- | --- |
| `backend/` | REST API: auth, Territories, Agility Tests, profiles, gamification, WireGuard config generation | **Go** + Gin + SQLite (`modernc.org/sqlite`) + JWT + bcrypt |
| `web/` | Web client with full jungle UI | **React** + Vite + JavaScript + Tailwind + Framer Motion |
| `mobile/` | iOS + Android client with the same jungle UI | **React Native CLI** + JavaScript + React Navigation + Reanimated + react-native-svg |
| `infra/` | Docker Compose for local dev + Kubernetes manifests for production | Docker + K8s |

The web and mobile apps share the same API and the same jungle vocabulary
(Territories, Vines, Camo Mode, Double Jungle, Quick Swing, Survival Kit…).

---

## ✨ Feature tour

- **Golden Banana power button** — sleeping monkey when disconnected,
  swinging monkey while connecting, crowned monkey + neon jungle when connected.
- **Territories** (servers) — 15 seeded jungles across every continent.
- **Quick Swing** — finds the *Ripest Fruit* (lowest latency × load).
- **Monkey Agility Test** — synthetic ping/down/up scoring + history.
- **Survival Kit (Settings)** — toggles for **The Vines** kill switch,
  DNS leak protection, **Camo Mode** obfuscation, **Double Jungle** multi-hop,
  **Choose Your Path** split tunneling, protocol selector, auto-connect.
- **Expedition Briefing** — 4-screen jungle-metaphor onboarding.
- **My Monkey** — display name + unlockable avatars
  (Lemur, Capuchin, Spider, Orangutan, Silverback Gorilla, Mandrill)
  gated by **Stealth Level** and **Tier**.

---

## 🏗 Architecture

```
┌────────────┐       ┌──────────────────────────┐       ┌──────────────────────┐
│  React     │  ───▶ │  Go API (Gin + SQLite)   │  ───▶ │  WireGuard gateways  │
│  React-Native│      │  - JWT auth (HS256)      │       │  (RAM-only, k8s)     │
│            │      │  - Territories catalog   │       │                      │
│  Jungle UI │ ◀───  │  - Connection sessions   │ ◀───  │  Out-of-band probes  │
│            │      │  - Agility tests         │       │                      │
│            │      │  - WG keys + config gen  │       │                      │
└────────────┘       └──────────────────────────┘       └──────────────────────┘
```

### Privacy posture (production target)
- **AES-256-GCM** data channel via WireGuard (default), OpenVPN-AES-256-GCM as fallback.
- **RSA-4096** for OpenVPN TLS handshakes; Curve25519 keys for WireGuard.
- **RAM-only** server fleet — `emptyDir.medium=Memory` for state, no persistent disks.
- **Zero-Knowledge backend** — no logs of source IP, destination, or session metadata.
- **The Vines** (kill switch) and **DNS leak protection** enforced client-side.
- **Camo Mode** obfuscation via shadowsocks-style transport (stubbed in this repo).
- **Double Jungle** multi-hop schema is in the API (`second_territory_id`).

### What this repo *does* implement
- Full functional REST API (auth, territories, connection, agility, settings, gamification).
- Cryptographically valid WireGuard keypair generation and per-user `wg-quick` config rendering.
- Web + mobile clients with the full jungle UI/UX.
- Docker + Kubernetes deployment manifests (with RAM-only `emptyDir` for the API).

### What this repo intentionally *stubs*
- Real VPN tunnel establishment on user devices (the mobile/web apps **simulate** the connect flow against the API; turning that into a real tunnel needs the OS WireGuard client + your VPN gateway fleet).
- Real obfuscation transport (shadowsocks/obfs4) — feature-flagged in API + UI.
- Real RAM-only VPN gateway fleet (k8s manifests describe it; bring-up requires bare-metal nodes, BGP/Anycast, etc.).
- Subscriptions/billing (schema fields exist; no Stripe wiring).

A roadmap to closing each gap lives at the bottom of this README.

---

## 🚀 Run locally

### Option A — Docker Compose (one command)

```bash
cd infra
docker compose up --build
# Web:     http://localhost:5173
# API:     http://localhost:8080
```

### Option B — Run the parts directly

**Backend** (needs Go 1.23+):

```bash
cd backend
cp .env.example .env
go run .
# → Monkey VPN backend listening on :8080
```

The first run creates `monkey.db` and seeds 15 Territories.

**Web** (needs Node 18+):

```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

The web app reads `VITE_API_BASE` (default `http://localhost:8080`).

**Mobile** (needs the [React Native CLI environment](https://reactnative.dev/docs/set-up-your-environment)):

```bash
cd mobile
npm install
# iOS only:
cd ios && pod install && cd ..
# Then on a machine with the proper toolchain:
npm run android   # or: npm run ios
```

The mobile API base lives in `mobile/src/api.js`. Defaults to `http://10.0.2.2:8080`
(Android emulator → host loopback). Change to your LAN IP for a physical device,
or your production URL when you ship.

---

## 🌿 API quick reference

| Method | Path | Auth | What |
| --- | --- | --- | --- |
| GET | `/health` | — | Wakes the monkey |
| POST | `/api/v1/auth/register` | — | Plant a banana |
| POST | `/api/v1/auth/login` | — | Sign in |
| GET | `/api/v1/territories` | — | List Territories |
| GET | `/api/v1/quick-swing` | — | Ripest fruit (auto-pick) |
| GET | `/api/v1/me` | bearer | Profile |
| PATCH | `/api/v1/me` | bearer | Update display name |
| GET | `/api/v1/me/avatars` | bearer | Avatar catalog + unlock state |
| POST | `/api/v1/me/avatars/:slug/equip` | bearer | Wear a different monkey |
| POST | `/api/v1/connect` | bearer | Start a connection (returns WG details) |
| POST | `/api/v1/disconnect` | bearer | End any active connection |
| GET | `/api/v1/connection` | bearer | Current connection state |
| GET | `/api/v1/connection/wireguard.conf` | bearer | Download `wg-quick` config |
| POST | `/api/v1/agility-test` | bearer | Run a Monkey Agility Test |
| GET | `/api/v1/agility-test/history` | bearer | Last 50 agility runs |
| GET/PUT | `/api/v1/settings` | bearer | Read/write Survival Kit |

A 5-minute curl tour:

```bash
TOK=$(curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"banana@jungle.io","password":"hunter22","display_name":"Banana Joe"}' \
  | jq -r .token)

curl -s http://localhost:8080/api/v1/territories | jq '.territories[0]'

T=$(curl -s http://localhost:8080/api/v1/territories | jq -r '.territories[0].id')

curl -s -X POST http://localhost:8080/api/v1/connect \
  -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' \
  -d "{\"territory_id\":\"$T\"}" | jq

curl -s http://localhost:8080/api/v1/connection/wireguard.conf \
  -H "Authorization: Bearer $TOK"
```

---

## 🗺 Roadmap to a real VPN

1. **VPN gateway fleet.** Provision bare-metal or trusted-cloud nodes running WireGuard
   + a control-plane agent. Disk should be tmpfs only.
2. **Server registration.** Replace `seed/seed.go` with a control-plane that registers
   live gateways into the Territories table and refreshes load/latency every minute.
3. **Per-session peer programming.** On `POST /connect`, push the user's client public
   key to the chosen gateway via wgctrl (or SSH to `wg set`) and return the live
   server pubkey + endpoint.
4. **Real Agility Test.** Replace synthetic numbers with actual ICMP/UDP probes
   from the gateway side.
5. **Camo Mode.** Run an obfs4 / shadowsocks listener alongside WireGuard and
   route Camo connections through it.
6. **Double Jungle.** Chain two gateways via internal-only tunnels and program both
   on `POST /connect` when `multi_hop=true`.
7. **Mobile tunneling.** Wire the OS WireGuard client (`react-native-wireguard`,
   `wg-quick` import on Android, `NetworkExtension` on iOS) to ingest the
   `/connection/wireguard.conf` response.
8. **Audited zero-log policy.** Disable structured logging of session
   metadata; commission an external audit.
9. **Subscriptions.** Stripe + receipts → tier in the `users` table.
10. **Threat model + incident playbooks.** Because the jungle has predators too.

---

## 🎨 Design system

- Palette: Deep Forest `#0B3D2E`, Moss `#4F7942`, Tropical Gold `#FFD700`.
- Typography: Fredoka (display) + Inter (body) on web; system bold on mobile.
- Motion: framer-motion (web), Animated API + Reanimated (mobile).
- Voice: warm, curious, slightly cheeky — *"Pull the vine to disappear."*

---

Built for explorers. The jungle is a wild place — let the monkey guide you safely
through the canopy.
