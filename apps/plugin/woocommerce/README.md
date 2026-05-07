# Gomile Shipment pour WooCommerce

`Gomile Shipment` ajoute une méthode de livraison WooCommerce connectée à l'API Gomile.

Le plugin permet de :

- afficher une livraison `Gomile Delivery` au panier et au paiement ;
- demander un devis de livraison à l'API Gomile ;
- créer automatiquement une commande de livraison Gomile quand une commande WooCommerce est créée ;
- annuler une livraison Gomile quand une commande WooCommerce est annulée ;
- recevoir les mises à jour de statut via webhook ;
- mettre à jour les métadonnées et notes de commande WooCommerce.

Les principaux flux du plugin sont détaillés dans les [diagrammes de séquence PlantUML](./DIAGRAMMES-SEQUENCE.md).

## Prérequis

### Côté WordPress

- WordPress installé et fonctionnel.
- WooCommerce installé et actif.
- PHP compatible avec WordPress/WooCommerce.
- Extensions PHP usuelles activées :
  - `curl`, ou un transport HTTP WordPress équivalent, pour les appels sortants ;
  - `json` pour encoder/décoder les payloads ;
  - `hash` pour vérifier les signatures HMAC des webhooks ;
  - `mbstring` recommandé.
- Les permaliens WordPress doivent être actifs pour l'API REST.

### Côté Gomile

- API Gomile accessible depuis WordPress.
- Compte marchand avec un store Gomile créé pour la boutique WooCommerce.
- Accès à l'espace client Gomile.
- Clé API Gomile générée depuis l'espace client, rattachée au store WooCommerce.
- Webhook configuré depuis l'espace client Gomile avec l'URL fournie par le plugin.
- Secret webhook affiché par l'espace client Gomile et copié dans les réglages du plugin.

### Outils de développement utiles

Ces outils ne sont pas nécessaires pour un marchand final, mais utiles pour construire l'archive du plugin ou maintenir ses traductions :

- `zip` pour construire une archive installable du plugin ;
- `wp-cli` pour générer le catalogue de traduction ;
- `gettext` / `msgfmt` pour compiler les fichiers `.mo`.

## Installation

### Installation manuelle

1. Copier le dossier `apps/plugin/woocommerce` dans le dossier WordPress :

   ```bash
   wp-content/plugins/gomile-shipment
   ```

2. Vérifier que le fichier principal existe :

   ```txt
   wp-content/plugins/gomile-shipment/gomile-shipment.php
   ```

3. Dans l'admin WordPress, aller dans `Extensions`.
4. Activer `Gomile Shipment`.
5. Vérifier que WooCommerce est actif. Sinon, le plugin affichera une alerte admin.

### Installation par archive ZIP

L'archive installée dans WordPress doit contenir un dossier racine nommé `gomile-shipment`. Depuis le dépôt, le dossier source du plugin est `apps/plugin/woocommerce`, il faut donc le copier sous ce nom avant de l'archiver :

```bash
cd apps/plugin
rm -rf /tmp/gomile-shipment-build
mkdir -p /tmp/gomile-shipment-build
cp -R woocommerce /tmp/gomile-shipment-build/gomile-shipment
cd /tmp/gomile-shipment-build
zip -r /tmp/gomile-shipment.zip gomile-shipment
```

Ensuite dans WordPress :

1. `Extensions` -> `Ajouter`.
2. `Téléverser une extension`.
3. Choisir l'archive `/tmp/gomile-shipment.zip`.
4. Installer puis activer.

## Configuration WordPress

### 1. Configurer les réglages Gomile

Dans l'admin WordPress :

```txt
WooCommerce -> Gomile Shipment
```

ou :

```txt
Réglages -> Gomile Shipment
```

Renseigner les champs principaux :

- `API Key` : clé API Gomile du store. Elle est masquée à la lecture et conservée si le champ reste vide lors de l'enregistrement.
- `Sender Name` : nom du contact de retrait.
- `Sender Phone` : téléphone du contact de retrait.
- `Sender Address Street Number` : numéro de rue de l'adresse de retrait.
- `Sender Address Street Name` : nom de rue de l'adresse de retrait.
- `Sender Address Postal Code` : code postal de retrait.
- `Sender Address City` : ville de retrait.
- `Sender Address Country` : pays de retrait.
- `Webhook Secret` : secret renvoyé par l'API Gomile lors de la configuration du webhook. Il est masqué à la lecture et conservé si le champ reste vide.

Le plugin affiche aussi l'URL webhook à configurer côté Gomile :

```txt
https://votre-site.test/wp-json/gomile-shipment/v1/webhook
```

Un bouton de copie est disponible à côté de l'URL.

### 2. Activer la méthode de livraison

Dans WooCommerce :

```txt
WooCommerce -> Réglages -> Expédition -> Zones d'expédition
```

1. Choisir une zone d'expédition.
2. Ajouter une méthode de livraison.
3. Sélectionner `Gomile Shipment`.
4. Activer la méthode.
5. Ajuster le titre affiché au client si nécessaire.

Le titre par défaut est :

```txt
Gomile Delivery
```

## Configuration depuis l'espace client Gomile

La clé API et le secret webhook sont fournis au marchand depuis son espace client Gomile. Ces informations sont ensuite renseignées dans les réglages du plugin WordPress afin de connecter la boutique WooCommerce au store Gomile correspondant.

### Récupérer la clé API du store

Dans l'espace client Gomile :

1. Se connecter au compte marchand.
2. Ouvrir la section des magasins.
3. Sélectionner le store WooCommerce concerné.
4. Ouvrir la section API ou intégrations.
5. Créer ou afficher la clé API du store.
6. Copier la clé API affichée.
7. Coller cette valeur dans le champ `API Key` du plugin WordPress.

La clé API est un secret. Elle est affichée une seule fois ou masquée selon le fonctionnement de l'espace client. La conserver dans un endroit sûr, puis l'enregistrer dans le plugin.

### Configurer le webhook du store

Dans l'admin WordPress, copier l'URL affichée dans la section `Webhook` du plugin :

```txt
https://votre-site.test/wp-json/gomile-shipment/v1/webhook
```

Dans l'espace client Gomile :

1. Ouvrir le store concerné.
2. Ouvrir la section webhooks ou intégrations.
3. Coller l'URL webhook WordPress.
4. Enregistrer la configuration.
5. Copier le `webhookSecret` affiché par Gomile.
6. Coller ce secret dans le champ `Webhook Secret` du plugin WordPress.

Le secret webhook peut ressembler à ceci :

```txt
4b7f...
```

Ne pas hasher ce secret avant stockage : le plugin utilise le secret original pour vérifier la signature HMAC.

## Endpoints utilisés par le plugin

Par défaut, le plugin appelle l'API Gomile avec le header :

```http
x-api-key: VOTRE_CLE_API
```

Endpoints par défaut :

| Usage | Méthode | Endpoint |
| --- | --- | --- |
| Devis de livraison | `POST` | `/delivery-estimates` |
| Création de commande Gomile | `POST` | `/plugin/orders` |
| Annulation de commande Gomile | `POST` | `/plugin/orders/cancel?orderReference=...` |

L'URL de base par défaut en développement est :

```txt
http://localhost:3000
```

Sur une installation de production, l'intégrateur peut fixer l'URL de l'API Gomile dans `wp-config.php` :

```php
define('GOMILE_API_BASE_URL', 'https://api.gomile.delivery');
```

## Payloads envoyés

### Devis de livraison

Le plugin envoie notamment :

```json
{
  "pickupAddress": {
    "streetNumber": "12",
    "streetName": "Rue Exemple",
    "postalCode": "38000",
    "city": "Grenoble",
    "country": "France",
    "fullAddress": "12, Rue Exemple, 38000, Grenoble, France"
  },
  "dropoffAddress": {
    "streetName": "Adresse client",
    "postalCode": "38000",
    "city": "Grenoble",
    "country": "FR",
    "fullAddress": "Adresse client, 38000, Grenoble, FR"
  },
  "weightKg": 2.5
}
```

### Création d'une commande Gomile

Le plugin envoie notamment :

```json
{
  "customerName": "Client Exemple",
  "customerPhone": "0600000000",
  "dropOffAddress": "Adresse de livraison",
  "type": "OTHER",
  "weight": 2.5,
  "orderReference": "123"
}
```

`orderReference` correspond à l'ID de commande WooCommerce. Le webhook Gomile doit renvoyer cette même référence pour que le plugin retrouve la commande.

## Webhook entrant

Route exposée par WordPress :

```http
POST /wp-json/gomile-shipment/v1/webhook
```

Le plugin accepte deux événements :

- `delivery.status_changed`
- `delivery.status_completed`

Payload attendu :

```json
{
  "event": "delivery.status_changed",
  "orderId": "gomile-order-id",
  "orderReference": "123",
  "status": "PICKED_UP",
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

### Vérification de signature

L'API Gomile signe le body brut avec le secret webhook :

```txt
HMAC-SHA256(body, webhookSecret)
```

Le header envoyé est actuellement :

```http
X-Gomile-Webhook-Secret: sha256=<signature>
```

Le plugin recalcule la signature avec le body brut WordPress :

```php
hash_hmac('sha256', $request->get_body(), $secret)
```

## Effets dans WooCommerce

Quand une commande utilise la méthode `gomile_shipment`, le plugin stocke des métadonnées :

- `_gomile_shipment_status`
- `_gomile_shipment_delivery_id`
- `_gomile_shipment_tracking_url`
- `_gomile_shipment_delivery_created`
- `_gomile_shipment_last_error`
- `_gomile_shipment_last_status_update`

Le webhook ajoute une note visible dans la commande WooCommerce. Pour `delivery.status_completed`, le plugin marque aussi la commande WooCommerce comme terminée.

## Traductions

Les fichiers de traduction sont dans :

```txt
languages/
```

Fichiers principaux :

- `gomile-shipment.pot` : catalogue source ;
- `gomile-shipment-fr_FR.po` : traduction française éditable ;
- `gomile-shipment-fr_FR.mo` : fichier compilé chargé par WordPress.

Régénérer le catalogue :

```bash
wp i18n make-pot apps/plugin/woocommerce apps/plugin/woocommerce/languages/gomile-shipment.pot --domain=gomile-shipment --exclude=node_modules,vendor
```

Fusionner le catalogue dans le fichier français :

```bash
msgmerge --update apps/plugin/woocommerce/languages/gomile-shipment-fr_FR.po apps/plugin/woocommerce/languages/gomile-shipment.pot
```

Compiler la traduction :

```bash
msgfmt --check apps/plugin/woocommerce/languages/gomile-shipment-fr_FR.po -o apps/plugin/woocommerce/languages/gomile-shipment-fr_FR.mo
```

Vérifier qu'il ne reste aucune chaîne non traduite :

```bash
msgattrib --untranslated apps/plugin/woocommerce/languages/gomile-shipment-fr_FR.po
```

## Diagnostic

### Le plugin n'apparaît pas

- Vérifier que le dossier est bien dans `wp-content/plugins/gomile-shipment`.
- Vérifier que `gomile-shipment.php` est à la racine du dossier.
- Vérifier les logs PHP de WordPress.

### La méthode de livraison n'apparaît pas au checkout

- Vérifier que WooCommerce est actif.
- Vérifier que la méthode `Gomile Shipment` est ajoutée dans la zone d'expédition correspondante.
- Vérifier que l'adresse client correspond à cette zone.

### La création de livraison échoue

- Vérifier la clé API dans les réglages du plugin.
- Vérifier que l'API Gomile est accessible depuis le serveur WordPress.
- Vérifier que le store a une clé API active.
- Vérifier les notes de commande WooCommerce.

### Le webhook ne met rien à jour

- Vérifier que `orderReference` est un vrai ID de commande WooCommerce.
- Vérifier que le `Webhook Secret` du plugin est le secret original renvoyé par l'API.
- Vérifier la signature HMAC.
- Vérifier que les permaliens et l'API REST WordPress fonctionnent.

## Structure du plugin

```txt
gomile-shipment.php
includes/
  class-admin-settings.php
  class-shipping-method.php
  class-delivery-api.php
  class-order-handler.php
  class-rest-endpoints.php
languages/
  gomile-shipment.pot
  gomile-shipment-fr_FR.po
  gomile-shipment-fr_FR.mo
```

Responsabilités :

- `gomile-shipment.php` : chargement du plugin et des modules ;
- `class-admin-settings.php` : page de configuration et options ;
- `class-shipping-method.php` : méthode de livraison WooCommerce ;
- `class-delivery-api.php` : appels HTTP vers Gomile ;
- `class-order-handler.php` : création/annulation des livraisons depuis les commandes WooCommerce ;
- `class-rest-endpoints.php` : webhook de retour statut.
