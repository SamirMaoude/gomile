# GoMile API (`apps/api`)

Backend NestJS du projet GoMile.

## Prérequis

- PostgreSQL/PostGIS actif sur `localhost:5432`
- Redis actif sur `localhost:6379`
- Fichier `apps/api/.env` configuré

## Commandes utiles

Depuis la racine du dépôt.

### Installer les dépendances

```bash
pnpm install
```

### Démarrer l'infrastructure locale

```bash
docker compose -f infra/docker-compose.yml up -d
```

Si `docker compose` ne fonctionne pas sur votre machine, vous pouvez essayer docker-compose, si vous avez déjà installée docker

```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Démarrer ou redémarrer Redis

```bash
docker compose -f infra/docker-compose.yml up -d redis
docker compose -f infra/docker-compose.yml restart redis
```

Si besoin de vider le cache Redis (test/démo)

```bash
docker compose -f infra/docker-compose.yml exec redis redis-cli FLUSHALL
```

## Environnement

Copier `apps/api/.env.example` vers `apps/api/.env` puis renseigner :

```env
# Base de données
DATABASE_URL="postgresql://gomile:gomile@localhost:5432/gomile?schema=public"

# Cache
REDIS_URL="redis://localhost:6379"

# API
PORT=3000
APP_URL="http://localhost:3001"

# Auth JWT
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"

# OpenRouteService (geocoding + routing)
ORS_API_KEY="your-openrouteservice-api-key"
ORS_BASE_URL="https://api.openrouteservice.org"

# AWS (KYC – stockage documents)
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
S3_BUCKET_NAME="your-s3-bucket-name"

# Resend (emails transactionnels)
RESEND_API_KEY="your-resend-api-key"

# Stripe (abonnements)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
STRIPE_PRO_PRICE_ID="your-stripe-pro-monthly-price-id"
STRIPE_PRO_ANNUAL_PRICE_ID="your-stripe-pro-annual-price-id"
STRIPE_BUSINESS_PRICE_ID="your-stripe-business-monthly-price-id"
STRIPE_BUSINESS_ANNUAL_PRICE_ID="your-stripe-business-annual-price-id"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"
```

### Prisma
Migrate à lancer si un changement de schéma est fait
```bash
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate dev --name <nom_migration>
```

### Lancer l'API en dev

```bash
pnpm --filter api start:dev
```

URL par défaut : `http://localhost:3000`

### Build

```bash
pnpm --filter api build
```

### Tests

```bash
pnpm --filter api test:ci
pnpm --filter api test:e2e
```

### Vérifications

```bash
pnpm --filter api lint
pnpm --filter api exec tsc --noEmit -p tsconfig.json
```

## Swagger

Une fois l'API démarrée :

- Swagger UI : `http://localhost:3000/docs`
- OpenAPI JSON : `http://localhost:3000/openapi.json`

## Notes

- Le module livraison utilise OpenRouteService.
- Redis est utilisé pour cacher le géocodage et les routes ORS.
- Le module abonnement utilise Stripe. Chaque plan (PRO, BUSINESS) a deux price IDs Stripe distincts : un mensuel et un annuel.
