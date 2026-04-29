package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/fezu22/monkey-vpn/backend/internal/wireguard"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type connectReq struct {
	TerritoryID       string `json:"territory_id" binding:"required"`
	SecondTerritoryID string `json:"second_territory_id"`
	Obfuscation       bool   `json:"obfuscation"`
	MultiHop          bool   `json:"multi_hop"`
}

func (h *Handler) Connect(c *gin.Context) {
	uid := userID(c)
	var req connectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Close any existing active connection.
	if _, err := h.DB.Exec(`UPDATE connections SET ended_at = CURRENT_TIMESTAMP
		WHERE user_id = ? AND ended_at IS NULL`, uid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	priv, err := wireguard.NewPrivateKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	clientAddr := fmt.Sprintf("10.66.66.%d/32", rand.Intn(250)+2)

	id := uuid.NewString()
	var second any
	if req.MultiHop && req.SecondTerritoryID != "" {
		second = req.SecondTerritoryID
	}
	_, err = h.DB.Exec(`INSERT INTO connections
		(id, user_id, territory_id, second_territory_id, obfuscation, multi_hop, client_pubkey, client_privkey, client_address)
		VALUES (?,?,?,?,?,?,?,?,?)`,
		id, uid, req.TerritoryID, second, req.Obfuscation, req.MultiHop,
		priv.PublicKey(), priv.String(), clientAddr,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Bump stealth level a little for connecting.
	_, _ = h.DB.Exec(`UPDATE users SET stealth_level = stealth_level + 1 WHERE id = ?`, uid)

	h.respondConnection(c, id)
}

func (h *Handler) Disconnect(c *gin.Context) {
	uid := userID(c)
	res, err := h.DB.Exec(`UPDATE connections SET ended_at = CURRENT_TIMESTAMP
		WHERE user_id = ? AND ended_at IS NULL`, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n, _ := res.RowsAffected()
	c.JSON(http.StatusOK, gin.H{"closed": n})
}

func (h *Handler) GetConnection(c *gin.Context) {
	uid := userID(c)
	var id string
	err := h.DB.QueryRow(`SELECT id FROM connections WHERE user_id = ? AND ended_at IS NULL
		ORDER BY started_at DESC LIMIT 1`, uid).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusOK, gin.H{"active": false})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	h.respondConnection(c, id)
}

type connectionView struct {
	ID                string     `json:"id"`
	Active            bool       `json:"active"`
	Territory         Territory  `json:"territory"`
	SecondTerritory   *Territory `json:"second_territory,omitempty"`
	Obfuscation       bool       `json:"obfuscation"`
	MultiHop          bool       `json:"multi_hop"`
	ClientAddress     string     `json:"client_address"`
	ClientPublicKey   string     `json:"client_public_key"`
	StartedAt         string     `json:"started_at"`
}

func (h *Handler) respondConnection(c *gin.Context, id string) {
	uid := userID(c)
	var (
		tID, addr, pub, started string
		secondID                sql.NullString
		obf, mh                 bool
	)
	err := h.DB.QueryRow(`SELECT territory_id, second_territory_id, obfuscation, multi_hop,
		client_address, client_pubkey, started_at FROM connections WHERE id = ? AND user_id = ?`,
		id, uid).Scan(&tID, &secondID, &obf, &mh, &addr, &pub, &started)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	t, err := h.fetchTerritory(tID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	view := connectionView{
		ID: id, Active: true, Territory: t,
		Obfuscation: obf, MultiHop: mh,
		ClientAddress: addr, ClientPublicKey: pub, StartedAt: started,
	}
	if secondID.Valid {
		s, err := h.fetchTerritory(secondID.String)
		if err == nil {
			view.SecondTerritory = &s
		}
	}
	c.JSON(http.StatusOK, view)
}

func (h *Handler) fetchTerritory(id string) (Territory, error) {
	var t Territory
	err := h.DB.QueryRow(`SELECT id, name, region, country_code, flag, latency_ms, load_pct,
		obfuscation, multi_hop, tier, endpoint, pubkey, tagline FROM territories WHERE id = ?`, id).
		Scan(&t.ID, &t.Name, &t.Region, &t.CountryCode, &t.Flag, &t.Latency, &t.Load,
			&t.Obfuscation, &t.MultiHop, &t.Tier, &t.Endpoint, &t.Pubkey, &t.Tagline)
	return t, err
}

func (h *Handler) WireGuardConfig(c *gin.Context) {
	uid := userID(c)
	var (
		tID, addr, priv string
	)
	err := h.DB.QueryRow(`SELECT territory_id, client_address, client_privkey FROM connections
		WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1`, uid).
		Scan(&tID, &addr, &priv)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "no active connection"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	t, err := h.fetchTerritory(tID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	conf := wireguard.Render(wireguard.Config{
		ClientPrivKey: priv,
		ClientAddress: addr,
		PeerPubKey:    t.Pubkey,
		PeerEndpoint:  t.Endpoint,
	})
	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=\"monkey-vpn.conf\"")
	c.String(http.StatusOK, conf)
}
