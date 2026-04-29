package seed

import (
	"database/sql"

	"github.com/fezu22/monkey-vpn/backend/internal/wireguard"
	"github.com/google/uuid"
)

type territory struct {
	Name        string
	Region      string
	CountryCode string
	Flag        string
	Latency     int
	Load        int
	Obfuscation bool
	MultiHop    bool
	Tier        string
	Endpoint    string
	Tagline     string
}

func Territories(d *sql.DB) error {
	var n int
	if err := d.QueryRow(`SELECT COUNT(*) FROM territories`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}

	seeds := []territory{
		{"The Amazon", "South America", "BR", "🇧🇷", 42, 18, false, false, "explorer", "amazon.monkeyvpn.io:51820", "Where the canopy hides every footprint."},
		{"The Bamboo Forest", "Asia", "CN", "🇨🇳", 88, 64, true, false, "explorer", "bamboo.monkeyvpn.io:51820", "Slip past the Great Wall in silence."},
		{"The Congo Basin", "Africa", "CD", "🇨🇩", 110, 22, false, false, "explorer", "congo.monkeyvpn.io:51820", "Deep, dark, and impossible to track."},
		{"The Borneo Highlands", "Asia", "MY", "🇲🇾", 76, 41, false, false, "explorer", "borneo.monkeyvpn.io:51820", "Home of the orangutan stealth elders."},
		{"The Madagascar Reserve", "Africa", "MG", "🇲🇬", 95, 30, false, false, "explorer", "madagascar.monkeyvpn.io:51820", "Lemurs lead the way."},
		{"The Andes Cloud Forest", "South America", "PE", "🇵🇪", 68, 27, false, true, "wanderer", "andes.monkeyvpn.io:51820", "Hop above the clouds, twice."},
		{"The Tokyo Canopy", "Asia", "JP", "🇯🇵", 23, 55, true, false, "wanderer", "tokyo.monkeyvpn.io:51820", "Neon vines, zero logs."},
		{"The Reykjavik Glacier", "Europe", "IS", "🇮🇸", 31, 12, false, true, "wanderer", "reykjavik.monkeyvpn.io:51820", "Cold servers, hot privacy."},
		{"The Zurich Vault", "Europe", "CH", "🇨🇭", 18, 38, false, true, "silverback", "zurich.monkeyvpn.io:51820", "Swiss-grade jungle banking."},
		{"The Singapore Mangrove", "Asia", "SG", "🇸🇬", 29, 47, true, true, "silverback", "singapore.monkeyvpn.io:51820", "Roots so deep, no one finds you."},
		{"The Costa Rica Wilds", "North America", "CR", "🇨🇷", 52, 19, false, false, "explorer", "cr.monkeyvpn.io:51820", "Pura vida, pura privacidad."},
		{"The Pacific Northwest", "North America", "US", "🇺🇸", 12, 71, false, false, "explorer", "pnw.monkeyvpn.io:51820", "Old-growth privacy."},
		{"The Sahara Oasis", "Africa", "MA", "🇲🇦", 84, 24, true, false, "wanderer", "sahara.monkeyvpn.io:51820", "Mirages confuse the trackers."},
		{"The Galápagos Refuge", "South America", "EC", "🇪🇨", 78, 14, false, true, "silverback", "galapagos.monkeyvpn.io:51820", "Evolved beyond surveillance."},
		{"The Outback Bushland", "Oceania", "AU", "🇦🇺", 110, 33, false, false, "explorer", "outback.monkeyvpn.io:51820", "G'day, anonymous."},
	}

	for _, t := range seeds {
		priv, err := wireguard.NewPrivateKey()
		if err != nil {
			return err
		}
		_, err = d.Exec(`INSERT INTO territories
			(id, name, region, country_code, flag, latency_ms, load_pct, obfuscation, multi_hop, tier, endpoint, pubkey, tagline)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			uuid.NewString(), t.Name, t.Region, t.CountryCode, t.Flag, t.Latency, t.Load,
			t.Obfuscation, t.MultiHop, t.Tier, t.Endpoint, priv.PublicKey(), t.Tagline,
		)
		if err != nil {
			return err
		}
	}
	return nil
}
