package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

func Open(path string) (*sql.DB, error) {
	d, err := sql.Open("sqlite", path+"?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)")
	if err != nil {
		return nil, err
	}
	if err := d.Ping(); err != nil {
		return nil, err
	}
	return d, nil
}

func Migrate(d *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			display_name TEXT NOT NULL,
			avatar_slug TEXT NOT NULL DEFAULT 'lemur',
			stealth_level INTEGER NOT NULL DEFAULT 1,
			tier TEXT NOT NULL DEFAULT 'explorer',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS territories (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			region TEXT NOT NULL,
			country_code TEXT NOT NULL,
			flag TEXT NOT NULL,
			latency_ms INTEGER NOT NULL,
			load_pct INTEGER NOT NULL,
			obfuscation BOOLEAN NOT NULL DEFAULT 0,
			multi_hop BOOLEAN NOT NULL DEFAULT 0,
			tier TEXT NOT NULL DEFAULT 'explorer',
			endpoint TEXT NOT NULL,
			pubkey TEXT NOT NULL,
			tagline TEXT NOT NULL DEFAULT ''
		)`,
		`CREATE TABLE IF NOT EXISTS connections (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			territory_id TEXT NOT NULL,
			second_territory_id TEXT,
			obfuscation BOOLEAN NOT NULL DEFAULT 0,
			multi_hop BOOLEAN NOT NULL DEFAULT 0,
			client_pubkey TEXT NOT NULL,
			client_privkey TEXT NOT NULL,
			client_address TEXT NOT NULL,
			started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			ended_at TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(territory_id) REFERENCES territories(id)
		)`,
		`CREATE TABLE IF NOT EXISTS agility_tests (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			territory_id TEXT NOT NULL,
			ping_ms INTEGER NOT NULL,
			download_mbps REAL NOT NULL,
			upload_mbps REAL NOT NULL,
			score INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS settings (
			user_id TEXT PRIMARY KEY,
			kill_switch BOOLEAN NOT NULL DEFAULT 1,
			dns_leak_protection BOOLEAN NOT NULL DEFAULT 1,
			camo_mode BOOLEAN NOT NULL DEFAULT 0,
			multi_hop BOOLEAN NOT NULL DEFAULT 0,
			split_tunnel_apps TEXT NOT NULL DEFAULT '[]',
			auto_connect BOOLEAN NOT NULL DEFAULT 0,
			protocol TEXT NOT NULL DEFAULT 'wireguard',
			FOREIGN KEY(user_id) REFERENCES users(id)
		)`,
	}
	for _, s := range stmts {
		if _, err := d.Exec(s); err != nil {
			return err
		}
	}
	return nil
}
