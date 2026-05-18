# Server Setup

This guide sets up a machine to host the gomile stack: NestJS API on `:4000`, Next.js web on `:3001`, nginx as reverse proxy, Cloudflare Tunnel for HTTPS and public access.

---

## 1. System packages

```bash
sudo apt update && sudo apt install -y nginx docker.io docker-compose nodejs npm postgresql postgresql-postgis
sudo npm install -g pnpm
```

## 2. PostgreSQL

```bash
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER gomile WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "CREATE DATABASE gomile OWNER gomile;"
sudo -u postgres psql -d gomile -c "CREATE EXTENSION postgis;"
```

> PostGIS must be created as the `postgres` superuser, not the app user.

## 3. Redis

```bash
docker compose -f infra/docker-compose.yml up -d
```

## 4. Environment

```bash
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, JWT secrets, GITLAB_WEBHOOK_SECRET, etc.
```

```
DATABASE_URL=postgresql://gomile:yourpassword@localhost:5432/gomile
```

## 5. nginx

```bash
sudo cp infra/nginx/gomile.delivery.conf /etc/nginx/sites-available/gomile.delivery
sudo ln -s /etc/nginx/sites-available/gomile.delivery /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl enable --now nginx
```

## 6. Cloudflare Tunnel

The tunnel routes public traffic from your domain to nginx on port 80. Cloudflare handles HTTPS.

Install cloudflared:

```bash
sudo apt install -y cloudflared
```

Create a tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create gomile
```

Copy the generated credentials file path and update `infra/cloudflared/config.yml` with your tunnel ID and credentials path. Then add CNAME records in the Cloudflare DNS dashboard for each hostname pointing to `<tunnel-id>.cfargotunnel.com`.

Install as a service:

```bash
sudo mkdir -p /etc/cloudflared
sudo cp infra/cloudflared/config.yml /etc/cloudflared/config.yml
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## 7. systemd services

```bash
sudo cp infra/systemd/gomile-api.service /etc/systemd/system/
sudo cp infra/systemd/gomile-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gomile-api gomile-web
```

Update the `User` and `WorkingDirectory` fields in both service files to match your username and repo path before copying.

Allow the app user to restart services without a password (required for auto-deploy):

```bash
sudo bash -c 'echo "<youruser> ALL=(ALL) NOPASSWD: /bin/systemctl restart gomile-api, /bin/systemctl restart gomile-web" > /etc/sudoers.d/gomile'
```

## 8. First deploy

```bash
bash infra/deploy.sh
```

This installs dependencies, runs migrations, builds both apps, and starts the services.

## Auto-deploy on push

Pushes to the `main` branch automatically trigger a deploy via a GitLab webhook.

Configure in GitLab: Settings → Webhooks → Add webhook:
- URL: `https://<yourdomain>/webhook/deploy`
- Secret token: value of `GITLAB_WEBHOOK_SECRET` in `apps/api/.env`
- Trigger: Push events, filtered to branch `main`

---

## Useful commands

```bash
journalctl -u gomile-api -f       # API logs
journalctl -u gomile-web -f       # Web logs
sudo systemctl restart gomile-api
sudo systemctl restart gomile-web
systemctl status gomile-api gomile-web --no-pager
```
