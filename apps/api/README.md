# GoMile API (`apps/api`)

Backend NestJS du projet GoMile.

## Périmètre

- API REST métier (orders, handshake, kyc, auth)
- Persistance PostgreSQL via Prisma
- Intégration Redis (queues/realtime à compléter)

## Structure

```text
apps/api
├── src/                 # code Nest (modules, contrôleurs, services)
│   ├── prisma/          # PrismaModule + PrismaService
│   └── ...
├── prisma/              # schema.prisma + migrations SQL
├── generated/prisma/    # client Prisma généré
└── test/                # tests e2e
```

## Prérequis

- PostgreSQL/PostGIS actif sur `localhost:5432`
- Redis actif sur `localhost:6379`
- Fichier `apps/api/.env` configuré

Depuis la racine du dépôt, vous pouvez démarrer l'infra locale :

```bash
docker compose -f infra/docker-compose.yml up -d
```
Parfois, ```docker compose ``` ne démarre pas correctement, dans ce cas, vous pouvez utiliser ```docker-compose``` (il faut l'installer)
## Environnement

Copier `apps/api/.env.example` vers `apps/api/.env` puis renseigner :

```env
DATABASE_URL="postgresql://gomile:gomile@localhost:5432/gomile?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
```

## Prisma

```bash
# Génère le client Prisma
pnpm --filter api exec prisma generate

# Crée et applique une migration locale
pnpm --filter api exec prisma migrate dev --name <nom_migration>
```

## Lancer l'API

```bash
pnpm --filter api start:dev
```

URL par défaut : `http://localhost:3000`

## OpenAPI / Swagger

Une fois l'API démarrée :

- Swagger UI : `http://localhost:3000/docs`
- Spécification OpenAPI JSON : `http://localhost:3000/openapi.json`

## Vérifications

```bash
pnpm --filter api lint
pnpm --filter api exec tsc --noEmit -p tsconfig.json
pnpm --filter api test:ci
pnpm --filter api build
```

## État d'implémentation

- Schéma Prisma : en place
- Module/service Prisma Nest : en place
- Endpoint racine de santé : en place (`GET /`)
- Endpoints métier (`/order`, `/accept_order`, `/handshake/*`, `/livreurs/:id/kyc-approve`) : à implémenter
