package handlers

import (
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type agilityReq struct {
	TerritoryID string `json:"territory_id" binding:"required"`
}

// AgilityTest simulates a Monkey Agility Test (latency + speed) for a territory.
// In production this would coordinate a real probe; here we synthesize plausible
// numbers from the territory's stored latency and load values.
func (h *Handler) AgilityTest(c *gin.Context) {
	uid := userID(c)
	var req agilityReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	t, err := h.fetchTerritory(req.TerritoryID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "territory not found"})
		return
	}
	jitter := rand.Intn(15) - 7
	ping := t.Latency + jitter
	if ping < 5 {
		ping = 5
	}
	dl := 950.0 - float64(t.Load)*7 - float64(rand.Intn(50))
	if dl < 50 {
		dl = 50
	}
	ul := dl * 0.45
	score := 1000 - ping*2 - int(1000-dl) - t.Load
	if score < 1 {
		score = 1
	}

	id := uuid.NewString()
	if _, err := h.DB.Exec(`INSERT INTO agility_tests
		(id, user_id, territory_id, ping_ms, download_mbps, upload_mbps, score)
		VALUES (?,?,?,?,?,?,?)`,
		id, uid, t.ID, ping, dl, ul, score); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":            id,
		"territory":     t,
		"ping_ms":       ping,
		"download_mbps": dl,
		"upload_mbps":   ul,
		"score":         score,
		"verdict":       agilityVerdict(score),
	})
}

func agilityVerdict(s int) string {
	switch {
	case s >= 800:
		return "🦍 Silverback grade — untouchable."
	case s >= 600:
		return "🐒 Swift swinger — solid territory."
	case s >= 400:
		return "🐵 Steady climber — good enough."
	case s >= 200:
		return "🐾 Lazy sloth pace — try another territory."
	default:
		return "🪨 Stuck in the mud — pick somewhere else."
	}
}

func (h *Handler) AgilityHistory(c *gin.Context) {
	uid := userID(c)
	rows, err := h.DB.Query(`SELECT a.id, a.territory_id, t.name, a.ping_ms, a.download_mbps,
		a.upload_mbps, a.score, a.created_at
		FROM agility_tests a JOIN territories t ON t.id = a.territory_id
		WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 50`, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	type row struct {
		ID            string  `json:"id"`
		TerritoryID   string  `json:"territory_id"`
		TerritoryName string  `json:"territory_name"`
		PingMs        int     `json:"ping_ms"`
		DownloadMbps  float64 `json:"download_mbps"`
		UploadMbps    float64 `json:"upload_mbps"`
		Score         int     `json:"score"`
		CreatedAt     string  `json:"created_at"`
	}
	out := []row{}
	for rows.Next() {
		var r row
		if err := rows.Scan(&r.ID, &r.TerritoryID, &r.TerritoryName, &r.PingMs,
			&r.DownloadMbps, &r.UploadMbps, &r.Score, &r.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, r)
	}
	c.JSON(http.StatusOK, gin.H{"history": out})
}
