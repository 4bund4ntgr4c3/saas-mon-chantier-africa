# Changelog — BâtiBénin / Plateforme africaine de construction

Ce document retrace **tous les changements depuis la première version**. Il est mis à jour à chaque commit/push, en même temps que le README, le schéma de base de données et la roadmap, afin de garder une spécification toujours exacte et d'éviter de réimplémenter ou de dégrader une fonctionnalité existante.

Conventions : `✅` ajouté · `🔧` amélioré · `🐛` corrigé · `🗑️` supprimé/nettoyé · `⚠️` à noter.

## v0.36 — Vague 9 (clôture) : Paiement intégral de la location de matériel par mobile money (2026-08-16)

- ✅ Migration `20260829000000_location-paiement-integral.sql` : colonnes `total_paid` (boolean, défaut false) et `total_paid_at` (timestamptz) sur `equipment_rentals`.
- ✅ Helper `rentalTotalDue` (`src/lib/data.ts`) : montant intégral dû = loyer (`total_price`) + frais de livraison (`delivery_fee`), hors caution — gère les montants numériques et textuels (mode invité).
- ✅ Onglet « Mes locations » (`location.tsx`) : bouton **Payer la location (XOF)** pour les locations `confirmee`/`en_cours` non réglées, dialogue `MobileMoneyDialog` (bénéficiaire = propriétaire du matériel), badge « Location payée » et montant « À payer » sinon.
- ✅ Tests unitaires `rentalTotalDue` (`src/lib/data.test.ts`) : loyer + livraison, livraison nulle/absente, montants textuels.
- ✅ Seed démo : location bétonnière `en_cours` impayée + groupe électrogène `confirmee` (caution payée, intégral en attente).
- ⚠️ La caution et le loyer sont payés séparément (deux transactions) ; le paiement intégral crée une trace `payments` si la location est rattachée à un chantier (`project_id`).

## v0.35 — Vague 11 (tranche 2) : Géolocalisation projets/prestataires & Suivi de livraison sur carte (2026-08-16)

### Géolocalisation des projets (`projects.lat`, `projects.lng`)

- ✅ Migration `20260828000000_geo-projets-prestataires-suivi.sql` : colonnes `lat`/`lng` sur `projects` et `providers`, `current_lat`/`current_lng`/`position_updated_at` sur `deliveries`.
- ✅ Page Projets : bouton **Carte** affichant tous les chantiers géolocalisés sur carte Leaflet multi-fournisseurs (PointsMap).
- ✅ Formulaire projet : champs latitude/longitude optionnels (création et édition).

### Géolocalisation des prestataires & Recherche « près de moi » (`providers.lat`, `providers.lng`)

- ✅ Page Prestataires : bouton **Près de moi** (géolocalisation navigateur), filtrage par rayon (2/5/10/25 km), tri par distance.
- ✅ Badge de distance dans les cartes prestataires (« à X km »).
- ✅ Carte Leaflet des prestataires filtrés avec marqueurs et badges.
- ✅ Formulaire prestataire : champs latitude/longitude optionnels.

### Suivi de livraison sur carte (`deliveries.current_lat`, `deliveries.current_lng`)

- ✅ Page Commandes : carte de suivi livraison (PointMap) avec marqueur transporteur + destination + itinéraire pointillé.
- ✅ Hook `useUpdateDeliveryPosition` : mise à jour de la position temps réel du transporteur.
- ✅ Bouton « Simuler déplacement » en mode démo (avance le camion de 20 % vers la destination).
- ✅ Horodatage de la dernière position affiché dans le bloc livraison.

### Composant carte générique

- ✅ `PointsMap` (`src/components/points-map.tsx`) : carte Leaflet réutilisable avec points typés (`pin`, `project`, `provider`, `truck`, `target`), polyligne optionnelle, sélecteur de fond de carte partagé avec StoreMap.
- ✅ Types `MapPoint` et `MapPointKind` exportés.

### Seed démo

- ✅ Projet démo : coordonnées Godomey (6.4482, 2.3556).
- ✅ Prestataires : coordonnées déterministes avec dispersion (Cotonou / Abomey-Calavi).
- ✅ Commande démo : statut `en_livraison` avec livraison associée et position transporteur.
- ✅ Tests existants couvrant haversineKm, withinRadius, formatDistance (`geo.test.ts`).

## v0.34 — Vague 16 : Rentabilité Locative, Sécurité HSE, Badges QR Code, Bilan Carbone & Passerelles Live (2026-08-14)

### Simulateur de Rentabilité Locative Post-Construction (`src/lib/rental-yield.ts`, `src/components/rental-yield-dialog.tsx`)

- ✅ `calculateRentalYield` — simulation du rendement locatif brut et net, déduction des charges de gestion, taxes et provisions travaux, calcul du cash-flow mensuel et du délai d'amortissement (ROI).
- ✅ `RentalYieldDialog` — intégré dans `immobilier.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/rental-yield.test.ts`).

### Registre de Sécurité HSE & Check-list EPI Chantier (`src/lib/safety-audit.ts`, `src/components/safety-audit-dialog.tsx`)

- ✅ `evaluateHseAudit` — audit journalier de sécurité (EPI, travail en hauteur, extincteurs, trousse de secours, balisage), calcul du score de conformité HSE sur 100% et recommandations.
- ✅ `SafetyAuditDialog` — intégré dans `journal.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/safety-audit.test.ts`).

### Générateur de Badges d'Accès & QR Codes Intervenants (`src/lib/access-badge.ts`, `src/components/access-badge-dialog.tsx`)

- ✅ `generateAccessBadge` — création de badges et laissez-passer avec QR Code d'identification sécurisé par corps de métier (chef de chantier, artisan, manœuvre, visiteur, contrôleur).
- ✅ `AccessBadgeDialog` — intégré dans `prestataires.tsx` et `documents.tsx`.
- ✅ Tests unitaires (`src/lib/access-badge.test.ts`).

### Bilan Carbone BTP & Éco-Matériaux (`src/lib/carbon-footprint.ts`, `src/components/carbon-footprint-dialog.tsx`)

- ✅ `calculateCarbonFootprint` — calcul des émissions de CO2 équivalent selon le volume de ciment, acier, transport et énergie, avec potentiel d'économies en Briques de Terre Compressée (BTC).
- ✅ `CarbonFootprintDialog` — intégré dans `materiaux.tsx` et `rapports.tsx`.
- ✅ Tests unitaires (`src/lib/carbon-footprint.test.ts`).

### Passerelle de Paiement Live FedaPay / Kkiapay & Webhooks (`src/lib/payment-gateway.ts`, `src/components/payment-gateway-dialog.tsx`)

- ✅ `processPaymentWebhook` — gestion des clés API marchandes et simulateur de webhooks pour valider automatiquement les factures lors d'un paiement Mobile Money réussi.
- ✅ `PaymentGatewayDialog` — intégré dans `paiements.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/payment-gateway.test.ts`).

---

## v0.33 — Vague 15 : Contrats BTP, Planning Gantt, Transport, Assurance & Relances (2026-08-13)

### Contrats BTP & PV de Réception (`src/lib/contracts.ts`, `src/components/contract-generator-dialog.tsx`)

- ✅ `generateContractPdf` — générateur de contrat d'entreprise BTP à forfait, PV de réception provisoire et PV de réception définitive avec clauses d'acomptes, pénalités de retard et retenue de garantie 5%, exporté en PDF prêt à signer.
- ✅ `ContractGeneratorDialog` — intégré dans `documents.tsx` et `litiges.tsx`.
- ✅ Tests unitaires (`src/lib/contracts.test.ts`).

### Planning Prédictif Intelligent & Diagramme de Gantt (`src/lib/gantt-schedule.ts`, `src/components/gantt-schedule-dialog.tsx`)

- ✅ `generateConstructionSchedule` — calcul chronologique des étapes BTP avec gestion obligatoire des 21 jours incompressibles de durcissement du béton armé et affichage Gantt en barres.
- ✅ `GanttScheduleDialog` — intégré dans `calendrier.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/gantt-schedule.test.ts`).

### Simulateur Logistique & Coût de Transport (`src/lib/transport-cost.ts`, `src/components/transport-cost-dialog.tsx`)

- ✅ `calculateTransportCost` — estimation du transport des matériaux (bennes 6 roues 10m³, 10 roues 16m³, plateaux 20-30T), calcul kilométrique aller-retour et manutention de déchargement.
- ✅ `TransportCostDialog` — intégré dans `materiaux.tsx` et `boutique.tsx`.
- ✅ Tests unitaires (`src/lib/transport-cost.test.ts`).

### Assurance Chantier & Garantie Décennale TRC (`src/lib/insurance.ts`, `src/components/insurance-dialog.tsx`)

- ✅ `simulateConstructionInsurance` — calcul des primes Tous Risques Chantier (TRC), Responsabilité Civile et Décennale 10 ans avec partenaires béninois (NSIA, Sanlam, UAB).
- ✅ `InsuranceDialog` — intégré dans `budget.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/insurance.test.ts`).

### Centre de Relances Automatisées Factures & Impayés (`src/lib/payment-reminders.ts`, `src/components/payment-reminders-dialog.tsx`)

- ✅ `evaluateInvoiceReminder` — classification des factures (à venir, due aujourd'hui, en retard) et génération de relances instantanées avec boutons WhatsApp et lien Mobile Money.
- ✅ `PaymentRemindersDialog` — intégré dans `facturation.tsx` et `paiements.tsx`.
- ✅ Tests unitaires (`src/lib/payment-reminders.test.ts`).

---

## v0.32 — Vague 14 : Simulateur Coût Global, Solaire BTP, WhatsApp Pro & e-MECeF Bénin (2026-08-13)

### Simulateur de Coût Global & Générateur de Projet (`src/lib/simulator.ts`, `src/components/cost-simulator-dialog.tsx`)

- ✅ `simulateConstructionCost` — simulation basée sur les ratios réels au m² (Villa basse, Duplex R+1, Immeuble R+2/R+3, Clôture), ventilation des coûts par corps d'état (Gros œuvre 48%, Second œuvre 24%, Finitions 22%, Permis 6%) et bouton de création de projet en 1 clic.
- ✅ `CostSimulatorDialog` — intégré dans `projets.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/simulator.test.ts`).

### Dimensionnement Solaire & Forage Chantier (`src/lib/solar.ts`, `src/components/solar-calculator-dialog.tsx`)

- ✅ `calculateSolarSystem` — dimensionnement automatique des besoins électriques et pompe de forage (Wc panneaux 450W, kWh batterie Lithium, onduleur hybride kVA et budget global FCFA).
- ✅ `SolarCalculatorDialog` — intégré dans `budget.tsx` et `materiaux.tsx`.
- ✅ Tests unitaires (`src/lib/solar.test.ts`).

### Partageur WhatsApp Pro & Templates BTP (`src/lib/whatsapp-templates.ts`, `src/components/whatsapp-share-dialog.tsx`)

- ✅ `generateOrderTemplate`, `generateMilestoneCallTemplate`, `generateSiteFlashReportTemplate` — templates pré-formatés avec emojis pour quincailleries, clients et artisans avec redirection instantanée `wa.me`.
- ✅ `WhatsAppShareDialog` — intégré dans `tableau-de-bord.tsx` et `commandes.tsx`.

### Facturation Normalisée e-MECeF Bénin DGI (`src/lib/emecef.ts`, `src/components/emecef-invoice-dialog.tsx`)

- ✅ `calculateEmecefInvoice` — conformité fiscale (IFU émetteur/acheteur, NIM machine, TVA 18%, AIB 1%/5%, signature cryptographique e-MECeF et QR code de vérification DGI).
- ✅ `EmecefInvoiceDialog` — intégré dans `facturation.tsx`.
- ✅ Tests unitaires (`src/lib/emecef.test.ts`).

---

## v0.31 — Vague 13 : RH Main d'œuvre, Plans 2D interactifs, Tontine & Abonnements SaaS (2026-08-13)

### RH Chantier & Paie journalière (`src/lib/labor.ts`, `src/components/labor-management.tsx`)

- ✅ `calculateWorkerPay` & `calculateTotalPayroll` — gestion des ouvriers (maçons, manœuvres, ferrailleurs, coffreurs, électriciens), pointage quotidien (présent, 1/2 journée, absent, heures supp), calcul de la masse salariale et ordre de virement groupé Mobile Money.
- ✅ `LaborManagementDialog` — dialogue de pointage intégré dans `journal.tsx`.
- ✅ Tests unitaires (`src/lib/labor.test.ts`).

### Plans 2D Interactifs & Épinglage des réserves (`src/components/interactive-plan-viewer.tsx`)

- ✅ `InteractivePlanViewerDialog` — navigation sur plans d'architecte 2D, placement de pastilles/épingles par clic direct (coordonnées relatives X%/Y%), détail de la réserve avec statut (ouvert / résolu). Intégré dans `plans.tsx` et `reserves.tsx`.

### Tontine Matériaux & Financement Collaboratif (`src/lib/tontine.ts`, `src/components/tontine-dialog.tsx`)

- ✅ `calculateTontineStats` — cagnotte ciblée par étape de chantier, calcul du pourcentage financé, enregistrement des dons Mobile Money des proches/diaspora et conversion en bons d'achat quincaillerie.
- ✅ `TontineDialog` — intégré dans `budget.tsx`.
- ✅ Tests unitaires (`src/lib/tontine.test.ts`).

### Comparateur Visuel Avant / Après (`src/components/before-after-slider.tsx`)

- ✅ `BeforeAfterSliderDialog` — slider interactif comparant deux photos de chantier sous le même angle avec barre de séparation glissante. Intégré dans `photos.tsx`.

### Abonnements SaaS & Monétisation (`src/components/subscription-plans.tsx`)

- ✅ `SubscriptionPlansDialog` — 3 forfaits adaptés au marché (Gratuit, Pro Maître d'œuvre à 15 000 FCFA/mois, Quincaillerie Premium à 25 000 FCFA/mois avec commission réduite à 2%). Intégré dans `parametres.tsx`.

---

## v0.30 — Vague 12 : Outillage BTP, Séquestre, OCR & Offline Sync (2026-08-13)

### Outillage & Métré BTP (`src/lib/metre.ts`, `src/components/metre-calculator.tsx`)

- ✅ `calculateConcrete(l, w, th, dosage)` — cubage béton, sacs de ciment 50kg, sable, gravier, aciers HA (barres 12m)
- ✅ `calculateMasonry(l, h, openings, blockThickness)` — agglos 10/15/20cm, mortier de pose, ciment & sable
- ✅ `calculateRoofing(l, w, pitch, sheetLength)` — tôles bacs alu, pointes de toiture, faîtières
- ✅ `MetreCalculatorDialog` — dialogue interactif de dimensionnement intégré dans `materiaux.tsx` et `budget.tsx`
- ✅ Tests unitaires (`src/lib/metre.test.ts`)

### Fintech BTP & Séquestre (`src/components/escrow-dialog.tsx`)

- ✅ `EscrowDialog` — gestion des acomptes sous séquestre avec jalons d'avancement (30% fondations, 40% gros œuvre, 30% réception), preuves photos et libération sécurisée Mobile Money. Intégré dans le tableau de bord.

### OCR & Reçus intelligents (`src/lib/ocr-receipt.ts`, `src/components/receipt-scanner.tsx`)

- ✅ `parseReceiptText(text)` & `scanReceiptImage(file)` — extraction automatique du fournisseur, de la date, des montants en FCFA et des articles BTP (ciment, fer, sable, gravier, peinture...).
- ✅ `ReceiptScannerDialog` — intégré dans le formulaire de saisie rapide de dépense `quick-expense.tsx`.
- ✅ Tests unitaires (`src/lib/ocr-receipt.test.ts`)

### Météo & Aide au coulage béton (`src/lib/weather.ts`, `src/components/weather-widget.tsx`)

- ✅ `getWeatherForCity(city)` — conditions météo locales pour les villes du Bénin/Afrique de l'Ouest (Cotonou, Calavi, Parakou, Porto-Novo...) et indice prévisionnel de coulage du béton (favorable, vigilance pluie, vigilance chaleur). Intégré dans `tableau-de-bord.tsx`.

### Export Dossier Chantier Pro « Banque & Diaspora » (`src/lib/dossier-export.ts`)

- ✅ `exportDossierChantierPdf(data)` — génération d'un rapport PDF consolidé prêt pour les déblocages bancaires et les comptes-rendus à la diaspora.

### Mode Hors-Ligne & Synchronisation PWA (`src/lib/offline-sync.ts`, `src/components/offline-banner.tsx`)

- ✅ `useNetworkStatus()` & stockage des brouillons de chantier en mémoire locale.
- ✅ `OfflineBanner` — bandeau réactif dans `app-shell.tsx` affichant l'état réseau et synchronisant les brouillons au retour en ligne.

### Performance & Configuration

- ✅ `vitest.config.ts` : configuration `pool: 'threads'` pour des tests instantanés.

---

## v0.29 — Vague 11 : Géolocalisation & cartes (tranche 1 — rayon de livraison + carte boutiques) (2026-08-10)

### Migration

- `supabase/migrations/20260827000000_geo-livraison.sql`
  - ✅ Colonne `stores.delivery_radius_km` (rayon de livraison en km, nullable) + index

### Dépendance

- ✅ `leaflet` ^1.9.4, `react-leaflet` ^5.0.0, `@types/leaflet` ^1.9.22

### Géométrie (`src/lib/geo.ts`)

- ✅ `distanceKm(a, b)` — distance entre deux positions
- ✅ `withinRadius(point, center, radiusKm)` — test d'appartenance à un rayon
- ✅ `formatDistance(km)` — « 850 m », « 3,2 km »
- ✅ +6 tests (`src/lib/geo.test.ts`) → **53 tests**

### Carte (`src/components/store-map.tsx`)

- ✅ `StoreMap` : carte Leaflet multi-fournisseurs (**OpenStreetMap / Esri World / CARTO Voyager**), marqueurs boutiques (popup : ville, distance, rayon de livraison), cercles de rayon de livraison, position utilisateur

### Interface

- ✅ `boutique.tsx` : bouton **« Près de moi »** (géolocalisation navigateur) + sélecteur de rayon (2/5/10/25 km), panneau carte, filtre des produits par boutique dans le rayon, tri « Près de moi », badge distance « à X km » sur chaque carte produit
- ✅ `ma-boutique.tsx` : champ **Rayon de livraison (km)** dans le formulaire boutique

### Démo

- ✅ Seeds : `delivery_radius_km` (10 / 25 / 5 km) sur les 3 boutiques

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur (18 warnings préexistants) · **53 tests OK**

---

## v0.28 — Vague 10 : Immobilier promoteurs (2ème tranche — acompte réservation mobile money) (2026-08-10)

### Migration

- `supabase/migrations/20260826000000_immobilier-promoteurs.sql` (amendée, non appliquée en base)
  - ✅ Colonne `property_reservations.deposit_paid` (acompte de réservation payé)

### Interface (`src/routes/_authenticated/immobilier.tsx`)

- ✅ **Dossiers clients** : badge « Acompte payé » + bouton **« Payer l'acompte »** sur les dossiers en demande/confirmés sans acompte → `MobileMoneyDialog` (montant éditable, `onConfirmed` → `deposit_paid`)
- 🔧 Refactor : extraction du composant `ReservationRow` (actions confirmer/vendre/annuler + paiement acompte)

### Démo

- 🔧 Seeds : dossier confirmé « Awa Sossou » → `deposit_paid: true`, dossier demande « Jean Mensah » → `deposit_paid: false` (bouton paiement visible)

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur (18 warnings préexistants) · **47 tests OK**

---

## v0.27 — Vague 10 : Immobilier promoteurs (2026-08-10)

### Migration

- `supabase/migrations/20260826000000_immobilier-promoteurs.sql`
  - ✅ Enums `development_program_status` (planification / commercialisation / en_construction / livre), `building_status`, `property_unit_type` (appartement, villa, boutique, bureau, terrain, garage, magasin), `property_unit_status` (disponible / reserve / vendu), `property_reservation_status` (demande → confirmee → vendue, + annulee)
  - ✅ Table `development_programs` : promoteur, nom, description, ville/adresse, statut, **budget/objectif de ventes**, dates — RLS (lecture tous connectés, écriture promoteur)
  - ✅ Table `buildings` : programme, nom, étages, statut — RLS (écriture via le promoteur du programme)
  - ✅ Table `property_units` (lots) : immeuble, étage, référence, type, surface, pièces, salles de bain, **prix**, statut — RLS (écriture via promoteur)
  - ✅ Table `property_reservations` (dossiers clients) : lot, auteur, chantier, nom/téléphone/email du client, montant, notes, statut — RLS (auteur + promoteur du programme)
  - ✅ Index + triggers `updated_at` sur les 4 tables

### Hooks (`src/lib/data.ts`)

- ✅ `computeProgramStats(units)` — pur et testé : total / disponibles / réservés / vendus / montant encaissé / avancement %
- ✅ `useDevelopmentPrograms()` (catalogue) / `useMyDevelopmentPrograms()` (mes programmes) / `useBuildings(programId)` / `usePropertyUnits(buildingId)` / `useProgramUnits(programId)` (lots d'un programme, jointure immeubles)
- ✅ `useMyPropertyReservations()` / `useCreatePropertyReservation()` (dossier statut « demande »)
- ✅ `useUpdatePropertyReservationStatus()` — confirmee → lot `reserve`, vendue → lot `vendu`, annulee → lot `disponible`
- ✅ CRUD via `useSaveRow`/`useDeleteRow` (`development_programs`, `buildings`, `property_units`)

### Interface (`src/routes/_authenticated/immobilier.tsx`)

- ✅ Route `/immobilier` (feature `marketplace`) avec 2 onglets :
  - **Programmes** : cartes (statut, barre d'avancement des ventes, vendus/réservés/dispo, objectif), création/édition/suppression ; détail d'un programme (stats + budget vs encaissé) puis immeubles et lots (CRUD) ; « Réserver » un lot → crée le dossier client, « Rendre disponible »
  - **Dossiers clients** : liste par programme, sélecteur de programme, « Nouveau dossier » (choix du lot disponible), Confirmer / Vendre / Annuler
- ✅ Entrée de navigation `nav.immobilier` (FR/EN), icône `Building2`

### Démo

- ✅ Seeds : programme « Résidence Les Palmiers » (Cotonou, objectif 650 MFCFA), 2 immeubles, 6 lots (2 vendus, 1 réservé, 3 disponibles), 2 dossiers clients (1 confirmé, 1 demande)

### Tests

- ✅ `computeProgramStats` : 3 tests (comptage + montant vendu, avancement % , programme vide) → **47 tests OK**

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur (18 warnings préexistants)

---

## v0.26 — Vague 9 : Location de matériel (2ème tranche — disponibilité, QR retour, caution) (2026-08-10)

### Migration

- `supabase/migrations/20260825000000_location-materiel.sql` (amendée, non appliquée en base)
  - ✅ Colonnes `equipment_rentals` : **`return_code`** (code de remise à 6 caractères, affiché en QR) et **`deposit_paid`** (caution payée)

### Hooks (`src/lib/data.ts`)

- ✅ `hasRentalConflict(rentals, equipmentId, start, end, excludeId?)` — pur et testé : détecte un chevauchement de période avec une location active (`demande`/`confirmee`/`en_cours`/`retour_en_cours`)
- ✅ `generateReturnCode()` — code de remise à 6 caractères sans caractères ambigus (alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`)
- ✅ `useReturnEquipmentRental()` — valide le code de remise (QR) → statut `terminee` + `returned_at` + matériel `disponible` + notification au client
- 🔧 `useCreateEquipmentRental()` — génère le `return_code` à la création

### Interface (`src/routes/_authenticated/location.tsx`)

- 🔧 **Catalogue** : blocage d'une réservation qui chevauche une période déjà réservée par le même client (toast + garde sur le formulaire)
- ✅ **Demandes reçues** : confirmation vérifiée contre le chevauchement avec les autres locations actives du matériel (le propriétaire tranche la disponibilité) ; au retour (`retour_en_cours`) saisie du **code de remise** du client à valider
- ✅ **Mes demandes** : **QR de remise** généré (`BATIBENIN:RETOUR:<code>`, lib `qrcode`) affiché au client en `en_cours`/`retour_en_cours` avec bouton copier ; badge « Caution payée »
- ✅ **Paiement de la caution** par mobile money (bouton « Payer la caution » sur une location confirmée → `MobileMoneyDialog`, mise à jour `deposit_paid` via `onConfirmed`)

### Composants

- 🔧 `MobileMoneyDialog` : prop optionnelle `onConfirmed` (callback après confirmation du paiement)

### Démo

- 🔧 Location de démonstration passée à `en_cours` avec `return_code` + `deposit_paid` (QR et badge visibles)

### Tests

- ✅ `hasRentalConflict` : 5 tests (chevauchement, locations terminées ignorées, par équipement, exclusion, période libre) ; `generateReturnCode` : 2 tests → **44 tests OK**

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur (18 warnings préexistants)

---

## v0.25 — Vague 9 : Location de matériel (1ère tranche) (2026-08-09)

### Migration

- `supabase/migrations/20260825000000_location-materiel.sql`
  - ✅ Enums `equipment_status` (`disponible` / `loue` / `hors_service`), `equipment_condition` (`excellent` / `bon` / `moyen` / `mauvais`), `equipment_rental_status` (`demande` → `confirmee` → `en_cours` → `retour_en_cours` → `terminee`, + `annulee` / `litige`)
  - ✅ Table `equipment` : propriétaire, nom, catégorie, marque/modèle, ville, prix jour/semaine, **caution**, quantité, état, statut — RLS catalogue (lecture tous connectés, écriture propriétaire)
  - ✅ Table `equipment_rentals` : matériel, client, chantier, période, tarifs figés, total calculé, livraison (adresse + frais), retour — RLS (client + propriétaire du matériel)
  - ✅ Index + triggers `updated_at`

### Hooks (`src/lib/data.ts`)

- ✅ `computeRentalPrice(daily, weekly, start, end)` — pur et testé : semaines au tarif hebdo + jours restants au tarif jour, minimum 1 jour
- ✅ `useEquipment()` (catalogue) / `useMyEquipment()` (mon parc) / `useMyEquipmentRentals()` (mes demandes)
- ✅ `useCreateEquipmentRental()` — tarif calculé à la création, notification au propriétaire
- ✅ `useUpdateEquipmentRentalStatus()` — confirmation → matériel `loue`, retour → `disponible` + `returned_at`, notification
- ✅ CRUD du matériel via `useSaveRow`/`useDeleteRow` (`equipment`)

### Interface (`src/routes/_authenticated/location.tsx`)

- ✅ Route `/location` (feature `marketplace`) avec 3 onglets :
  - **Catalogue** : grille du matériel disponible, recherche + filtre par catégorie, carte (prix jour/semaine/caution, état, quantité) + boîte « Réserver » (période, livraison)
  - **Mon matériel** : parc avec statut/état, ajout, modification (formulaire pré-rempli), retrait
  - **Mes locations** : demandes reçues sur mon matériel (confirmer / démarrer / retour reçu / annuler) + mes demandes en tant que client
- ✅ Entrée de navigation `nav.location` (FR/EN), icône `Wrench`

### Démo

- ✅ Seeds : 4 équipements (groupe électrogène, brouette, bétonnière, échafaudage) + 1 location confirmée

### Tests

- ✅ `computeRentalPrice` : 4 tests (3 jours, semaine complète, semaines + jours, minimum 1 jour) → **37 tests OK**

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur

---

## v0.24 — Vague 8 : Notifications multi-canal (tranche 2 — page, push navigateur & SMS) (2026-08-09)

### Page « Mes notifications » (`src/routes/_authenticated/notifications.tsx`)

- ✅ Nouvelle route `/notifications` (feature `alertes`) : historique complet (200 dernières), filtres par `kind` + bascule « Non lues », bouton « Tout marquer lu »
- ✅ Chaque ligne : icône par type, pastille non lue, badge type + date/heure, navigation vers le `link`, marquer lu/non lu, supprimer
- ✅ Entrée de navigation ajoutée dans `app-shell` (`nav.notifications`, FR/EN)

### Hooks (`src/lib/data.ts`)

- ✅ `useMarkNotificationRead({ id, read })` — marque une notification lue ou non lue (guest + Supabase)
- ✅ `useDeleteNotification()` (via `useDeleteRow("notifications")`)

### Push navigateur (Notification API)

- ✅ La cloche émet une **notification système** (`new Notification`) pour les nouveaux événements non lus quand l'autorisation est accordée
- ✅ Paramètres : bloc « Notifications navigateur » — demande d'autorisation + enregistrement de l'appareil `web` (état Activé/Bloqué/en attente)

### Partage par SMS (`commandes`)

- ✅ Bouton « Envoyer par SMS » (lien `sms:` avec le texte du lien de paiement) à côté du partage WhatsApp existant

### Divers

- ✅ `frDateTime()` ajouté à `src/lib/format.ts` (date + heure)

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur · 33 tests OK

---

## v0.23 — Vague 8 : Notifications multi-canal (tranche 1 — infrastructure & in-app) (2026-08-09)

### Migration

- `supabase/migrations/20260824000000_notifications-multicanal.sql`
  - ✅ Enums `notification_channel` (`in_app` / `email` / `push` / `sms` / `whatsapp`) et `notification_kind` (`alerte` / `commande` / `livraison` / `paiement` / `devis` / `rapport` / `litige` / `verification` / `assistant`)
  - ✅ Table `notifications` (persistées) : `user_id`, `project_id`, `channel`, `kind`, `title`, `body`, `link`, `read_at`, `created_at` — RLS propriétaire + index `user_id, created_at DESC` + index partiel sur les non-lues
  - ✅ Table `device_tokens` : `user_id`, `token`, `platform`, `last_seen_at` — contrainte `UNIQUE (user_id, token)`, RLS propriétaire
  - ✅ `notification_preferences` étendue : colonnes `push_enabled`, `sms_enabled`, `whatsapp_enabled` (default `true`)

### Hooks de données (`src/lib/data.ts`)

- ✅ `useNotifications(limit)` / `useUnreadNotificationCount()` / `useMarkNotificationsRead()` — notifications persistées de l'utilisateur courant (guest + Supabase)
- ✅ `useAddNotification()` + helper `addPersistedNotification()` (fire-and-forget) — création de notifications depuis les mutations
- ✅ `useDeviceTokens()` / `useRegisterDeviceToken()` (upsert `user_id,token`) / `useRemoveDeviceToken()` — appareils pour le push
- ✅ `AppNotification`, `AppNotificationChannel`, `AppNotificationKind`, `DeviceToken`, `NOTIFICATION_KIND_LABELS`, `NOTIFICATION_CHANNEL_LABELS`
- ✅ `DEFAULT_NOTIFICATION_PREFS` étendu avec les 3 canaux

### Cloche de notifications (`src/components/notifications-bell.tsx`)

- 🔧 La cloche affiche désormais les **notifications persistées** (icône selon `kind`, pastille pour les non-lues) en plus des alertes métier calculées et des actions d'audit sensibles
- 🔧 Ouverture de la cloche → tout marqué lu (`read_at`)

### Événements câblés

- ✅ `useCreateOrder` → « Commande passée » (kind `commande`)
- ✅ `useUpdateDeliveryStatus` → « Livraison mise à jour » (kind `livraison`)
- ✅ `useConfirmMobileMoney` → « Paiement confirmé » (kind `paiement`)
- ✅ `useAddMaterialDelivery` → « Livraison de matériaux enregistrée » (kind `livraison`)

### Préférences de canaux (`src/routes/_authenticated/parametres.tsx`)

- ✅ Toggles **Push / SMS / WhatsApp** ajoutés aux préférences de notification (indépendants de l'interrupteur e-mail)
- ✅ Enregistrement automatique du navigateur comme appareil `web` (id stable par navigateur) dans `app-shell.tsx`

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur · 33 tests OK

---

## v0.22 — Vague 7 : IA (2e tranche — Achats avancés & fournisseur) (2026-08-09)

### IA Achats — comparaison multi-boutiques & calcul de quantités (`src/routes/_authenticated/assistant.tsx`)

- 🔧 `materialsReply` : pour chaque besoin restant, sélectionne la **meilleure offre en stock** parmi toutes les boutiques (nom normalisé, prix croissant) et affiche le libellé de la boutique
- 🔧 `suggestOrderQuantity()` : arrondit la quantité au **multiple de la commande minimale** du produit retenu
- 🔧 Estimation du plan d'achat au meilleur prix + **économie estimée** vs prix de référence
- 🔧 `recommendationsReply` : « meilleures notes » et « meilleurs prix » du catalogue, avec nom de boutique pour chaque suggestion
- 🔧 Nouvelles intentions : « meilleur prix », « boutique » ; `inferType` étendu (prix, stock, réappro, rupture)

### IA fournisseur — prévision de stock (`src/lib/data.ts`)

- ✅ `StockForecast` + `computeStockForecast()` (purement calculé) : vélocité de vente 30 j, jours de couverture restants, quantité de réappro suggérée, statut `rupture/critique/bas/ok`
- ✅ `useStoreStockForecast(storeId)` — prévision de la boutique du fournisseur connecté (guest + Supabase)
- ✅ Panel **« Prévision de stock (30 j) »** dans `/assistant` (visible pour le rôle `quincaillerie`) : produits à risque + jour restants + réappro suggéré
- ✅ `supplierForecastReply` : réponse conversationnelle « stock / réappro / rupture » pour la quincaillerie

### Descriptions IA de produits (`src/lib/data.ts` + `ma-boutique`)

- ✅ `suggestProductDescription(product, categoryName)` — générateur à base de règles (nom, marque, unité, caractéristiques, garantie)
- ✅ Bouton « Générer une description IA » (✨) dans le formulaire produit de « Ma boutique », pré-remplit la description

### Tests

- ✅ `src/lib/data.test.ts` : 7 tests (rupture, jours de couverture, commandes annulées ignorées, réappro minimal, tri par criticité, génération de description)

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur · 33 tests OK

---

## v0.21 — Vague 7 : IA (1ère tranche — Assistant conversationnel) (2026-08-09)

### Migrations

- `supabase/migrations/20260823000000_assistant-ia.sql`
  - ✅ `ai_conversations` : fils de discussion persistés (utilisateur, chantier, titre, rôle)
  - ✅ `ai_actions` : actions proposées par l'assistant (type `ai_action_type`, titre, payload JSONB)
  - 🔒 RLS : conversations et actions privées (lecture/écriture du propriétaire uniquement)

### Données & hooks (`src/lib/data.ts`)

- ✅ `useAiConversations()` / `useAiActions(conversationId)` — liste les fils et leurs actions
- ✅ `useUpsertAiConversation()` — crée ou renomme un fil (double branche guest/Supabase)
- ✅ `useAddAiAction()` — enregistre une action dans un fil
- ✅ Types exportés `AiConversation`, `AiAction`, `AiActionType`

### Rôles & navigation

- ✅ Feature `assistant` ajoutée aux 7 rôles de `src/lib/roles.ts` (accès `full`)
- ✅ Menu « Assistant IA » (`/assistant`) + libellé i18n FR/EN

### UI

- ✅ `src/routes/_authenticated/assistant.tsx` : assistant conversationnel par rôle
  - ✅ Moteur à base de règles : achats, budget, planning, recommandations, état global
  - ✅ IA Achats : liste les besoins matériaux restants, estime le coût, propose l'ajout au panier
  - ✅ Notes vocales « Parler au chantier » : reconnaissance vocale Web Speech (bouton micro)
  - ✅ Persistance : fil + actions enregistrés à chaque question

### Démo (`src/lib/demo-store.ts`)

- ✅ 2 conversations et 3 actions seedées (achats matériaux, recalibrage budget)

### Validation

- ✅ `tsc --noEmit` 0 erreur · `npm run build` OK · `eslint .` 0 erreur (18 warnings fast-refresh tolérés) · 26 tests OK

---

## v0.20 — Vague 6 : Confiance & vérification (2026-08-09)

### Migrations

- `supabase/migrations/20260822000000_confiance-verification.sql`
  - ✅ `verification_documents` : soumission de documents par les professionnels (type `identite/rccm/patente/cnps/quittance/permis/diplome`, note, statut `en_attente/approuve/rejete`, note admin, réviseur, date de revue)
  - ✅ `market_reviews` : avis étendus sur le marketplace avec `target_type` (`store`/`product`/`driver`) + `target_id`, note 1–5, commentaire, flag `verified` (achat réel)
  - ✅ Contrainte `UNIQUE (user_id, target_type, target_id)` : **un seul avis par utilisateur et par cible** (lutte anti-faux avis)
  - ✅ `provider_reviews.verified` ajouté + contrainte `UNIQUE (user_id, provider_id)` (anti-doublon)
  - ✅ `products.rating` / `products.review_count` ajoutés (cohérence avec stores & drivers)
  - 🔒 RLS : documents lisibles propriétaire ou admin, écritures propriétaire ou admin ; `market_reviews` lisibles par tous, écritures auteur

### Données & hooks (`src/lib/data.ts`)

- ✅ `useProfileVerification()` — niveau de confiance du profil courant
- ✅ `useMyVerificationDocuments()` / `useAllVerificationDocuments()` — documents soumis (moi / tous, admin)
- ✅ `useSubmitVerificationDocument()` — soumet un document
- ✅ `useReviewVerificationDocument()` — décision admin : approuve/rejette et met à jour `profile_verifications` (niveau, `verified_documents`, `verified_at`)
- ✅ `useMarketReviews(targetType, targetId)` / `useAddMarketReview()` — liste et ajoute un avis, recalcule la note moyenne de la cible (boutique/produit/transporteur)
- 🔧 `useAddProviderReview()` — supporte le flag `verified`
- ✅ `useAdminStats()` — compte les documents de vérification

### Format (`src/lib/format.ts`)

- ✅ `VERIFICATION_DOC_TYPES`, `VERIFICATION_DOC_STATUSES`, `REVIEW_TARGETS`

### UI

- ✅ `src/routes/_authenticated/parametres.tsx` : section « Vérification du profil » — badge de statut, indicateurs identité/entreprise/documents, formulaire de soumission, liste des documents avec statut
- ✅ `src/routes/_authenticated/admin.verifications.tsx` : back-office de validation des documents (filtres, approbation/rejet avec note) ; nav admin + i18n FR/EN + carte sur `admin/index`
- ✅ `src/components/market-reviews.tsx` : bloc d'avis réutilisable (note, liste avec badge « Achat vérifié », formulaire, anti-doublon)
- ✅ `src/components/product-compare.tsx` : avis produit dans la fiche détaillée
- ✅ `src/routes/_authenticated/panier.tsx` : note/vérification du transporteur sélectionné
- 🔧 `src/routes/_authenticated/prestataires.tsx` : badge « Achat vérifié » sur les avis + flag selon le niveau de vérification

### Démo (`src/lib/demo-store.ts`)

- ✅ 2 documents seedés (RCCM approuvé, identité en attente), 3 avis marketplace (boutique/produit/transporteur), notes de produits, driver extrait en constante réutilisable

---

## v0.19 — Audit complet de la plateforme (2026-08-09)

### Documentation

- ✅ `docs/audit-2026-08-09.md` : analyse de build (build ✅, `tsc` 21 erreurs, ESLint 648 erreurs de formatage, 26 tests verts), poids des bundles, cartographie fonctionnelle, rapport des manques et plan d'exécution en 10 étapes.

### À noter

- ⚠️ **Dérive base de données critique** : la base ne contient que 13 tables alors que le code en interroge 46. Les migrations `20260810000000` → `20260821000000` ne sont pas appliquées, ainsi que les buckets `documents` / `demo-attachments` et les RPC `get_shared_project` / `get_payment_link_order`. Une vingtaine de pages sont donc non fonctionnelles. Étape 0 du plan.
- ⚠️ Les 21 erreurs TypeScript et la majorité des erreurs ESLint découlent de cette dérive (`src/integrations/supabase/types.ts` régénéré sur une base incomplète).

## v0.18 — Vague 5 : Litiges & remboursements (2026-08-09)

### Migrations

- `supabase/migrations/20260821000000_litiges-remboursements.sql`
  - ✅ `disputes` : litige ouvert (référence, objet, description, type, montant litigieux, statuts `ouverte/en_examen/decide/cloture`, décision de médiation `favorable_demandeur/favorable_defendeur/partiel`, note et date de décision)
  - ✅ `dispute_evidences` : preuves déposées (note, `file_path`), liées à un litige
  - ✅ `refunds` : remboursement émis (montant, méthode `mobile_money/virement/carte`, statuts `initie/en_attente/effectue/echoue`, référence, date de traitement)
  - 🔒 RLS : litiges lisibles par tous (médiation transparente), écritures propriétaire ou admin ; preuves lisibles par l'auteur/litige/admin ; remboursements lisibles par l'auteur ou admin ; triggers `updated_at`

### Données & hooks (`src/lib/data.ts`)

- ✅ `useDisputes()` — tous les litiges ; `useMyDisputes()` — les miens
- ✅ `useDisputeEvidences(disputeId)` — preuves ; `useRefunds(disputeId)` — remboursements
- ✅ `useDecideDispute()` — rend une décision de médiation ; `disputeRef()` — génère `LIT-YYYY-XXXXX`
- ✅ `TableName` / `RELATED` : `disputes`, `dispute_evidences`, `refunds` ajoutés (liés entre eux)

### Format (`src/lib/format.ts`)

- ✅ `DISPUTE_STATUSES`, `DISPUTE_DECISIONS`, `DISPUTE_TYPES`, `REFUND_METHODS`, `REFUND_STATUSES`

### UI

- ✅ `src/routes/_authenticated/litiges.tsx` : « Mes litiges » / « Tous les litiges » — ouvrir un litige, déposer des preuves, émettre un remboursement, rendre une décision de médiation ; feature `marketplace`
- ✅ Navigation : entrée « Litiges & médiation » + i18n FR/EN

### Démo (`src/lib/demo-store.ts`)

- ✅ 1 litige ouvert (livraison ciment) + 1 preuve seedés ; reset projet étendu

---

## v0.17 — Vague 5 : Demande de devis en ligne (2026-08-09)

### Migrations

- `supabase/migrations/20260820000000_demandes-devis.sql`
  - ✅ `quote_requests` : besoin décrit par un particulier (titre, description, `category`, budget min/max, ville/commune, date limite, statut `ouverte/attribuee/cloturee`, `winner_bid_id`)
  - ✅ `quote_bids` : offre chiffrée d'un prestataire (montant, message, statut `soumise/acceptee`) liée à une demande
  - 🔒 RLS : demandes lisibles par tous les connectés (pour répondre), écritures réservées au propriétaire ; offres lisibles par le demandeur + l'auteur, écritures réservées à l'auteur ; index + triggers `updated_at`

### Données & hooks (`src/lib/data.ts`)

- ✅ `useQuoteRequests()` — toutes les demandes (feed des besoins ouverts)
- ✅ `useMyQuoteRequests()` — mes demandes (suivi des offres reçues)
- ✅ `useQuoteBids(requestId)` — offres d'une demande
- ✅ `useMyQuoteBids()` — mes offres déposées
- ✅ `useAwardQuoteBid()` — attribue le devis gagnant (`status=attribuee` + `winner_bid_id`)
- ✅ `TableName` / `RELATED` : `quote_requests` et `quote_bids` ajoutés (entrecroisés)

### Format (`src/lib/format.ts`)

- ✅ `QUOTE_REQUEST_STATUSES` (ouverte/attribuée/clôturée) et `QUOTE_BID_STATUSES` (soumise/acceptée)

### UI

- ✅ `src/routes/_authenticated/demandes-devis.tsx` : deux onglets — « Mes demandes » (publication, offres reçues, attribution) et « Répondre aux besoins » (recherche/domaine, dépôt d'offre) ; feature `marketplace`
- ✅ Navigation : entrée « Demandes de devis » (icône TicketCheck) + i18n FR/EN

### Démo (`src/lib/demo-store.ts`)

- ✅ `quote_requests` (3 demandes : clôture, électricité, peinture) et `quote_bids` seedés ; reset projet étendu

---

## v0.16 — Vague 3/4 : Lignes de devis & factures (2026-08-09)

### Migrations

- `supabase/migrations/20260819000000_devis-lignes.sql`
  - ✅ `quote_items` : lignes de devis (designation, `quantity` numeric, `unit`, `unit_price`), FK `quotes`, RLS propriétaire, trigger `updated_at`
  - ✅ `invoice_items` : lignes de factures (designation, `quantity` text, `unit`, `unit_price`), FK `invoices`, RLS propriétaire, trigger `updated_at`

### Données & hooks (`src/lib/data.ts`)

- ✅ `useQuoteItems(quoteId)` — lignes d'un devis
- ✅ `useInvoiceItems(invoiceId)` — lignes d'une facture
- ✅ `TableName` / `RELATED` : `quote_items` et `invoice_items` ajoutés (liés à `quotes` / `invoices`)

### UI

- ✅ `src/routes/_authenticated/devis.tsx` : devis dépliable sous la forme d'une ligne « Lignes du devis » — ajout/édition/suppression de postes (désignation, quantité, unité, prix unitaire), total automatique
- ✅ `src/routes/_authenticated/facturation.tsx` : détail des postes d'une facture (liste designations + totaux)

### Démo (`src/lib/demo-store.ts`)

- ✅ `quote_items` seedés sur les 3 devis démo et `invoice_items` sur les factures démo ; reset projet étendu

---

## v0.15 — Vague 3 : Paiements mobile money (sandbox) (2026-08-09)

### Migrations

- `supabase/migrations/20260818000000_mobile-money.sql`
  - ✅ `payment_transactions` : transactions de paiement mobile money (montant, devise, `provider`, téléphone, statuts `initiee/en_attente/confirmee/echouee/annulee`, `reference`, `transaction_id`, `raw_response`)
  - 🔧 `payments` : colonnes `provider`, `transaction_id`, `status` (+ `phone` selon besoin)
  - 🔒 RLS : `payment_transactions` propriétaire uniquement (lecture/écriture) + admin ; index sur user/project/order/status ; trigger `updated_at`
  - ✅ Enums `payment_provider` (mtn_momo, moov_money, paydunya, bankly, cmi, paystack) et `payment_transaction_status`

### Hooks (`src/lib/data.ts`)

- ✅ `usePaymentTransactions(projectId)` — transactions du chantier
- ✅ `useInitiateMobileMoney()` — initie un paiement (transaction `initiee`, sandbox) ; marque la commande `payee` si `order_id`
- ✅ `useConfirmMobileMoney()` — confirme la transaction (simule le retour passerelle) **et crée automatiquement le `payments` associé**
- ✅ `useCancelMobileMoney()` — annule une transaction initiée
- ✅ `TableName` / `RELATED` : `payment_transactions` ajouté (lié à `orders`, `payments`)

### Format (`src/lib/format.ts`)

- ✅ `PAYMENT_PROVIDERS` (passerelles) et `PAYMENT_TRANSACTION_STATUSES` (libellés)

### UI

- ✅ `src/components/mobile-money-dialog.tsx` : dialogue de paiement mobile money (montant, opérateur, numéro → initier → confirmer/échouer), sandbox de démo
- ✅ `src/routes/_authenticated/paiements.tsx` : bouton « Payer par mobile money » + section « Transactions mobile money » (date, passerelle, montant, badge statut)
- ✅ `src/routes/_authenticated/commandes.tsx` : bouton « Payer par mobile money » sur une commande en attente de paiement — à la confirmation, la commande passe automatiquement `payee`
- ✅ `src/routes/_authenticated/panier.tsx` : commande passée avec un moyen mobile money → passe en `paiement_en_attente` et ouvre automatiquement le dialogue de paiement ; à la confirmation la commande passe `payee`
- ✅ **Liens de paiement partageables** : RPC `get_payment_link_order` (lecture publique d'une commande par référence, sécurisée `SECURITY DEFINER`), page publique `src/routes/paiement.$reference.tsx` (résumé de commande + paiement mobile money), bouton « Partager le lien de paiement » (WhatsApp + copie) sur le détail de commande
- ✅ **Paiement à la livraison** : nouvelle méthode `a_la_livraison` (`PAYMENT_METHODS`) — la commande reste en attente de livraison sans transaction en ligne ; page de lien de paiement adaptée (montant réglé au dépositaire)

### Demo

- ✅ `demo-store.ts` : 3 `payment_transactions` (2 confirmées MTN/Moov + 1 échouée) sur le chantier démo ; `seed`/reset étendus

### Validation

- ✅ `npm run build` · `npx tsc --noEmit` · `npx eslint .` · `npm run test` (26 tests) — tout vert

---

## v0.14 — Vague 3 : Matériaux & inventaire chantier (2026-08-09)

### Migrations

- `supabase/migrations/20260817000000_materiaux-inventaire.sql`
  - ✅ `material_requirements` : besoins en matériaux d'un chantier (`quantity_needed` / `quantity_ordered` / `quantity_delivered` / `quantity_consumed`, `unit_price`, `supplier_id`, statuts `besoin/commande/partiel/livre/termine`)
  - ✅ `material_deliveries` : livraisons de matériaux (quantité, prix unitaire, date, statuts `planifiee/en_route/partielle/livree/annulee`)
  - 🔒 RLS : propriétaire du chantier uniquement (lecture/écriture) + admin

### Hooks (`src/lib/data.ts`)

- ✅ `useMaterialRequirements(projectId)` — besoins du chantier
- ✅ `useMaterialDeliveries(projectId)` — livraisons du chantier (tri date décroissante)
- ✅ `useAddMaterialRequirement()` — crée un besoin (statut initial `besoin`)
- ✅ `useUpdateMaterialRequirement()` — met à jour quantités/statut/fournisseur
- ✅ `useAddMaterialDelivery()` — crée une livraison **et met à jour automatiquement** `quantity_delivered` + statut du besoin lié (`livre` si ≥ besoin, sinon `partiel`)
- ✅ `TableName` / `RELATED` : `material_requirements`, `material_deliveries` ajoutés

### UI

- ✅ `src/routes/_authenticated/materiaux.tsx` : nouvelle page « Matériaux chantier » (nav, gate `stock`)
  - Table des besoins : désignation, catégorie, quantités (besoin/livré/consommé/restant), barre de progression, montant estimé, badge statut
  - Panneau « À commander encore » (reste > 0)
  - Bouton « Livrer » par besoin → dialogue de livraison ; clôture (statut `termine`) une fois entièrement livré
  - Historique « Livraisons récentes » (20 dernières) avec suppression
- ✅ `src/routes/changelog.tsx` : **page publique « Nouveautés »** du site (accessible sans compte, lien dans le footer de la landing)
- ✅ Nav : entrée « Matériaux chantier » (icône `Package`, feature `stock`), clé i18n `nav.materiaux`

### Demo

- ✅ `demo-store.ts` : 3 besoins (`material_requirements`) + 3 livraisons (`material_deliveries`) sur le chantier démo ; `seed`/reset étendus
- ✅ `types.ts` : 2 tables ajoutées avant `materials` (ordre alphabétique)

### Validation

- ✅ `npm run build` · `npx tsc --noEmit` · `npx eslint .` · `npm run test` (26 tests) — tout vert

---

## v0.13 — Vague 2 : E-commerce avancé + comparateur (2026-08-09)

### Migrations

- `supabase/migrations/20260816000000_ecommerce.sql`
  - ✅ `product_prices` : historique des prix (trigger `track_product_price_change` branché sur `products.price` / `compare_price`)
  - ✅ `product_inventory` : mouvements de stock (`stock_init`, `sale`, `restock`, `adjustment`, `return`, `cancellation`)
  - 🔒 RLS : `product_prices` lisible par tous (transparence) + écriture propriétaire/admin ; `product_inventory` réservé propriétaire/admin

### Hooks (`src/lib/data.ts`)

- ✅ `useProductPrices(productId)` — historique des prix d'un produit
- ✅ `useProductInventory(productId)` — mouvements de stock
- ✅ `useAddInventoryMovement()` — ajoute un mouvement + ajuste `products.stock`
- ✅ `useCompareOffers(productId, position?)` — offres concurrentes (même catégorie + nom normalisé), avec distance, économie, stock
- ✅ `useStoreAnalytics(storeId)` — CA, panier moyen, nb commandes, ruptures, meilleures ventes (type `StoreAnalytics`)

### Outillage

- ✅ `src/lib/geo.ts` : `haversineKm(lat1,lng1,lat2,lng2)` + hook `useGeolocation(enabled)` (API navigateur)
- 🗑️ Colonne démo `lat`/`lng` ajoutée aux boutiques du demo-store ; 3ᵉ boutique (même ciment, prix concurrent)

### UI

- ✅ `src/components/product-compare.tsx` : fiche produit enrichie (galerie multi-images, caractéristiques, garantie, marque/réf, quantité min) + **comparateur de prix** avec tri « près de moi »
- ✅ `boutique.tsx` : cartes cliquables → `ProductDetailDialog` ; `ProductCard` rendu en `button` pour l'accessibilité
- ✅ `src/components/store-analytics.tsx` : `StoreAnalytics` (KPI cards), `TopProducts`, `RecentSales`, `ProductMovement` (suivi stock + historique prix par produit)
- ✅ `ma-boutique.tsx` : panneaux analytics intégrés, bouton mouvement de stock sur chaque produit

### Tests

- ✅ `src/lib/geo.test.ts` : 4 tests `haversineKm` (points identiques, Cotonou→Calavi, entier, intercontinental) → **26 tests au total**

### Décisions

- 🗑️ `product_images` jugé inutile (déjà couvert par `products.images[]`)
- 🗑️ Recherche géographique « carte complète » reportée en Vague 11 ; le comparateur « près de moi » couvre le besoin immédiat
- `types.ts` : 2 tables ajoutées (`product_prices`, `product_inventory`) avant `products` (ordre alphabétique)

---

## v0.12 — Vague 1 : Socle collaboration & multi-tenant (2026-08-09)

### Migrations

- `supabase/migrations/20260815000000_collaboration.sql`
  - ✅ `organizations` + `organization_members` (rôles owner/admin/member)
  - ✅ `project_members` : membre de chantier avec invitation par **email** (`user_id` nullable, `email` not null côté invitation), rôles owner/editor/viewer
  - 🔒 RLS : invitations visibles via `auth.jwt()->>'email'`, gestion réservée au propriétaire du chantier / admin

### Hooks (`src/lib/data.ts`)

- ✅ `useProjectMembers(projectId)` — membres + `profiles(full_name)` → `ProjectMemberWithProfile`
- ✅ `useMyProjectInvites()` — invitations en attente reçues par email
- ✅ `useAcceptProjectInvite()` — rattache le compte (update `user_id`, vide `email`)
- ✅ `useMyOrganizations()` — organisations de l'utilisateur
- ✅ `useAddProjectMember()` / `useUpdateProjectMember()` / `useRemoveProjectMember()`

### UI

- ✅ `src/components/project-members.tsx` : `ProjectMembersButton` sur chaque carte de projet — invitation, rôles, retrait, badge « Invitation en attente »
- ✅ `src/components/project-invites.tsx` : cloche « Invitations » (+ badge) dans le header — accepter une invitation reçue
- ✅ `types.ts` : `organizations`, `organization_members`, `project_members` (avant `user_roles`)
- ✅ demo-store : 3 tables vides initialisées

---

## v0.11 — Documentation, tests, nettoyage (2026-08-09)

### Livrables README

- ✅ `docs/schema-bdd.md` : diagramme ER (Mermaid) + rôle de chaque table (36 tables)
- ✅ `docs/guide-installation.md` : prérequis + ordre d'application des migrations
- ✅ `docs/guide-deploiement.md` : déploiement Vercel/Cloudflare (preset `cloudflare-module`)
- ✅ `.env.example`
- ✅ README : section « Documentation » avec liens
- ✅ `docs/roadmap.md` : gap analysis vs prompt maître + plan par **13 vagues** (créé)

### Tests unitaires (Vitest 4.1.10 + jsdom 30)

- ✅ `vitest.config.ts` (alias `@`, `import.meta.dirname`, include `src/**/*.test.ts`)
- ✅ Scripts `test` / `test:watch` dans `package.json`
- ✅ `src/lib/format.test.ts` (16) · `src/lib/i18n.test.ts` (3) · `src/lib/guest-mode.test.ts` (3) = **22 tests**
- ℹ️ Les tests format normalisent les espaces étroites `\u202f`

### Nettoyage

- 🗑️ Composant mort `BackToOrders` + import `ArrowLeft` supprimés (`commandes.tsx`)
- 🎨 Prettier sur 13 fichiers dont `supabase/functions/email-notifications/index.ts`

---

## v0.10 — Phase 4 : PWA, i18n, multi-pays/devise (2026-08-08)

### PWA installable

- ✅ `public/manifest.json` (name, theme-color `#0f766e`, icons)
- ✅ `public/sw.js` (service worker, cache-first)
- ✅ `public/icons/icon-192.svg` + `icon-512.svg`
- ✅ Enregistrement du SW + liens manifest/theme-color dans `src/routes/__root.tsx` ; copie dans `.output/public` au build

### Internationalisation (FR/EN)

- ✅ `src/context/preferences-context.tsx` : `PreferencesProvider`, `usePreferences()`, `Lang` (fr/en), `Country` (bj/bf/ci/ml/ne/sn/tg/cg/cd/other), persistance localStorage `batibenin.lang` / `batibenin.country`
- ✅ `src/lib/i18n.ts` : `tr(lang, key)`, type `I18nKey` ; navigation + header + `EmptyProjectNotice` traduits (`labelKey`)
- ✅ Sélecteur Langue + Pays/Devise dans Paramètres (`parametres.tsx`) ; `<html lang>` dynamique
- ⚠️ Seule la navigation/le shell sont traduits ; les 30 écrans restent en FR

### Multi-pays & devise

- ✅ `format.ts` : `fcfa()` résout la devise par pays — FCFA/XOF (défaut), XAF (Congo `cg`), FC/CDF (RDC `cd`) ; const `XOF` supprimée

---

## v0.9 — Phase 3 : Back-office + Conseiller IA (2026-08-08)

### Back-office admin

- ✅ `admin/` : tableau de bord (stats globales), gestion des utilisateurs (types de comptes, promotion admin), demandes de démo
- ✅ Journal d'audit (`audit_logs`, triggers sur suppressions sensibles) + page `audit`

### Conseiller IA (règles)

- ✅ `src/components/ai-conseiller.tsx` : conseils à base de règles (avancement, dépassement budget, seuils 80 %, alertes fournisseurs…) intégré au tableau de bord
- ✅ Génération/export de synthèse projet (PDF) — `project-summary-export`

### Chantier avancé

- ✅ Réserves de fin de chantier (`reserves`, statuts/priorités), plans (`plans`, annotations, bucket `documents`), messages par chantier (`messages`)
- ✅ `photos`, `journal` (JOURNAL_BUCKET `journal-photos`), `documents` (DOCUMENTS_BUCKET)
- ✅ `plans.tsx` : upload + lecture des plans signés

---

## v0.8 — Phase 2 : Marketplace e-commerce (2026-08-08)

- ✅ Migration `20260814000000_marketplace-ecommerce.sql`
  - `stores`, `product_categories`, `products`, `carts`, `cart_items`, `orders`, `order_items`, `deliveries`, `drivers`, `vehicles`
  - Enums `order_status` (10 états : creee → litige), `delivery_status`, `payment_method` (especes, mtn_momo, moov_money, virement, cheque)
- ✅ `boutique.tsx` : catalogue, recherche, filtres catégorie/tri, `ProductCard`, `QtyStepper`, `CloseButton`
- ✅ `panier.tsx` : panier par boutique, frais de livraison forfaitaires (2000 FCFA), `placeOrder` → `useCreateOrder`
- ✅ `commandes.tsx` : liste commandes + `StatusBadge`, workflow de statut, livraison (drivers)
- ✅ `ma-boutique.tsx` : portail vendeur — création boutique, gestion produits, commandes reçues
- ✅ `useProductImageUrls` : URLs signées bucket `photos` (60 min)

---

## v0.7 — Phase 1 : Marketplace prestataires (2026-08-08)

- ✅ Migration `20260813000000_marketplace-prestataires.sql`
  - `providers` (13 domaines : architecte, maçon, électricien, plombier, ferrailleur, carreleur, peintre, menuisier, charpentier, géomètre, topographe, terrassier, pépiniériste) + `provider_reviews`
- ✅ `prestataires.tsx` : annuaire filtré par domaine/ville + avis
- ✅ Comptes multiples : `account_type` sur `profiles` (particulier, maitre_oeuvre, entreprise, artisan, fournisseur, transporteur, admin, promoteur)

---

## v0.6 — Notifications & alertes (2026-08-08)

- ✅ Notifications e-mail **Resend** : `supabase/functions/email-notifications` (cron quotidien) — alertes de seuil budget, digest hebdomadaire
- ✅ Préférences e-mail dans Paramètres (`notification_preferences`, `email_log`)
- ✅ Cloche de notifications in-app + alertes métier (dépassement 80 % budget, échéances, paiements en retard, documents manquants)
- ✅ `alertes.tsx` : centre d'alertes
- ✅ Tour guidé (onboarding) renforcé + `startup-checklist` (avec % sur les projets)

---

## v0.5 — Exports, imports, rapports, recherche (2026-08-08)

- ✅ Import CSV/Excel (`import-csv`, `useImportRows`)
- ✅ Exports PDF/Excel : budget, rapports, recherche, synthèse projet (`jspdf`, `jspdf-autotable`, `xlsx`, `html2canvas`)
- ✅ `rapports.tsx` : dépenses par mois/catégorie/fournisseur/commune/entreprise, budget prévu vs réalisé, coût au m²
- ✅ `recherche.tsx` : recherche globale multi-critères + export
- ✅ `calendrier.tsx` : échéances (paiements, factures, tâches, réserves)
- ✅ Normalisation LF du dépôt (CRLF → LF)

---

## v0.4 — Facturation, stock, photos, tâches, partage (2026-08-08)

- ✅ `invoices` / `invoice_payments` : facturation client + règlements
- ✅ `materials` : stock de matériaux (`stock.tsx`)
- ✅ `photos.tsx` : photos de chantier
- ✅ `tasks` : tâches & planning avec échéances, statuts, priorités (`taches.tsx`)
- ✅ Partage public par lien `partage/{token}` (lecture seule du chantier)
- ✅ `materials` + `tasks` types

---

## v0.3 — Audit & sécurité (2026-08-08)

- ✅ `audit_logs` + page `audit.tsx` (journal d'audit avec `useAuditLogs`, refresh 30 s)
- ✅ RLS systématique sur toutes les tables (`user_id = auth.uid()`)
- ✅ Vérification admin : `useIsAdmin()`, `user_roles` avec rôle `admin`

---

## v0.2 — Comptes, rôles, mode invité (2026-08-07)

- ✅ Authentification email/mot de passe via Supabase Auth + `@lovable.dev/cloud-auth-js`
- ✅ 7 types de comptes : `account_type` (`maitre_oeuvre`, `particulier`, `entreprise`, `artisan`, `fournisseur`, `transporteur`, `admin` — via `roles.ts`/`ACCOUNT_TYPES`)
- ✅ RBAC : `useIsAdmin()`, rôles étendus
- ✅ **Mode invité** : démo sans compte (`demo-store.ts`, `isGuestMode()`) — seed complet d'un chantier démo, panier, commandes, prestataires
- ✅ Seed d'un projet démo à l'inscription (`demo_requests` pour la démo commerciale)
- ✅ Landing page avec hero + formulaire de demande de démo

---

## v0.1 — Fondations du suivi de chantier (2026-08-07)

- ✅ Template TanStack Start TypeScript (`tanstack_start_ts`) — React 19, TanStack Router + Start, Tailwind CSS v4, shadcn/ui (Radix)
- ✅ Architecture v1 + création des pages de l'app
- ✅ Gestion de chantier : projets (localisation, surfaces, budget, dates), catégories de dépenses adaptées au Bénin (~32 postes), dépenses (FCFA, quantité, prix unitaire, moyen de paiement, photo/PDF, observations)
- ✅ Fournisseurs (`suppliers`), entreprises (`companies`), devis (`quotes`), paiements (`payments` : comptant, partiel, acompte, solde ; MTN MoMo, Moov Money, banque, espèces)
- ✅ Documents (`documents`, bucket `documents`), journal de chantier (`site_logs`), budget prévisionnel (`budget_lines`)
- ✅ Tableau de bord : budget global, dépenses totales, restant, coût/m², avancement, graphiques (`recharts`), évolution mensuelle
- ✅ Enums : `account_type`, `document_category`, `invoice_status`, `task_status`, `task_priority`, `reserve_status`, `reserve_priority`

---

## Base de référence

- **Premier commit** : `633ac1d` (2026-08-06) — template `tanstack_start_ts_current-4c753965f703`
- **Remix** : `71ff499` (2026-08-07) — « Remixed BâtiBénin project »
- **Première livraison fonctionnelle** : v0.1 (2026-08-07)

## Règle de mise à jour

À chaque commit/push (ou chaque livraison de vague) :

1. Ajouter une entrée en haut de ce `CHANGELOG.md` (incrémenter `v0.x`).
2. Mettre à jour `README.md` (stack, scripts, documentation).
3. Mettre à jour `docs/schema-bdd.md` (nouvelles tables/colonnes) et `docs/roadmap.md` (état des vagues).
4. Mettre à jour `docs/STACK.md` (version des outils, scripts, conventions).
5. Ne pas supprimer les entrées passées — ne jamais réécrire l'historique.
