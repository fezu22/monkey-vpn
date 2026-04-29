package config

import (
	"os"
	"strings"
)

type Config struct {
	Env            string
	Port           string
	DBPath         string
	JWTSecret      string
	AllowedOrigins []string
}

func Load() Config {
	return Config{
		Env:            getenv("APP_ENV", "development"),
		Port:           getenv("PORT", "8080"),
		DBPath:         getenv("DB_PATH", "monkey.db"),
		JWTSecret:      getenv("JWT_SECRET", "jungle-secret-change-me"),
		AllowedOrigins: splitCSV(getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:19006")),
	}
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
