# GoMile Web (`apps/web`)

Application web Next.js (App Router) avec une couche BFF via les routes internes `src/app/api/**/route.ts`.

## Objectif

Ce dossier contient la partie web de GoMile. Elle sert principalement aux commerçants pour gérer leurs boutiques, leurs commandes et leurs clés API, et aux livreurs pour créer leur dossier d'inscription. L'interface web contient aussi un espace d'administration séparé.

Le front communique avec l'API NestJS à travers des routes internes Next.js. Cette couche BFF centralise les appels serveur, la gestion de session et le proxy vers le backend.

## Structure du web

```text
apps/web
├── src/app/                  # pages App Router et routes internes
│   ├── admin/                # interface d'administration
│   ├── api/                  # routes BFF côté Next.js
│   ├── driver/               # inscription livreur
│   └── merchant/             # espace commerçant
├── src/components/           # composants réutilisables
├── src/lib/                  # proxy API, session, helpers partagés
├── cypress/                  # tests end-to-end
├── public/                   # ressources statiques
└── package.json              # scripts et dépendances du front
```

## Environnement

Créer `apps/web/.env.local` :

```env
API_BASE_URL=http://localhost:3000
```

`API_BASE_URL` doit pointer vers l'API Nest.

## Lancement local

```bash
pnpm --filter web dev -- --port 3001
```

## Build et production

Compiler le front :

```bash
pnpm --filter web build
```

Lancer le front compilé :

```bash
pnpm --filter web start
```

Sur le serveur de production, le déploiement complet est prévu depuis la racine du dépôt :

```bash
bash infra/deploy.sh
```

Ce script récupère le code, installe les dépendances, prépare l'API, compile l'API et le front, puis redémarre les services `gomile-api` et `gomile-web`.

## Vérifications

```bash
pnpm --filter web lint
pnpm --filter web lint:tsx
pnpm --filter web lint:css
pnpm --filter web typecheck
pnpm --filter web typecheck:app
pnpm --filter web typecheck:cypress
pnpm --filter web build
```

## Tests Cypress

Ouvrir Cypress en mode interactif :

```bash
pnpm --filter web cypress:open
```

Lancer les tests en mode automatique :

```bash
pnpm --filter web cypress:run
```

Lancer les scénarios front ou uniquement les scénarios merchant :

```bash
pnpm --filter web test:front
pnpm --filter web test:merchant
```
