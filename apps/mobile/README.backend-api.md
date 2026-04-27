# Brief Backend (version simple et claire)

Salut Dang,

je te fais un brief direct pour que le mobile fonctionne .
L'idee: t'as une checklist API + une checklist DB.


## 1) Auth

### Endpoints a exposer

- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- Bonus: POST /auth/forgot-password
- Bonus: POST /auth/reset-password

### Login mobile attendu

```json
{
  "identifier": "telephone_ou_email",
  "password": "mot_de_passe"
}
```

Regle:

- si identifier ressemble a un email -> login email
- sinon -> login par numero de tel


### Reponse standard attendue (register/login/refresh)

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "DRIVER"
  }
}
```

---

## 2) Register Driver (4 etapes mobile)

Le mobile split l'inscription en 4 ecrans, mais idealement le backend accepte un payload final unique (avec champs optionnels).

### Step 1 - Identite

| Champ | Type conseille | Exemple | Obligatoire |
|---|---|---|---|
| firstName | String | Jean | oui |
| lastName | String | Dupont | oui |
| email | String | jean@mail.com | oui |
| phone | String | +33612345678 | oui |
| password | String | Password123! | oui |
| birthDate | DateTime | 1998-05-12 | oui |
| gender | enum Gender (MALE/FEMALE/UNDEFINED) | MALE | oui |

### Step 2 - Adresse / Transport

| Champ | Type conseille | Exemple | Obligatoire |
|---|---|---|---|
| address | String | 22 boulevard Clemenceau, Grenoble | oui |
| city | String | Grenoble | oui |
| zipCode | String | 38000 | oui |
| street | String | boulevard Clemenceau | oui |
| deliveryCity | String | Grenoble | oui |
| deliveryRadius | Int | 15 | oui |
| transportType | enum VehicleType (velo/moto/voiture/utilitaire) | moto | oui |

### Step 3 - Documents

| Champ | Type conseille | Exemple | Obligatoire |
|---|---|---|---|
| cniFile | String (URL) | https://.../cni.jpg | recommande |
| justificatifFile | String (URL) | https://.../justif.jpg | recommande |
| permisFile | String (URL) | https://.../permis.jpg | non si velo |
| carteGriseFile | String (URL) | https://.../cartegrise.jpg | non si velo |

Regle metier conseillee:

- transportType = velo -> permis/carte grise facultatifs
- transportType != velo -> tu peux les rendre obligatoires

### Step 4 - Infos pro

| Champ | Type conseille | Exemple | Obligatoire |
|---|---|---|---|
| siret | String | 12345678900012 | optionnel |
| kbisFile | String (URL) | https://.../kbis.pdf | optionnel |
| ribFile | String (URL) | https://.../rib.pdf | optionnel |

### Payload final que le backend doit accepter

```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "MALE|FEMALE|UNDEFINED",
  "address": "string",
  "city": "string",
  "zipCode": "string?",
  "street": "string?",
  "deliveryCity": "string",
  "deliveryRadius": 15,
  "transportType": "velo|moto|voiture|utilitaire",
  "cniFile": "string?",
  "justificatifFile": "string?",
  "permisFile": "string?",
  "carteGriseFile": "string?",
  "siret": "string?",
  "kbisFile": "string?",
  "ribFile": "string?",
  "avatarUrl": "string?"
}
```

---

## 3) APIs metier attendues par le mobile

## Dashboard

- GET /driver/me/dashboard
- PATCH /driver/me/availability
- PATCH /driver/me/location

Payload/retour attendu:

| Champ | Type | Exemple |
|---|---|---|
| isOnline | Boolean | true |
| todayEarnings | Float | 24.5 |
| todayTrips | Int | 5 |
| currentLocation.lat | Float | 45.188 |
| currentLocation.lng | Float | 5.724 |
| coverageRadiusMeters | Int | 1000 |

## Missions

- GET /driver/me/missions/available
- POST /driver/me/missions/{missionId}/accept
- GET /driver/me/missions/active
- GET /driver/me/missions/history

Pour le flow handshake actuel (recommande):

- POST /driver/me/missions/{missionId}/handshake/merchant/verify
- POST /driver/me/missions/{missionId}/handshake/client/verify

Objet mission attendu:

| Champ | Type | Exemple |
|---|---|---|
| id | UUID/String | uuid |
| type | String | Alimentaire |
| store | String | Monoprix - Grenoble Centre |
| reward | Float | 7.5 |
| distanceKm | Float | 1.2 |
| pickupAddress | String | 10 rue de la Paix |
| dropOffAddress | String | 22 boulevard Clemenceau |
| status | enum OrderStatus | SEARCHING_DRIVER |

## Wallet

- GET /driver/me/wallet
- GET /driver/me/wallet/entries
- POST /driver/me/wallet/withdrawals

Wallet:

| Champ | Type | Exemple |
|---|---|---|
| balance | Int/Float | 245.5 |
| currency | String | EUR |
| pendingAmount | Float | 20 |

Wallet entry:

| Champ | Type | Exemple |
|---|---|---|
| id | UUID/String | uuid |
| type | CREDIT/DEBIT | CREDIT |
| amount | Int/Float | 8.5 |
| status | PENDING/COMPLETED/CANCELLED | PENDING |
| createdAt | DateTime | 2026-04-04T14:20:00.000Z |

## Profil

- GET /driver/me/profile
- PATCH /driver/me/profile
- PATCH /driver/me/session-vehicle
- GET /driver/me/referral
- GET /driver/me/documents

Profil attendu:

| Champ | Type | Exemple |
|---|---|---|
| id | UUID/String | uuid |
| firstName | String | Jean |
| lastName | String | Paul |
| avatarUrl | String | https://.../avatar.jpg |
| phone | String | +33612345678 |
| email | String | jean@mail.com |
| rating | Float | 4.9 |
| totalTrips | Int | 128 |
| activeVehicle | velo/moto/voiture/utilitaire | velo |
| gomileCode | String | GM-8829-2026 |
| status | AVAILABLE/BUSY/OFFLINE | AVAILABLE |

---

## 4) Objets DB a avoir (ou completer)

Base existante tres bien:

- User
- Driver
- Merchant
- Store
- Order
- Handshake
- KycSubmission
- Wallet
- WalletEntry

Ajouts recommandes pour coller 100% au mobile:

1. Sur Driver (ou DriverProfile):
- city
- zipCode
- street
- deliveryCity
- deliveryRadius
- transportType
- activeVehicle
- isOnline
- lastLatitude
- lastLongitude
- rating
- totalTrips
- gomileCode
- driverStatus
- siret

2. Pour les documents:
- soit enrichir KycSubmission
- soit creer DriverDocument (plus propre):

| Champ | Type | Description |
|---|---|---|
| id | UUID | identifiant doc |
| driverId | UUID | proprietaire |
| type | enum | CNI, JUSTIFICATIF, PERMIS, CARTE_GRISE, KBIS, RIB |
| url | String | url finale du fichier |
| verified | Boolean | verifie ou non |
| rejectionReason | String? | raison si refuse |
| createdAt | DateTime | date creation |

---

## 5) Upload fichiers

Le mobile envoie des fichiers locaux. Du coup il faut une strategie upload claire.

Option 1 (simple):
- POST /uploads (multipart/form-data)

Option 2 (scalable):
- POST /uploads/presign
- upload direct vers storage (S3/Blob)
- backend garde seulement l'URL en base

---

