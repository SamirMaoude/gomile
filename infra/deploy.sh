#!/usr/bin/env bash
# Full deploy: sync main, build both apps, migrate DB, restart services.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "...Syncing latest main"
git fetch origin main
git checkout main
git reset --hard origin/main

echo "...Installing dependencies"
pnpm install

echo "...Generating Prisma client"
pnpm --filter api exec prisma generate

echo "...Running database migrations"
pnpm --filter api exec prisma migrate deploy

echo "...Building API"
pnpm --filter api build

echo "...Building web app"
pnpm --filter web build

echo "...Restarting services"
sudo systemctl restart gomile-api
sudo systemctl restart gomile-web

echo "!!! Deploy complete !!!"
systemctl status gomile-api --no-pager
systemctl status gomile-web --no-pager
