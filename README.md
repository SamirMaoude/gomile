# GoMile Monorepo

GoMile est une plateforme logistique de livraison. Le dépôt contient :

- `apps/api` — backend NestJS (API REST + Prisma + Redis)
- `apps/web` — dashboard Next.js pour marchands et administrateurs (App Router + BFF)
- `apps/mobile` — application mobile Expo React Native pour livreurs et clients
- `apps/plugin` — SDK TypeScript pour intégrations tierces (WooCommerce, Shopify)
- `shared/` — contrats TypeScript partagés entre toutes les apps (types, erreurs)
- `infra/` — services locaux Docker (PostgreSQL/PostGIS + Redis)
- `docs/` — documents projet (`Cahier des charges.pdf`)

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
│   ├── mobile/
│   │   └── lib/
│   └── plugin/
│       └── lib/
├── shared/
├── infra/
│   └── docker-compose.yml
└── docs/
    └── Cahier des charges.pdf
```

## Prérequis

- Node.js 22 LTS
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

Copier les fichiers d'exemple et remplir les valeurs :

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### `apps/api/.env`

```env
# Base de données PostgreSQL (Docker local)
DATABASE_URL="postgresql://gomile:gomile@localhost:5432/gomile?schema=public"

# Cache / file de messages (Redis local)
REDIS_URL="redis://localhost:6379"

# Port d'écoute de l'API
PORT=3000

# Auth JWT (remplacer en environnements partagés)
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"

# OpenRouteService — geocoding + calcul de distance
# Créer un compte gratuit sur openrouteservice.org (1000 appels/jour)
ORS_API_KEY="your-openrouteservice-key"
ORS_BASE_URL="https://api.openrouteservice.org"

# AWS S3 — stockage des fichiers KYC
# Créer un utilisateur IAM avec s3:PutObject, s3:GetObject, s3:DeleteObject sur le bucket
AWS_REGION="your-chosen-region"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
S3_BUCKET_NAME="your-bucket-name"

# Resend — envoi d'emails transactionnels (vérification, reset mot de passe)
# Créer un compte sur resend.com et générer une clé API
RESEND_API_KEY="your-resend-api-key"

```

### `apps/web/.env.local`

```env
# URL du backend NestJS — utilisée côté serveur par le proxy BFF
API_BASE_URL=http://localhost:3000

```

## Base de données API (Prisma)

```bash
# Génère le client Prisma
pnpm --filter api exec prisma generate

# Applique les migrations (à faire à chaque changement de schéma)
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

# Web Next.js (dev) — port 3001 pour éviter le conflit avec l'API
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

## Shared — contrats partagés

Le dossier `shared/` contient les types et constantes utilisés par toutes les apps :

| Fichier | Contenu |
|---------|---------|
| `api-errors.ts` | Codes d'erreur API, type `ApiErrorCode`, fonction `createApiError()` |
| `auth-contracts.ts` | Types auth : rôles, genres, véhicules, `AuthUser`, `AuthSession`, inputs register/login |
| `auth-messages.ts` | Constantes de messages d'authentification |
| `order-contracts.ts` | Statuts de commande, types `CreateOrderInput`, `GetOrderResponse`, etc. |
| `store-contracts.ts` | Types `CreateStoreInput`, `StoreResponse`, `StoreProvider` |
| `api-key-contracts.ts` | Types `CreateApiKeyInput`, `ListApiKeysItem`, `GetApiKeyResponse`, etc. |
| `kyc-contracts.ts` | Types `DriverKycStatus`, `DriverKycSubmission`, `RejectKycInput` |
| `delivery-contracts.ts` | Types `DeliveryEstimateInput`, `DeliveryEstimateResponse` (utilisés par le plugin) |

## Routes BFF exposées côté web

Le proxy BFF (`apps/web/src/lib/backend-proxy.ts`) gère l'authentification par cookie httpOnly côté serveur. Les routes suivantes sont exposées à `/api/` et proxifiées vers NestJS :

**Auth**
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/register/merchant`
- `POST /api/auth/register/driver`

**Marchands — commandes**
- `GET  /api/merchants/[merchantId]/orders`
- `GET  /api/merchants/[merchantId]/orders/[orderId]`
- `POST /api/merchants/[merchantId]/orders/[orderId]/cancel`

**Marchands — stores**
- `GET    /api/merchants/[merchantId]/stores`
- `POST   /api/merchants/[merchantId]/stores`
- `GET    /api/merchants/[merchantId]/stores/[storeId]`
- `PATCH  /api/merchants/[merchantId]/stores/[storeId]`
- `DELETE /api/merchants/[merchantId]/stores/[storeId]`
- `POST   /api/merchants/[merchantId]/stores/[storeId]/enable`
- `POST   /api/merchants/[merchantId]/stores/[storeId]/disable`
- `POST   /api/merchants/[merchantId]/stores/[storeId]/orders`

**Marchands — clés API**
- `GET   /api/merchants/[merchantId]/api-keys`
- `POST  /api/merchants/[merchantId]/api-keys`
- `GET   /api/merchants/[merchantId]/api-keys/[apiKeyId]`
- `PATCH /api/merchants/[merchantId]/api-keys/[apiKeyId]`
- `POST  /api/merchants/[merchantId]/api-keys/[apiKeyId]/revoke`

**Livreurs**
- `GET  /api/livreurs/[driverId]/orders`
- `POST /api/livreurs/[driverId]/orders/[orderId]/accept`
- `POST /api/livreurs/[driverId]/orders/[orderId]/pickup`
- `POST /api/livreurs/[driverId]/orders/[orderId]/deliver`
- `PUT  /api/livreurs/[driverId]/kyc-approve`
- `PUT  /api/livreurs/[driverId]/kyc-reject`

**Santé**
- `GET /api/health`
