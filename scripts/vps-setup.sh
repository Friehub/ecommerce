#!/bin/bash
# vps-setup.sh — run once on a fresh Contabo VPS (Ubuntu 22.04)
# Usage: bash vps-setup.sh

set -euo pipefail

echo "── Step 1: System updates ──────────────────────────────────"
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban awscli

echo "── Step 2: Docker ──────────────────────────────────────────"
curl -fsSL https://get.docker.com | sh
systemctl enable docker
usermod -aG docker "$SUDO_USER"

echo "── Step 3: Firewall ────────────────────────────────────────"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP → redirects to HTTPS
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo "── Step 4: Fail2ban (brute force protection) ───────────────"
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
maxretry = 5
bantime = 3600
findtime = 600
EOF
systemctl enable fail2ban
systemctl start fail2ban

echo "── Step 5: Cloudflare IP allowlist ────────────────────────"
# After configuring Cloudflare, restrict 443/80 to CF IPs only
# Run this AFTER you have confirmed Cloudflare is proxying your domain:
# curl https://www.cloudflare.com/ips-v4 | while read ip; do
#   ufw allow from $ip to any port 443
#   ufw allow from $ip to any port 80
# done
# ufw delete allow 80/tcp
# ufw delete allow 443/tcp
echo "Skipped — run manually after Cloudflare DNS is propagated."

echo "── Step 6: Clone repo ──────────────────────────────────────"
mkdir -p /opt/jumia
git clone https://github.com/Friehub/ecommerce.git /opt/jumia
echo "Edit /opt/jumia/.env.prod before deploying."

echo "── Step 7: Certbot SSL ─────────────────────────────────────"
apt install -y certbot
# Run: certbot certonly --standalone -d yourdomain.com
# Then: cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/jumia/nginx/certs/
# Then: cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/jumia/nginx/certs/
echo "Skipped — run certbot manually after DNS propagation."

echo "── Step 8: Crontab for backups ─────────────────────────────"
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/jumia/scripts/backup-postgres.sh >> /var/log/jumia-backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 certbot renew --quiet && docker compose -f /opt/jumia/docker-compose.prod.yml restart nginx") | crontab -

echo ""
echo "Setup complete."
echo "Next steps:"
echo "  1. Edit /opt/jumia/.env.prod"
echo "  2. Configure Cloudflare DNS → your Contabo IP"
echo "  3. Run certbot for SSL"
echo "  4. bash /opt/jumia/scripts/deploy.sh"
