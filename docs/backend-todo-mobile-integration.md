# Backend TODO pour integration mobile

Ce document liste uniquement les actions backend restantes pour finaliser l'integration avec l'app mobile.

## Priorite P0 (bloquant front)

1. Exposer le endpoint manquant de parrainage driver
- Endpoint attendu: GET /driver/me/referral
- Reponse minimale attendue:
  - code: string
  - totalReferrals: number
- Comportement attendu:
  - 200 si disponible
  - 404/501 explicite si non actif en environnement

2. Exposer les endpoints de recuperation mot de passe
- POST /auth/forgot-password
- POST /auth/reset-password
- Contrats attendus:
  - forgot-password input: email ou telephone
  - reset-password input: token + newPassword
- Reponses d'erreur standardisees (400/401/422)

3. Stabiliser la specification OpenAPI
- Verifier que chaque endpoint mobile a un schema request/response complet.
- Ajouter des exemples Swagger pour:
  - missions available/active/history
  - wallet + wallet entries
  - profile + kyc + documents

## Priorite P1 (qualite et robustesse)

1. Uniformiser les erreurs API
- Tous les endpoints doivent renvoyer un format unique: code, message, details optionnel.
- Les erreurs metier critiques doivent etre explicites:
  - mission deja acceptee
  - solde insuffisant
  - code handshake invalide
  - kyc submission impossible

2. Clarifier les champs obligatoires register driver
- Documenter strictement les cas conditionnels:
  - transportType = BIKE: permis/carte grise facultatifs
  - sinon: permis/carte grise obligatoires
- Retourner des messages d'erreur orientables UI.

3. Verifier la coherence enum front/back
- VehicleType: CAR, BIKE, SCOOTER, TRUCK
- DriverStatus: AVAILABLE, BUSY, OFFLINE
- WalletEntryType: CREDIT, DEBIT
- WalletEntryStatus: PENDING, COMPLETED, CANCELLED

## Priorite P2 (productivite equipe)

1. Fournir des comptes de test preconfigures
- Driver valide KYC
- Driver KYC pending
- Driver KYC rejected
- Driver avec wallet credite

2. Fournir jeux de donnees d'integration
- Missions disponibles autour d'une position fixe
- Au moins une mission active
- Au moins une mission historique

3. Ajouter une mini matrice de tests API
- Auth: login/refresh/logout
- Missions: available -> accept -> handshake merchant -> handshake client
- Wallet: get balance -> entries -> withdrawal
- KYC: get status -> submit

## Endpoints de reference utilises par le front mobile

- Auth
  - POST /auth/register/driver
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout

- Driver me
  - GET /driver/me/dashboard
  - PATCH /driver/me/availability
  - PATCH /driver/me/location
  - GET /driver/me/missions/available
  - POST /driver/me/missions/{missionId}/accept
  - GET /driver/me/missions/active
  - GET /driver/me/missions/history
  - POST /driver/me/missions/{missionId}/handshake/merchant/verify
  - POST /driver/me/missions/{missionId}/handshake/client/verify
  - GET /driver/me/wallet
  - GET /driver/me/wallet/entries
  - POST /driver/me/wallet/withdrawals
  - GET /driver/me/profile
  - PATCH /driver/me/session-vehicle
  - GET /driver/me/kyc
  - POST /driver/me/kyc
  - GET /driver/me/documents
  - POST /driver/me/documents

- Upload
  - POST /uploads/presign

## Definition of done backend (pour declaration "pret front")

1. Tous les endpoints P0 repondent avec schemas stables.
2. Swagger est a jour avec exemples valides.
3. Les erreurs metier sont standards et testees.
4. Les donnees de test integration sont disponibles.
