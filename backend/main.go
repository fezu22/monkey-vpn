package main

import (
	"log"
	"os"

	"github.com/fezu22/monkey-vpn/backend/internal/config"
	"github.com/fezu22/monkey-vpn/backend/internal/db"
	"github.com/fezu22/monkey-vpn/backend/internal/handlers"
	"github.com/fezu22/monkey-vpn/backend/internal/seed"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	store, err := db.Open(cfg.DBPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer store.Close()

	if err := db.Migrate(store); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	if err := seed.Territories(store); err != nil {
		log.Fatalf("seed territories: %v", err)
	}

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	h := handlers.New(store, cfg)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "monkey": "awake"})
	})

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
		}

		api.GET("/territories", h.ListTerritories)
		api.GET("/territories/:id", h.GetTerritory)

		// Quick Swing — find ripest fruit (lowest latency).
		api.GET("/quick-swing", h.QuickSwing)

		// Authenticated routes.
		authed := api.Group("")
		authed.Use(h.AuthRequired())
		{
			authed.GET("/me", h.Me)
			authed.PATCH("/me", h.UpdateMe)
			authed.GET("/me/avatars", h.ListAvatars)
			authed.POST("/me/avatars/:slug/equip", h.EquipAvatar)

			authed.POST("/connect", h.Connect)
			authed.POST("/disconnect", h.Disconnect)
			authed.GET("/connection", h.GetConnection)
			authed.GET("/connection/wireguard.conf", h.WireGuardConfig)

			authed.POST("/agility-test", h.AgilityTest)
			authed.GET("/agility-test/history", h.AgilityHistory)

			authed.GET("/settings", h.GetSettings)
			authed.PUT("/settings", h.UpdateSettings)
		}
	}

	addr := ":" + cfg.Port
	log.Printf("Monkey VPN backend listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server: %v", err)
		os.Exit(1)
	}
}
