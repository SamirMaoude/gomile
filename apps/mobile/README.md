# GoMile Mobile (Expo)

Application mobile livreur du projet GoMile, geree en monorepo avec `pnpm`.

## Prerequis

- Node.js: `>=20 <24` (Node 24 peut poser des problemes avec certains outils Expo/ngrok)
- Corepack active (inclus avec Node recents)
- Expo Go sur Android/iOS

## Installation propre

Depuis la racine du monorepo:

```bash
corepack enable
corepack pnpm install
```

## Lancer l'app mobile (depuis la racine)

```bash
corepack pnpm mobile:lan
```

Tunnel (acces hors meme Wi-Fi):

```bash
corepack pnpm mobile:tunnel
```

Si le tunnel echoue, tester d'abord en LAN puis verifier l'etat ngrok:

`https://status.ngrok.com/`

## Commandes utiles

- `corepack pnpm mobile:start`
- `corepack pnpm mobile:lan`
- `corepack pnpm mobile:tunnel`

