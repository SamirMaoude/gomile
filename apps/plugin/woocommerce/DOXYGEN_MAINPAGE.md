@mainpage Documentation technique du plugin Gomile Shipment

`Gomile Shipment` est un plugin WordPress/WooCommerce qui connecte une boutique à
l'API Gomile pour proposer une méthode de livraison, créer des missions de
livraison et recevoir les mises à jour de statut par webhook.

## Modules principaux

- `gomile-shipment.php` initialise le plugin, charge les traductions et branche
  les classes WooCommerce quand l'extension WooCommerce est active.
- `Gomile_Shipment_Admin_Settings` centralise les réglages WordPress, les valeurs
  par défaut, les constantes d'environnement et le rendu de la page admin.
- `WC_Gomile_Shipment_Method` déclare la méthode d'expédition visible dans les
  zones de livraison WooCommerce et calcule le tarif exposé au checkout.
- `Gomile_Shipment_Delivery_API` construit les payloads envoyés à l'API Gomile,
  effectue les appels HTTP, parse les réponses et met en cache les devis.
- `class-order-handler.php` branche les hooks WooCommerce qui créent ou annulent
  les commandes Gomile selon le cycle de vie d'une commande WooCommerce.
- `Gomile_Shipment_REST_Endpoints` expose le webhook REST utilisé par Gomile pour
  mettre à jour les statuts de livraison.

## Génération locale

Depuis le dossier du plugin :

```bash
composer docs
```

ou directement :

```bash
doxygen Doxyfile
```

La documentation HTML est générée dans `docs/doxygen/html/index.html`.

## Périmètre documenté

La documentation cible le code source du plugin WooCommerce, hors tests,
traductions, dépendances Composer et artefacts générés. Elle décrit les points
d'entrée publics, les hooks WordPress/WooCommerce, les classes internes et les
helpers procéduraux utilisés par le plugin.
