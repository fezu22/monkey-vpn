package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Territory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Region      string `json:"region"`
	CountryCode string `json:"country_code"`
	Flag        string `json:"flag"`
	Latency     int    `json:"latency_ms"`
	Load        int    `json:"load_pct"`
	Obfuscation bool   `json:"obfuscation"`
	MultiHop    bool   `json:"multi_hop"`
	Tier        string `json:"tier"`
	Endpoint    string `json:"endpoint"`
	Pubkey      string `json:"pubkey"`
	Tagline     string `json:"tagline"`
}

func (h *Handler) ListTerritories(c *gin.Context) {
	rows, err := h.DB.Query(`SELECT id, name, region, country_code, flag, latency_ms, load_pct,
		obfuscation, multi_hop, tier, endpoint, pubkey, tagline FROM territories ORDER BY latency_ms`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	out := []Territory{}
	for rows.Next() {
		var t Territory
		if err := rows.Scan(&t.ID, &t.Name, &t.Region, &t.CountryCode, &t.Flag, &t.Latency, &t.Load,
			&t.Obfuscation, &t.MultiHop, &t.Tier, &t.Endpoint, &t.Pubkey, &t.Tagline); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, t)
	}
	c.JSON(http.StatusOK, gin.H{"territories": out})
}

func (h *Handler) GetTerritory(c *gin.Context) {
	id := c.Param("id")
	var t Territory
	err := h.DB.QueryRow(`SELECT id, name, region, country_code, flag, latency_ms, load_pct,
		obfuscation, multi_hop, tier, endpoint, pubkey, tagline FROM territories WHERE id = ?`, id).
		Scan(&t.ID, &t.Name, &t.Region, &t.CountryCode, &t.Flag, &t.Latency, &t.Load,
			&t.Obfuscation, &t.MultiHop, &t.Tier, &t.Endpoint, &t.Pubkey, &t.Tagline)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "territory not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, t)
}

// QuickSwing returns the lowest-latency territory ("ripest fruit").
func (h *Handler) QuickSwing(c *gin.Context) {
	var t Territory
	err := h.DB.QueryRow(`SELECT id, name, region, country_code, flag, latency_ms, load_pct,
		obfuscation, multi_hop, tier, endpoint, pubkey, tagline FROM territories
		ORDER BY latency_ms + load_pct ASC LIMIT 1`).
		Scan(&t.ID, &t.Name, &t.Region, &t.CountryCode, &t.Flag, &t.Latency, &t.Load,
			&t.Obfuscation, &t.MultiHop, &t.Tier, &t.Endpoint, &t.Pubkey, &t.Tagline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"territory": t, "reason": "ripest fruit (lowest latency × load)"})
}
