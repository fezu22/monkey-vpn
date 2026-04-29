package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/fezu22/monkey-vpn/backend/internal/auth"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type registerReq struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	DisplayName string `json:"display_name"`
}

func (h *Handler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash failed"})
		return
	}
	id := uuid.NewString()
	display := req.DisplayName
	if display == "" {
		display = strings.Split(req.Email, "@")[0]
	}
	_, err = h.DB.Exec(`INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
		id, strings.ToLower(req.Email), hash, display)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			c.JSON(http.StatusConflict, gin.H{"error": "email already swinging in this jungle"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if _, err := h.DB.Exec(`INSERT INTO settings (user_id) VALUES (?)`, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	tok, err := auth.IssueToken(h.Cfg.JWTSecret, id, tokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"token": tok,
		"user": gin.H{
			"id": id, "email": strings.ToLower(req.Email), "display_name": display,
			"avatar_slug": "lemur", "stealth_level": 1, "tier": "explorer",
		},
	})
}

type loginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var (
		id, hash, display, avatar, tier string
		stealth                         int
	)
	err := h.DB.QueryRow(`SELECT id, password_hash, display_name, avatar_slug, stealth_level, tier
		FROM users WHERE email = ?`, strings.ToLower(req.Email)).
		Scan(&id, &hash, &display, &avatar, &stealth, &tier)
	if errors.Is(err, sql.ErrNoRows) || !auth.CheckPassword(hash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wrong vine, try again"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	tok, err := auth.IssueToken(h.Cfg.JWTSecret, id, tokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"token": tok,
		"user": gin.H{
			"id": id, "email": strings.ToLower(req.Email), "display_name": display,
			"avatar_slug": avatar, "stealth_level": stealth, "tier": tier,
		},
	})
}

func (h *Handler) Me(c *gin.Context) {
	uid := userID(c)
	var (
		email, display, avatar, tier string
		stealth                      int
	)
	err := h.DB.QueryRow(`SELECT email, display_name, avatar_slug, stealth_level, tier
		FROM users WHERE id = ?`, uid).
		Scan(&email, &display, &avatar, &stealth, &tier)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id": uid, "email": email, "display_name": display,
		"avatar_slug": avatar, "stealth_level": stealth, "tier": tier,
	})
}

type updateMeReq struct {
	DisplayName *string `json:"display_name"`
}

func (h *Handler) UpdateMe(c *gin.Context) {
	uid := userID(c)
	var req updateMeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.DisplayName != nil {
		if _, err := h.DB.Exec(`UPDATE users SET display_name = ? WHERE id = ?`, *req.DisplayName, uid); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	h.Me(c)
}

// Avatar list — unlocks based on stealth_level.
type avatarInfo struct {
	Slug          string `json:"slug"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	UnlockLevel   int    `json:"unlock_level"`
	UnlockTier    string `json:"unlock_tier"`
	Unlocked      bool   `json:"unlocked"`
}

var avatars = []avatarInfo{
	{Slug: "lemur", Name: "Lemur Scout", Description: "Quick, curious, the perfect rookie.", UnlockLevel: 1, UnlockTier: "explorer"},
	{Slug: "capuchin", Name: "Capuchin Trickster", Description: "Steals snacks and packets.", UnlockLevel: 5, UnlockTier: "explorer"},
	{Slug: "spider", Name: "Spider Climber", Description: "Reaches the highest canopies.", UnlockLevel: 10, UnlockTier: "wanderer"},
	{Slug: "orangutan", Name: "Orangutan Sage", Description: "Slow, deliberate, never seen.", UnlockLevel: 20, UnlockTier: "wanderer"},
	{Slug: "gorilla", Name: "Silverback Guardian", Description: "Protects the troop, fears nothing.", UnlockLevel: 35, UnlockTier: "silverback"},
	{Slug: "mandrill", Name: "Mandrill Sentinel", Description: "Painted for war, painted for stealth.", UnlockLevel: 50, UnlockTier: "silverback"},
}

func (h *Handler) ListAvatars(c *gin.Context) {
	uid := userID(c)
	var stealth int
	var tier string
	if err := h.DB.QueryRow(`SELECT stealth_level, tier FROM users WHERE id = ?`, uid).Scan(&stealth, &tier); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	out := make([]avatarInfo, len(avatars))
	for i, a := range avatars {
		a.Unlocked = stealth >= a.UnlockLevel && tierRank(tier) >= tierRank(a.UnlockTier)
		out[i] = a
	}
	c.JSON(http.StatusOK, gin.H{"avatars": out})
}

func (h *Handler) EquipAvatar(c *gin.Context) {
	uid := userID(c)
	slug := c.Param("slug")
	var stealth int
	var tier string
	if err := h.DB.QueryRow(`SELECT stealth_level, tier FROM users WHERE id = ?`, uid).Scan(&stealth, &tier); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for _, a := range avatars {
		if a.Slug == slug {
			if stealth < a.UnlockLevel || tierRank(tier) < tierRank(a.UnlockTier) {
				c.JSON(http.StatusForbidden, gin.H{"error": "this monkey is still hiding — level up first"})
				return
			}
			if _, err := h.DB.Exec(`UPDATE users SET avatar_slug = ? WHERE id = ?`, slug, uid); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"avatar_slug": slug})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "no such monkey"})
}

func tierRank(t string) int {
	switch t {
	case "silverback":
		return 3
	case "wanderer":
		return 2
	default:
		return 1
	}
}
