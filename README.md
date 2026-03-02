# GoMile Monorepo

GoMile est un dépôt multi-applications qui contient :
- `apps/api` : backend NestJS (API métier + accès Prisma)
- `apps/web` : application web Next.js (App Router + routes BFF)
- `apps/mobile` : application mobile Expo React Native
- `infra` : services locaux Docker (Postgres/PostGIS + Redis)
- `docs` : documents projet (`Cahier des charges.pdf`)

## Structure du dépôt

```text
.
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── prisma/
│   │   └── generated/prisma/
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       └── lib/
│   └── mobile/
├── infra/
│   └── docker-compose.yml
└── docs/
    └── Cahier des charges.pdf
```

## État actuel

- Schéma Prisma et migration SQL initiale : en place
- Intégration Prisma côté Nest (`apps/api/src/prisma`) : en place
- Routes BFF Next (`apps/web/src/app/api/**/route.ts`) : en place
- Endpoints métier Nest (order/accept/handshake/kyc) : prochaine étape

## Prérequis

- Node.js 22 LTS (recommandé)
- Docker + Docker Compose

## Gestionnaire de paquets (Corepack + pnpm)

Le dépôt fixe la version de pnpm dans `package.json` (`packageManager`).

```bash
# Active Corepack (une seule fois sur la machine)
corepack enable

# Active la version pnpm du projet
corepack prepare pnpm@10.30.3 --activate
```

## Installer les dépendances

```bash
pnpm install
```

## Démarrer l'infrastructure locale

```bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
```

Services attendus :
- PostgreSQL/PostGIS sur `localhost:5432`
- Redis sur `localhost:6379`

## Configuration d'environnement

Il faut créer vos propre fichiers d'environnement `apps/api/.env` à partir de `apps/api/.env.example` avec au minimum :

```env
# Base de données PostgreSQL (Docker local)
DATABASE_URL="postgresql://gomile:gomile@localhost:5432/gomile?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
```

Pour le proxy BFF web, créer `apps/web/.env.local` :

```env
API_BASE_URL=http://localhost:3000
```

## Base de données API (Prisma)

```bash
# Génère le client Prisma
pnpm --filter api exec prisma generate

# Crée/applique une migration locale
pnpm --filter api exec prisma migrate dev --name <nom_migration>
```

Fichiers concernés :
- Schéma : `apps/api/prisma/schema.prisma`
- Migrations : `apps/api/prisma/migrations/*`
- Client généré : `apps/api/generated/prisma/*`

## Lancer les applications

Depuis la racine du dépôt :

```bash
# API NestJS (dev)
pnpm --filter api start:dev

# Web Next.js (dev) sur 3001 pour éviter le conflit avec l'API
pnpm --filter web dev -- --port 3001

# Mobile Expo
pnpm --filter mobile start
```

## Scripts du workspace racine

```bash
pnpm build
pnpm lint
pnpm typecheck
```

## Routes BFF exposées côté web

Ces routes sont appelées par le frontend, puis proxifiées vers Nest :
- `GET /api/health`
- `POST /api/order`
- `POST /api/accept_order`
- `POST /api/handshake/a`
- `POST /api/handshake/b`
- `PUT /api/livreurs/:id/kyc-approve`

Implémentation du proxy :
- `apps/web/src/lib/backend-proxy.ts`
