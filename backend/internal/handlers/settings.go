package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Settings struct {
	KillSwitch        bool     `json:"kill_switch"`
	DNSLeakProtection bool     `json:"dns_leak_protection"`
	CamoMode          bool     `json:"camo_mode"`
	MultiHop          bool     `json:"multi_hop"`
	SplitTunnelApps   []string `json:"split_tunnel_apps"`
	AutoConnect       bool     `json:"auto_connect"`
	Protocol          string   `json:"protocol"`
}

func (h *Handler) GetSettings(c *gin.Context) {
	uid := userID(c)
	var (
		s     Settings
		split string
	)
	err := h.DB.QueryRow(`SELECT kill_switch, dns_leak_protection, camo_mode, multi_hop,
		split_tunnel_apps, auto_connect, protocol FROM settings WHERE user_id = ?`, uid).
		Scan(&s.KillSwitch, &s.DNSLeakProtection, &s.CamoMode, &s.MultiHop,
			&split, &s.AutoConnect, &s.Protocol)
	if err != nil {
		// Lazily create defaults if missing.
		if _, ierr := h.DB.Exec(`INSERT INTO settings (user_id) VALUES (?)`, uid); ierr == nil {
			s = Settings{
				KillSwitch: true, DNSLeakProtection: true,
				SplitTunnelApps: []string{}, Protocol: "wireguard",
			}
			c.JSON(http.StatusOK, s)
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if split == "" {
		split = "[]"
	}
	if err := json.Unmarshal([]byte(split), &s.SplitTunnelApps); err != nil {
		s.SplitTunnelApps = []string{}
	}
	c.JSON(http.StatusOK, s)
}

func (h *Handler) UpdateSettings(c *gin.Context) {
	uid := userID(c)
	var s Settings
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if s.SplitTunnelApps == nil {
		s.SplitTunnelApps = []string{}
	}
	if s.Protocol != "wireguard" && s.Protocol != "openvpn" {
		s.Protocol = "wireguard"
	}
	split, _ := json.Marshal(s.SplitTunnelApps)
	_, err := h.DB.Exec(`UPDATE settings SET kill_switch=?, dns_leak_protection=?, camo_mode=?,
		multi_hop=?, split_tunnel_apps=?, auto_connect=?, protocol=? WHERE user_id = ?`,
		s.KillSwitch, s.DNSLeakProtection, s.CamoMode, s.MultiHop,
		string(split), s.AutoConnect, s.Protocol, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, s)
}
