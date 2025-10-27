#!/usr/bin/env bash
# Simple homelab hardening script (idempotent-ish)
# Use with caution — meant for lab VMs.

set -euo pipefail

info() { echo "[*] $*"; }

info "Updating package lists..."
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y rsync ufw fail2ban
fi

info "Setting basic sysctl hardening..."
SYSCTL_CONF="/etc/sysctl.d/99-custom.conf"
sudo tee "$SYSCTL_CONF" > /dev/null <<'EOF'
# Custom homelab hardening
net.ipv4.ip_forward = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.disable_ipv6 = 0
EOF

sudo sysctl --system

info "Ensuring UFW basic rules..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw --force enable

info "Ensuring fail2ban is running..."
sudo systemctl enable --now fail2ban || true

info "Done. Review changes and adapt to production carefully."