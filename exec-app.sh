
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
pnpm --filter api start:dev