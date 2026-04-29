package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/fezu22/monkey-vpn/backend/internal/auth"
	"github.com/fezu22/monkey-vpn/backend/internal/config"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	DB  *sql.DB
	Cfg config.Config
}

func New(db *sql.DB, cfg config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}

const tokenTTL = 24 * 7 * time.Hour

func (h *Handler) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := c.GetHeader("Authorization")
		if !strings.HasPrefix(raw, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		claims, err := auth.ParseToken(h.Cfg.JWTSecret, strings.TrimPrefix(raw, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}

func userID(c *gin.Context) string {
	v, _ := c.Get("user_id")
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
