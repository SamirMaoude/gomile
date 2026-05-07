#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then
  compose_cmd=(docker compose)
else
  compose_cmd=(docker-compose)
fi

"${compose_cmd[@]}" -f infra/docker-compose.yml up -d

echo "Generating Prisma client..."
pnpm --filter api exec prisma generate

echo "Applying pending Prisma migrations..."
pnpm --filter api exec prisma migrate deploy

pnpm --filter api start:dev
