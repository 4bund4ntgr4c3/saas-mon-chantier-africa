# Changelog — BâtiBénin / Plateforme africaine de construction

Ce document retrace **tous les changements depuis la première version**. Il est mis à jour à chaque commit/push, en même temps que le README, le schéma de base de données et la roadmap, afin de garder une spécification toujours exacte et d'éviter de réimplémenter ou de dégrader une fonctionnalité existante.

Conventions : `✅` ajouté · `🔧` amélioré · `🐛` corrigé · `🗑️` supprimé/nettoyé · `⚠️` à noter.

## v0.59 — Correctif guide déploiement Cloudflare Workers (2026-09-06)

- 🐛 `docs/guide-deploiement.md` — la section Cloudflare décrivait à tort un déploiement **Pages statique** (SSR perdu) ; corrigée vers le **Worker** réellement produit (`nitro cloudflare-module`, `.output/server/wrangler.json`) : `npx nitro deploy --prebuilt` / `wrangler deploy`, secrets runtime via `wrangler secret put`, distinction `VITE_*` (build) vs secrets serveur, ajout `VITE_VAPID_PUBLIC_KEY` au tableau.
- ✅ Dry-run Wrangler validé : 193 modules bundlés (7,8 Mo), 186 assets, binding `ASSETS` OK — prêt à publier après `wrangler login` + secrets.

---

## v0.58 — Retrait total de la dépendance Lovable (2026-09-06)

- 🗑️ Supprimés : paquets `@lovable.dev/cloud-auth-js` et `@lovable.dev/vite-tanstack-config` (`package.json`), dossier `.lovable/`, `src/integrations/lovable/`, `src/lib/lovable-error-reporting.ts`, lockfile `bun.lock` + `bunfig.toml` (npm seul gestionnaire : `package-lock.json` fait foi).
- ✅ `vite.config.ts` — config Vite standard équivalente au preset retiré : `tailwindcss`, `tsConfigPaths`, `tanstackStart` (dont `server.entry: "server"` + protection d'imports), `viteReact`, `nitro({ defaultPreset: "cloudflare-module" })` au build uniquement, injection `VITE_*`, alias `@`, `server { host: "::", port: 8080 }`.
- 🔧 OAuth Google (`auth.tsx`) via Supabase Auth natif (`signInWithOAuth` + `redirectTo`) ; erreurs root (`__root.tsx`) loggées en `console.error` ; messages « Connect Supabase in Lovable Cloud » reformulés (clients supabase).
- 🗑️ Docs : bloc Lovable (`AGENTS.md`), section « Build with Lovable » (`README.md`), ligne Auth (`docs/STACK.md`), mention preset (`docs/guide-deploiement.md`). Entrées historiques du changelog conservées (ex. v0.5x).
- ⚠️ `bun.lock` supprimé — si bun est utilisé quelque part, régénérer via `bun install` avant de recommiter ce fichier.

---

## v0.57 — Vague 27 : VRD, Raccordements SBEE/SONEB, Déchets & Urbanisme (2026-08-26)

### Bilan de Puissance Électrique & Raccordement SBEE (`src/lib/electrical-load.ts`, `src/components/electrical-load-dialog.tsx`)

- ✅ `calculateElectricalLoadAndService` — calcul de la puissance totale et foisonnée (kVA) selon la climatisation, chauffe-eau et plaques, recommandation de l'abonnement SBEE (Monophasé 30A/60A ou Triphasé 30A/60A) et section de câble cuivre pour chute de tension inférieure à 3%.
- ✅ `ElectricalLoadDialog` — intégré dans `parametres.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/electrical-load.test.ts`).

### Dimensionnement Surpresseur SONEB & Hauteur Manométrique HMT (`src/lib/water-booster.ts`, `src/components/water-booster-dialog.tsx`)

- ✅ `calculateWaterBoosterAndHmt` — calcul du débit de pointe simultané (L/min), pertes de charge, HMT en bar/mCE et dimensionnement de la pompe et du ballon à vessie (50L à 200L).
- ✅ `WaterBoosterDialog` — intégré dans `materiaux.tsx` et `plans.tsx`.
- ✅ Tests unitaires (`src/lib/water-booster.test.ts`).

### Plan de Gestion & Valorisation des Déchets de Chantier (`src/lib/waste-management.ts`, `src/components/waste-management-dialog.tsx`)

- ✅ `calculateWastePlanAndDisposal` — métré des déblais/gravats, calcul du volume réemployé en remblai in-situ avec économies associées et estimation des rotations de camions bennes (8m³/12m³) vers décharge agréée.
- ✅ `WasteManagementDialog` — intégré dans `journal.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/waste-management.test.ts`).

### Calculateur d'Emprise au Sol (CES), COS & Reculs Réglementaires (`src/lib/zoning-footprint.ts`, `src/components/zoning-footprint-dialog.tsx`)

- ✅ `calculateZoningCompliance` — vérification du respect de l'emprise au sol (CES <= 60%), du coefficient d'occupation (COS) et des marges de recul (voie >= 3m, limites >= 2m) pour l'instruction du permis de construire.
- ✅ `ZoningFootprintDialog` — intégré dans `projets.tsx` et `plans.tsx`.
- ✅ Tests unitaires (`src/lib/zoning-footprint.test.ts`).

---

## v0.56 — Vague 26 : Assainissement, Clôtures, Sécurité Incendie & Décompte Général Définitif DGD (2026-08-26)

### Dimensionnement Fosse Septique Toutes Eaux & Puits Perdu (`src/lib/septic-tank.ts`, `src/components/septic-tank-dialog.tsx`)

- ✅ `sizeSepticSanitation` — calcul du volume de la fosse selon le nombre d'habitants équivalents (EH), dimensionnement du bac à graisse de cuisine et diagnostic de faisabilité du puits d'infiltration en fonction du niveau de la nappe phréatique et du sol.
- ✅ `SepticTankDialog` — intégré dans `materiaux.tsx` et `plans.tsx`.
- ✅ Tests unitaires (`src/lib/septic-tank.test.ts`).

### Calculateur de Mur de Clôture & Sécurisation Périphérique (`src/lib/boundary-wall.ts`, `src/components/boundary-wall-dialog.tsx`)

- ✅ `calculateBoundaryWallMaterials` — métré précis des agglos creux de 15, béton pour semelle filante et chaînages bas/haut, raidisseurs tous les 3m, aciers HA10/HA8, chaperons béton et concertina anti-intrusion.
- ✅ `BoundaryWallDialog` — intégré dans `budget.tsx` et `materiaux.tsx`.
- ✅ Tests unitaires (`src/lib/boundary-wall.test.ts`).

### Guide de Sécurité Incendie & Extincteurs (`src/lib/fire-safety.ts`, `src/components/fire-safety-dialog.tsx`)

- ✅ `evaluateFireSafetyEquipment` — calcul de la dotation en extincteurs (Eau pulvérisée 6L par niveau, CO2 2kg armoire TGBT/solaire, Poudre ABC 6kg garage) et détecteurs de fumée DAAF.
- ✅ `FireSafetyDialog` — intégré dans `audit.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/fire-safety.test.ts`).

### Décompte Général Définitif (DGD) & Retenue de Garantie 5% (`src/lib/final-settlement.ts`, `src/components/final-settlement-dialog.tsx`)

- ✅ `calculateFinalSettlement` — calcul du solde immédiat exigible à la réception provisoire, déduction des acomptes versés, retenue de garantie légale de 5% et fixation de la date de libération à 1 an (réception définitive).
- ✅ `FinalSettlementDialog` — intégré dans `paiements.tsx` et `documents.tsx`.
- ✅ Tests unitaires (`src/lib/final-settlement.test.ts`).

---

## v0.55 — Vague 25 : Diagnostics Avant-Projet, Structure & Confort (Sols/Fondations, Confort Passif BTC, Prise de Terre < 10Ω & Ordres de Service) (2026-08-26)

### Capacité Portante des Sols & Choix des Fondations (`src/lib/soil-foundations.ts`, `src/components/soil-foundations-dialog.tsx`)

- ✅ `evaluateSoilAndFoundations` — diagnostic géotechnique simplifié pour sols du Bénin (sables littoraux Cotonou/Sèmè, argiles compressibles, terre de barre Calavi/Allada, substratum rocheux) et choix adapté (radier général, semelles filantes, pieux).
- ✅ `SoilFoundationsDialog` — intégré dans `projets.tsx` et `plans.tsx`.
- ✅ Tests unitaires (`src/lib/soil-foundations.test.ts`).

### Confort Thermique Passif Tropical & Maçonnerie BTC (`src/lib/thermal-comfort.ts`, `src/components/thermal-comfort-dialog.tsx`)

- ✅ `simulateTropicalThermalComfort` — simulation d'inertie thermique (déphasage jusqu'à 11h), réduction de la température intérieure (-3.5°C à -5°C) et économies sur la climatisation SBEE grâce aux briques de terre compressée (BTC), débords de toit et brise-soleil.
- ✅ `ThermalComfortDialog` — intégré dans `materiaux.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/thermal-comfort.test.ts`).

### Dimensionnement Prise de Terre & Protection Foudre (`src/lib/lightning-grounding.ts`, `src/components/lightning-grounding-dialog.tsx`)

- ✅ `calculateGroundingResistance` — calcul de la résistance théorique en Ohms (boucle fond de fouille 25mm² + piquets cuivre) pour viser le seuil optimal < 10 Ohms et spécification des parafoudres Type 2.
- ✅ `LightningGroundingDialog` — intégré dans `audit.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/lightning-grounding.test.ts`).

### Générateur d'Ordres de Service (OS) & Avenants Contractuels (`src/lib/service-orders.ts`, `src/components/service-orders-dialog.tsx`)

- ✅ `generateServiceOrderText` — formalisation juridique des actes de chantier (OS Démarrage n°1, Arrêt intempéries/litige, Reprise, Avenants modificatifs avec incidences prix/délais) et export de documents prêts à signer.
- ✅ `ServiceOrdersDialog` — intégré dans `documents.tsx` et `journal.tsx`.
- ✅ Tests unitaires (`src/lib/service-orders.test.ts`).

---

## v0.54 — Vague 24 : Performance Chantier, Qualité Béton & Sécurité (Formulation B25, Pointage Ouvriers/EPI, Contrôle Aciers Côtier & Intempéries) (2026-08-20)

### Formulation & Dosage des Bétons B25 / B20 / B15 (`src/lib/concrete-mix.ts`, `src/components/concrete-mix-dialog.tsx`)

- ✅ `calculateConcreteBatchMaterials` — calcul précis des quantités de ciment (sacs de 50kg), sable, gravier concassé et eau avec marges de perte (5%), recommandations de cure humide par temps chaud et vibration.
- ✅ `ConcreteMixDialog` — intégré dans `materiaux.tsx` et `journal.tsx`.
- ✅ Tests unitaires (`src/lib/concrete-mix.test.ts`).

### Registre de Présence Ouvriers & Contrôle EPI (`src/lib/worker-attendance.ts`, `src/components/worker-attendance-dialog.tsx`)

- ✅ `computeDailyLaborSummary` — émargement journalier des équipes maçons, ferrailleurs, coffreurs, manœuvres, calcul de la masse salariale journalière en FCFA et taux de conformité des équipements de protection individuelle (casques, chaussures de sécurité).
- ✅ `WorkerAttendanceDialog` — intégré dans `journal.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/worker-attendance.test.ts`).

### Audit & Contrôle Ferraillage / Enrobage Côtier (`src/lib/rebar-inspection.ts`, `src/components/rebar-inspection-dialog.tsx`)

- ✅ `evaluateRebarCompliance` — vérification des règles BAEL pour les diamètres de barres d'acier haute adhérence (HA8 à HA20), longueur de recouvrement (40d) et enrobage anti-corrosion marine (5 cm en zone côtière Cotonou/Sèmè).
- ✅ `RebarInspectionDialog` — intégré dans `audit.tsx` et `plans.tsx`.
- ✅ Tests unitaires (`src/lib/rebar-inspection.test.ts`).

### Journal d'Intempéries & Ajustement du Calendrier (`src/lib/weather-delays.ts`, `src/components/weather-delays-dialog.tsx`)

- ✅ `computeWeatherDelayExtension` — journalisation des arrêts de chantier dus aux pluies diluviennes et crues, calcul du report officiel de la date de livraison contractuelle et calcul des pénalités journalières évitées.
- ✅ `WeatherDelaysDialog` — intégré dans `calendrier.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/weather-delays.test.ts`).

---

## v0.53 — Vague 23 : Suite Propriétaire & Gestion Patrimoniale (Assurance MRH Inondations, Rentabilité Meublé Airbnb vs Nu, Cuve Eau Pluviale & Bail Bénin) (2026-08-20)

### Assurance Multirisque Habitation (MRH) & Risques Inondations (`src/lib/home-insurance.ts`, `src/components/home-insurance-dialog.tsx`)

- ✅ `calculateHomeInsuranceQuote` — simulation et devis de prime annuelle MRH en FCFA avec garanties inondation/remontée de nappe phréatique (Cotonou/Calavi), surtensions électriques réseau SBEE et responsabilité civile.
- ✅ `HomeInsuranceDialog` — intégré dans `parametres.tsx` et `immobilier.tsx`.
- ✅ Tests unitaires (`src/lib/home-insurance.test.ts`).

### Rentabilité Locative Meublé vs Nu & Cash-Flow Bailleur (`src/lib/rental-cashflow.ts`, `src/components/rental-cashflow-dialog.tsx`)

- ✅ `compareRentalStrategies` — arbitrage entre location nue longue durée vs location meublée courte durée (type Airbnb Cotonou / Haie Vive / Fidjrossè) avec calcul des charges de conciergerie, cash-flow net mensuel et rendement net annuel.
- ✅ `RentalCashflowDialog` — intégré dans `immobilier.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/rental-cashflow.test.ts`).

### Dimensionnement Cuve à Eau & Récupération Pluviale (`src/lib/rainwater-harvesting.ts`, `src/components/rainwater-harvesting-dialog.tsx`)

- ✅ `calculateRainwaterCapacity` — calcul du volume optimal de cuve (litres) selon la toiture (bac alu, tuile, dalle), la zone pluviométrique du Bénin (Littoral, Ouémé, Borgou, Atacora) et calcul de l'autonomie en jours sans SONEB.
- ✅ `RainwaterHarvestingDialog` — intégré dans `tableau-de-bord.tsx` et `materiaux.tsx`.
- ✅ Tests unitaires (`src/lib/rainwater-harvesting.test.ts`).

### Générateur de Bail d'Habitation Conforme Loi 2017-15 Bénin (`src/lib/lease-agreement.ts`, `src/components/lease-agreement-dialog.tsx`)

- ✅ `generateBeninLeaseContractText` — génération automatique de contrats de bail résidentiel conformes au plafonnement légal de 3 mois de caution + 3 mois d'avance de loyer au Bénin.
- ✅ `LeaseAgreementDialog` — intégré dans `location.tsx` et `documents.tsx`.
- ✅ Tests unitaires (`src/lib/lease-agreement.test.ts`).

---

## v0.52 — Vague 22 : Suite Spéciale Propriétaire (Coffre-Fort Foncier, Arbitrage des Finitions, Checklist Réception Clés & Simulateur Factures SBEE/SONEB) (2026-08-20)

### Coffre-Fort Numérique Foncier du Propriétaire (`src/lib/owner-vault.ts`, `src/components/owner-vault-dialog.tsx`)

- ✅ `evaluateLandSecurity` & `getDefaultOwnerVaultDocuments` — sauvegarde et sécurisation des titres de propriété (Titre Foncier TF, Attestation de Recasement ANDF, Permis de Construire communal, Convention notariée) et score de sécurité juridique (%).
- ✅ `OwnerVaultDialog` — intégré dans `documents.tsx` et `tableau-de-bord.tsx`.
- ✅ Tests unitaires (`src/lib/owner-vault.test.ts`).

### Comparateur & Arbitrage des Gammes de Finitions (`src/lib/finishings-comparator.ts`, `src/components/finishings-comparator-dialog.tsx`)

- ✅ `computeTotalFinishingBudget` — comparaison en direct des gammes Éco, Standard et Luxe sur le carrelage (grès émaillé vs cérame poli vs marbre), la peinture (mate vs satinée lavable vs stuc), les sanitaires et les menuiseries avec calcul d'impact budgétaire en FCFA et durabilité estimée.
- ✅ `FinishingsComparatorDialog` — intégré dans `materiaux.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/finishings-comparator.test.ts`).

### Guide d'Inspection & Checklist de Réception des Clés (`src/lib/handover-checklist.ts`, `src/components/handover-checklist-dialog.tsx`)

- ✅ `evaluateHandoverStatus` — protocole de visite de livraison pas à pas (pente des douches, test des prises 220V, disjoncteur différentiel, 3 jeux de clés par serrure, coulissement des baies vitrées) et génération de PV de réception.
- ✅ `HandoverChecklistDialog` — intégré dans `reserves.tsx` et `journal.tsx`.
- ✅ Tests unitaires (`src/lib/handover-checklist.test.ts`).

### Simulateur de Factures Énergétiques Post-Emménagement SBEE / SONEB (`src/lib/utility-bills-estimator.ts`, `src/components/utility-bills-dialog.tsx`)

- ✅ `estimateMonthlyUtilityBills` — calcul prévisionnel des charges récurrentes d'électricité (splits de climatisation, chauffe-eau) et d'eau (nombre d'habitants, impact du forage autonome et économies annuelles du kit solaire hybride).
- ✅ `UtilityBillsDialog` — intégré dans `tableau-de-bord.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/utility-bills-estimator.test.ts`).

---

## v0.51 — Vague 21 : Suite Promoteur Immobilier & Maître d'Ouvrage (Bilan d'Opération, Appels de Fonds VEFA, Contrats de Vente & Cockpit Propriétaire) (2026-08-20)

### Étude de Faisabilité & Bilan Financier Promoteur (`src/lib/developer-feasibility.ts`, `src/components/developer-feasibility-dialog.tsx`)

- ✅ `calculateDeveloperFeasibility` — calcul de la marge nette en FCFA, du taux de rentabilité (ROI), du seuil de rentabilité (Point Mort) et diagnostic de viabilité financière (standard min 12%).
- ✅ `DeveloperFeasibilityDialog` — intégré dans `immobilier.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/developer-feasibility.test.ts`).

### Échéancier des Appels de Fonds & Trésorerie VEFA (`src/lib/developer-cashflow.ts`, `src/components/developer-cashflow-dialog.tsx`)

- ✅ `generateVefaFundSchedule` — barème d'appels de fonds échelonné (5% réservation, 15% fondations, 25% dalle, 20% hors d'eau, 15% enduits, 10% finitions, 10% livraison) avec suivi des encaissements et déblocages progressifs.
- ✅ `DeveloperCashflowDialog` — intégré dans `immobilier.tsx` et `paiements.tsx`.
- ✅ Tests unitaires (`src/lib/developer-cashflow.test.ts`).

### Générateur de Contrats de Réservation VEFA (`src/lib/vefa-contract.ts`, `src/components/vefa-contract-dialog.tsx`)

- ✅ `generateVefaContractText` — génération automatique de contrats de réservation préliminaire conformes au Code Foncier et Domanial béninois avec garanties d'achèvement et décennale.
- ✅ `VefaContractDialog` — intégré dans `immobilier.tsx` et `documents.tsx`.
- ✅ Tests unitaires (`src/lib/vefa-contract.test.ts`).

### Cockpit Exécutif Propriétaire & Diaspora (`src/lib/owner-dashboard.ts`, `src/components/owner-dashboard-dialog.tsx`)

- ✅ `computeOwnerProjectHealth` — tableau de bord épuré sans jargon technique pour porteurs de projets et expatriés supervisant leur chantier à distance (indice santé /100, prochain jalon, actions requises).
- ✅ `OwnerDashboardDialog` — intégré dans `tableau-de-bord.tsx` et `projets.tsx`.
- ✅ Tests unitaires (`src/lib/owner-dashboard.test.ts`).

---

## v0.50 — Vague 20 : Crédit Immobilier UEMOA, Diffusion WhatsApp Cloud API, Carnet d'Entretien Numérique & Kits d'Ouvrages (2026-08-20)

### Simulateur de Crédit Immobilier & Prêt Bancaire UEMOA (`src/lib/bank-loan.ts`, `src/components/bank-loan-dialog.tsx`)

- ✅ `calculateBankLoan` — calcul des mensualités FCFA avec taux bancaires locaux (7,5% à 12%), calcul du revenu net requis basé sur le ratio d'endettement max de 33% et décomposition des intérêts/assurances.
- ✅ `BankLoanDialog` — intégré dans `immobilier.tsx` et `budget.tsx`.
- ✅ Tests unitaires (`src/lib/bank-loan.test.ts`).

### Connecteur Transactionnel WhatsApp Cloud API (`src/lib/whatsapp-cloud.ts`, `src/components/whatsapp-cloud-dialog.tsx`)

- ✅ `formatWhatsAppCloudMessage` — normalisation des numéros béninois (`+229`) et génération de liens directs pré-remplis pour les résumés hebdomadaires, avis de versements et alertes intempéries coulage.
- ✅ `WhatsAppCloudDialog` — intégré dans `messages.tsx` et `parametres.tsx`.
- ✅ Tests unitaires (`src/lib/whatsapp-cloud.test.ts`).

### Carnet d'Entretien Numérique du Bâtiment (`src/lib/maintenance-log.ts`, `src/components/maintenance-log-dialog.tsx`)

- ✅ `getRecommendedMaintenanceSchedule` — calendrier préventif post-livraison (curage fosse septique 2 ans, révision étanchéité toiture avant les pluies de mai, révision climatiseurs et tableau électrique).
- ✅ `MaintenanceLogDialog` — intégré dans `tableau-de-bord.tsx` et `documents.tsx`.
- ✅ Tests unitaires (`src/lib/maintenance-log.test.ts`).

### Générateur de Kits Matériaux par Ouvrage Type (`src/lib/material-kits-calculator.ts`, `src/components/material-kits-dialog.tsx`)

- ✅ `generateMaterialKit` — chiffrage et dimensionnement express de kits complets (Clôture 150m², Fosse septique toutes eaux 6-10 pers, Dalle pleine 100m² ép. 15cm) avec injection automatique dans les besoins du chantier.
- ✅ `MaterialKitsDialog` — intégré dans `materiaux.tsx` et `boutique.tsx`.
- ✅ Tests unitaires (`src/lib/material-kits-calculator.test.ts`).

---

## v0.49 — Vagues 17 & 18 : Signature Tactile Canvas, Mode Kiosque Chantier, Notifications Push PWA, Centrale d'Achats Groupés & Réseau Dépôts B2B (2026-08-20)

### Signature Électronique Tactile sur Écran (`src/lib/signature.ts`, `src/components/signature-pad-dialog.tsx`)

- ✅ `createSignatureMetadata` — capture fluide au doigt/stylet sur écran tactile (Canvas HTML5), horodatage légal cryptographique et mention « Lu et approuvé ».
- ✅ `SignaturePadDialog` — intégré dans `documents.tsx` et `devis.tsx`.
- ✅ Tests unitaires (`src/lib/signature.test.ts`).

### Mode Kiosque Chantier pour Conducteurs de Travaux (`src/components/site-kiosk-dialog.tsx`)

- ✅ `SiteKioskDialog` — interface tactile plein écran simplifiée pour le terrain (prise de photos rapides, pointage présence ouvriers, météo coulage, déclaration livraisons).
- ✅ Intégré dans `tableau-de-bord.tsx` et `journal.tsx`.

### Système de Notifications Push PWA & Alertes Chantier (`src/lib/push-notifications.ts`, `src/components/push-notifications-toggle.tsx`)

- ✅ `createSiteNotification` — gestion des permissions Web Push API et déclenchement d'alertes locales (fin du séchage dalle 21j, alerte orage coulage, échéance factures).
- ✅ `PushNotificationsToggle` — intégré dans `parametres.tsx` et `alertes.tsx`.
- ✅ Tests unitaires (`src/lib/push-notifications.test.ts`).

### Centrale d'Achats Groupés BTP & Remises de Volume (`src/lib/bulk-purchasing.ts`, `src/components/bulk-purchasing-dialog.tsx`)

- ✅ `calculateBulkDiscount` — calcul automatisé des économies d'échelle et remises de gros (jusqu'à -14% sur le ciment et -12% sur le fer à béton) par regroupement de commandes.
- ✅ `BulkPurchasingDialog` — intégré dans `boutique.tsx` et `materiaux.tsx`.
- ✅ Tests unitaires (`src/lib/bulk-purchasing.test.ts`).

### Réseau Quincailleries Multi-Dépôts & Disponibilités Matériaux (`src/lib/supplier-network.ts`, `src/components/supplier-network-dialog.tsx`)

- ✅ `findBestWarehouse` — cartographie des stocks en direct et délais de livraison par commune (Cotonou, Abomey-Calavi, Porto-Novo, Parakou).
- ✅ `SupplierNetworkDialog` — intégré dans `fournisseurs.tsx` et `stock.tsx`.
- ✅ Tests unitaires (`src/lib/supplier-network.test.ts`).

---

## v0.48 — Vague « Professionnalisation & ergonomie » : palette Ctrl+K, courbe en S, undo, OHADA, e-signature, dashboard par rôle (2026-08-17)

### ✅ Palette de commandes globale (Ctrl/Cmd+K)

- ✅ `CommandPalette` (`src/components/command-palette.tsx`, cmdk + `ui/command.tsx`) dans le header : **changement de chantier** (recherche par nom/ville, bascule + retour au tableau de bord), **navigation complète filtrée par rôle** (35+ pages, préfixées par leur section) et **actions** (thème sombre/clair).
- ✅ Ouvverture par `Ctrl+K` / `Cmd+K` (écouteur global) ou bouton dédié avec raccourci affiché ; libellés FR/EN (`palette.*` dans `i18n.ts`).
- 🔧 Navigation centralisée : `NAV_MAIN` / `NAV_SECTIONS` / `ADMIN_SECTION` et leurs types extraits d'`app-shell.tsx` vers **`src/lib/nav.ts`** (source unique sidebar + palette, plus de duplication).

### ✅ Courbe en S du chantier (tableau de bord)

- ✅ Module pur `src/lib/s-curve.ts` (+ 13 tests) : `smoothstep` (phasing cumulé en S, standard BTP — démarrage lent / gros œuvre / tassement), `monthsBetween`, `computeSCurve` (budget cumulé prévu vs dépenses réelles mensuelles), `physicalProgress` (avancement physique pondéré des tâches : terminée = 1, en cours = 0,5, annulée exclue).
- 🔧 Le graphique « Cashflow prévu vs réalisé » du tableau de bord devient **« Courbe en S — budget cumulé prévu vs réel »** : la courbe prévue suit le smoothstep au lieu d'une répartition linéaire, et un badge confronte **avancement physique vs financier** (« les dépenses devancent les travaux » / « les travaux devancent les dépenses » au-delà de 5 points d'écart).

### ✅ Undo sur toutes les suppressions

- 🔧 `useDeleteRow` (`src/lib/data.ts`) relit la ligne complète avant suppression puis propose **« Annuler » dans le toast pendant 6 s** : la ligne est réinsérée telle quelle (même id), en Supabase comme en mode invité. Toutes les pages utilisant ce hook (dépenses, postes, tâches, documents, besoins, notifications…) en bénéficient sans changement.

### ✅ Export comptable SYSCOHADA (OHADA)

- ✅ Module `src/lib/ohada-export.ts` (+ 7 tests) : `ohadaAccountFor` mappe catégorie + libellé vers un **compte de charges SYSCOHADA** (602 matériaux, 661 personnel, 621 sous-traitance, 61 transports, 622 locations, 625 assurances, 626 études, 64 impôts, 605 énergie, 601 marchandises, repli 658) par mots-clés entiers (matching par tokens sans accents) ; `buildOhadaJournal` génère des **écritures équilibrées** (débit 6x / crédit 401 Fournisseurs) ; `ohadaAccountSummary` agrège par compte.
- ✅ Bouton **« Comptable OHADA »** dans Rapports : export Excel 2 feuilles (Écritures + Synthèse comptes, totaux débit = crédit) prêt à saisir dans Sage/SAARI — comptes indicatifs à valider par le comptable (mention dans le fichier).

### ✅ Signature électronique des contrats & PV

- ✅ `SignaturePad` (`src/components/signature-pad.tsx`) : canvas tactile/souris (Pointer Events), fond blanc exportable, bouton Effacer.
- ✅ Module `src/lib/esign.ts` (+ 6 tests) : `canonicalize` (sérialisation stable clés triées), `documentFingerprint` (**SHA-256** via Web Crypto, repli FNV-1a 64), `formatFingerprint`.
- 🔧 `generateContractPdf` intègre les images de signature dans les parapheurs + mentions « Signé électroniquement par … le … » + **empreinte d'intégrité** en pied de bloc signature ; le générateur de contrats propose deux pads (maître d'ouvrage / entrepreneur) et le toast final offre la copie de l'empreinte.

### ✅ Tableau de bord par rôle

- ✅ `RoleDashboardStrip` (`src/components/role-dashboard-strip.tsx`) en tête du tableau de bord, **affiché même sans chantier sélectionné** : titre + KPIs + raccourcis adaptés au `account_type` — particulier (échéances, saisie), maître d'œuvre (chantiers actifs, enveloppe cumulée, rapports/planning), artisan (demandes de devis ouvertes), quincaillerie (commandes à traiter, boutique, prévision stock), transporteur (livraisons en cours), promoteur (programmes), entreprise (travaux, devis).

### ✅ Modèles de chantier (duplication structure seule)

- 🔧 `useDuplicateProject` accepte `{ id, template: true }` : copie **budget + besoins matériaux (quantités remises à zéro, statut « besoin ») + tâches (à faire)**, sans dépenses/paiements/devis/journal/documents ; nom suffixé « — modèle », statut `planifie`. Mode invité couvert (`demoDuplicateProject(id, template)`).
- ✅ Bouton dédié (icône gabarit) sur les cartes projet, à côté de la duplication complète.

### ✅ Rapport hebdomadaire e-mail enrichi

- 🔧 Edge function `email-notifications` : le digest hebdomadaire devient un **rapport** — tableau par chantier (budget, dépensé, restant coloré, dépenses des 7 derniers jours) + points d'attention ; nouveau **mode `digest`** pour l'envoyer immédiatement.
- ✅ Bouton « Rapport hebdo maintenant » dans Paramètres → Notifications e-mail (`useSendNotificationEmail` accepte `digest`).

### ✅ Push web réel (Web Push + VAPID)

- ✅ `public/sw.js` : handlers `push` (payload JSON `{title, body, url}`, icône, tag par type) et `notificationclick` (focus de l'onglet + navigation).
- ✅ Paramètres : l'activation des notifications navigateur **s'abonne au push Web Push** quand `VITE_VAPID_PUBLIC_KEY` est configurée (clé `web-push generate-vapid-keys`) ; l'abonnement complet est stocké dans `device_tokens` (plateforme `web_push`, token = JSON de la subscription) pour l'envoi serveur. Repli silencieux sinon (Notification API inchangée).

### 🔧 i18n

- ✅ Tableau de bord traduit FR/EN (30 clés `dash.*` : KPIs, titres de sections, courbe en S, badges) — auparavant seul le shell l'était.

### ⚠️ À noter

- Aucune migration BDD (features 100 % applicatives ; `device_tokens` et `notification_preferences` existants réutilisés).
- Tests : +26 (s-curve 13, ohada 7, esign 6) ; navigation sidebar/palette depuis `src/lib/nav.ts`.

## v0.47 — Actions rapides contextuelles dans les pop-ups de détail (2026-08-17)

- ✅ **Matériaux** : le pop-up d'un besoin propose désormais **« Enregistrer une livraison »** (quantité restante > 0), **« Clôturer le besoin »** (quantité couverte) et **« Modifier »** — plus besoin de viser les petites icônes du tableau.
- ✅ **Paiements** : le pop-up d'un paiement propose **« Marquer réglé »** (statut non confirmé), les **relances** (paiement à échéance non réglée) et **« Modifier »**.
- 🔧 **Documents** : le pop-up d'une pièce ajoute **« Modifier »** (catégorie/échéance/notes) à côté de « Télécharger ».
- ⚠️ Les workflows dédiés gardent leurs boutons propres (devis accepter/rejeter, demandes-devis attribuer, litiges décision, commandes avancer, locations confirmer/démarrer/retour).

## v0.46 — Page 404 personnalisée « Chantier introuvable » (2026-08-17)

- 🔧 Le composant `notFoundComponent` de la route racine (`__root.tsx`) n'est plus le boilerplate TanStack en anglais sans marque : il est remplacé par `NotFoundPage` (`src/components/not-found.tsx`).
- ✅ Page 404 aux couleurs de la plateforme : header sticky avec logo BâtiBénin + bascule de thème, surtitre « Erreur 404 », grand titre « 4**0**4 » (police display), sous-titre « Chantier introuvable », message en français, et 3 actions — « Retour à l'accueil » (primaire), « Nouveautés » (`/changelog`), « Se connecter » (`/auth`).
- ⚠️ Le statut HTTP 404 en SSR et la couverture de toutes les URL inconnues sont fournis par `notFoundComponent` sur la route racine (aucune route splat `$.tsx` ajoutée).

## v0.45 — Notifications en mode sombre & exports PDF à l'identité BâtiBénin (2026-08-16)

### Notifications & mode sombre

- ✅ Composant partagé `NotificationKindIcon` (`src/components/notification-kind-icon.tsx`) : pastille arrondie **teintée par type de notification** (alerte rouge, commande ambre, livraison cyan, paiement vert, devis indigo, rapport slate, litige orange, vérification teal, assistant fuchsia) avec variants `dark:` — remplace les icônes « nues » dupliquées entre la cloche et la page.
- 🔧 Cloche `NotificationsBell` : lignes non lues avec **barre latérale ambre + fond teinté renforcé en sombre** (`bg-primary/5 dark:bg-primary/10`), survol visible dans les deux modes (`hover:bg-muted/60 dark:hover:bg-white/5`), alertes métier avec pastille danger (rouge) ou surveillance (ambre).
- 🔧 Page `/notifications` : mêmes pastilles par type, états non lus et survols harmonisés clair/sombre.
- 🔧 Toasts `sonner` : teintes par type (succès vert, avertissement ambre, erreur rouge, info cyan) via les tokens `--success`/`--warning`/`--destructive`/`--accent`, bordure et fond teintés lisibles en clair comme en sombre.

### Exports PDF professionnels unifiés

- ✅ Module `src/lib/pdf-theme.ts` : **identité visuelle unique** pour tous les exports jsPDF — palette dérivée du design system (graphite zinc + accent ambre), **bandeau d'en-tête pleine largeur** (marque BÂTIBÉNIN, titre, sous-titre, barre ambre), **cartes KPI** colorées par ton (ambre/vert/rouge), titres de section à barre ambre, styles autoTable partagés (têtes graphite, zébrures subtiles, totaux sur fond ambre pâle) et **pied de page sur toutes les pages** (marque + note + pagination « Page X / Y ») — remplace les 3 identités incohérentes (zinc neutre / bleu / vert BTP).
- 🔧 `report-export.ts`, `budget-export.ts` (KPI Enveloppe/Planifié/Réalisé/Écart, **écarts négatifs en rouge**), `project-summary-export.ts` (KPI + fiche caractéristiques sur 2 colonnes), `dossier-export.ts` (KPI, **statuts de phases colorés** Terminé/En cours/À venir, notes de synthèse encadrées, mention « déblocage bancaire » en pied de page), `contracts.ts` (contrats & PV passés en points pt pour réutiliser le thème, **parapheurs de signature avec lignes et mentions**, en-têtes de clauses ambre) — signatures de fonctions inchangées.
- ✅ Tests `src/lib/pdf-exports.test.ts` : les 4 générateurs (rapport, budget, fiche, dossier) s'exécutent sans erreur (jsPDF `save` neutralisé via sous-classe).
- ⚠️ Aucune migration BDD ; `contracts.test.ts` inchangé et toujours vert.

## v0.44 — Sidebar : navigation regroupée en accordéon (2026-08-16)

- 🔧 `app-shell.tsx` : le menu latéral (35 liens à plat) est désormais **regroupé en catégories repliables** pour supprimer le défilement — Tableau de bord et Projets restent en premier niveau, puis 8 sections accordéon : **Chantier** (journal, réserves, messages, échéances, photos, tâches), **Documents & plans**, **Finances** (budget, dépenses, devis, paiements, facturation), **Stock**, **Partenaires** (fournisseurs, entreprises), **Marketplace** (prestataires, demandes de devis, litiges, boutique, panier, commandes, ma boutique, location, immobilier), **Pilotage** (rapports, recherche, alertes, notifications, assistant IA), **Système** (audit, paramètres) — plus **Administration** pour les admins.
- ✅ Accordéon Radix (`ui/accordion.tsx`, `type="multiple"`) : plusieurs sections peuvent rester ouvertes ; **la section contenant la page courante s'ouvre automatiquement** à la navigation (sans fermer celles ouvertes manuellement) et son en-tête est mis en évidence ; le conteneur du menu défile seul si besoin (`overflow-y-auto`).
- 🔧 Filtrage par rôle conservé (`accessFor`) : les items interdits disparaissent et **une section vide est masquée entièrement** ; la barre de navigation mobile horizontale consomme la même liste aplatie (comportement inchangé).
- ✅ Libellés de catégories traduits FR/EN (`nav.group.*` dans `src/lib/i18n.ts`).

## v0.43 — Footer : toutes les routes publiques listées (2026-08-16)

- 🔧 Footer de la landing : la colonne « Produit » regroupe désormais tous les accès publics au compte — « Se connecter » (`/auth`), « Créer un compte » (`/auth`, existant) et « Mot de passe oublié » (`/reset-password`).
- ℹ️ Les autres routes publiques étaient déjà couvertes : « Nouveautés » (`/changelog`) dans « Découvrir » ; les pages dynamiques (`/partage/$token`, `/paiement/$reference`) ne sont pasliençables statiquement (URL par jeton/référence générée).

## v0.42 — Page « Nouveautés » synchronisée sur ce changelog (2026-08-16)

- 🔧 La page publique `/changelog` (lien « Nouveautés » du footer de la landing) n'est plus codée en dur — elle était restée bloquée aux versions v0.12→v0.14 : elle importe désormais `docs/CHANGELOG.md` en brut (`?raw`, inliné au build) et rend **les 41 versions** automatiquement.
- ✅ Parser pur `src/lib/changelog.ts` : `parseChangelog(source)` (entrées `## vX.Y — titre (date)`, sous-sections `###`, puces simples et imbriquées, icônes de convention extraites comme marqueurs, icône d'entrée dérivée — premier `✅` —, sections annexes « Base de référence » / « Règle de mise à jour » ignorées) et `formatChangelogDate(iso)` (→ « 16 août 2026 », sans dépendre du fuseau horaire).
- ✅ Rendu enrichi : légende des conventions (✅ Ajouté · 🔧 Amélioré · …) sous le titre, compteur de versions, sections avec libellés, puces imbriquées indentées, mise en forme inline du markdown (`**gras**`, `` `code` ``).
- ✅ Tests unitaires `src/lib/changelog.test.ts` (7 tests : versions/titres/dates, icônes, sous-sections, imbrication, sections annexes, icône dérivée, formatage de date).
- ⚠️ La page reflète le markdown au moment du build : la règle « mettre à jour `docs/CHANGELOG.md` avant chaque push » suffit désormais à tenir la page à jour — plus aucune duplication manuelle des entrées dans le composant.

## v0.41 — Saisie guidée pas-à-pas & dictée vocale pour ajouter des éléments (2026-08-16)

- ✅ Hook `useDictation` (`src/lib/use-dictation.ts`) : dictée Web Speech API (`fr-FR`) factorisée depuis l'assistant, réutilisable partout (`supported/listening/start/stop/toggle`), arrêt propre à l'unmount.
- ✅ Composant `DictationButton` (`src/components/dictation-button.tsx`) : bouton micro (Mic/MicOff, désactivé si navigateur non compatible) partagé par l'assistant et le wizard.
- ✅ Parseur vocal `src/lib/spoken-item.ts` (+ 13 tests unitaires `spoken-item.test.ts`) : analyse d'une phrase dictée (« 10 sacs de ciment à 4500 francs ») → désignation / quantité / unité / prix ; nombres en lettres (« quatre mille cinq cents » → 4500), unités BTP canonisées (sac, barre, m², m³, tonne, voyage…), prix (« à », « prix unitaire », francs/FCFA, « l'unité »), multi-éléments (« … et 20 barres de fer 12 à 3800 » → 2 éléments).
- ✅ Wizard `QuickAddWizard` (`src/components/quick-add-wizard.tsx`) : ajout guidé pensé débutant — dictée de l'élément **en une phrase** analysée automatiquement (repli silencieux champ par champ), puis **un champ par étape** (dictée sur chaque champ, conversion des nombres en lettres, sélection des options de select à la voix), progression « Étape X / N », récapitulatif avant enregistrement, et **mode continu** : « Ajouter un autre… » réouvre la saisie dès qu'un élément est enregistré. Plusieurs éléments reconnus dans une phrase → enregistrement en série.
- 🔧 Stock & matériaux : « Ajouter un matériau » ouvre le wizard guidé ; le formulaire d'origine reste via « Formulaire complet » (outline).
- 🔧 Matériaux chantier : « Ajouter un besoin » ouvre le wizard guidé (mapping quantité → `quantity_needed`) ; formulaire complet conservé.
- 🔧 Devis : « Ajouter une ligne » d'un devis ouvre le wizard guidé (payload `quote_items` inchangé, quantité 1 / unité « forfait » par défaut).
- 🔧 Assistant : le micro du composer passe par `DictationButton` (code dupliqué supprimé, comportement inchangé).
- ⚠️ Dictée disponible sur les navigateurs avec Web Speech (Chrome/Edge/Safari récents) ; sinon bouton grisé et repli clavier. Aucune migration BDD (payloads `useSaveRow`/`useAddMaterialRequirement` réutilisés tels quels).

## v0.40 — Pop-ups de détail au clic sur les éléments de liste (2026-08-16)

- ✅ Composant générique `EntityDetailDialog` (`src/components/entity-detail-dialog.tsx`) : pop-up de détail réutilisable (titre + badge + grille de champs libellé/valeur + contenu libre + actions), avec helper `openDetailUnlessInteractive` (ignore les clics sur boutons/inputs internes).
- ✅ **Paiements** : clic sur une ligne de paiement → détail complet (montant, type, méthode, statut, échéance, référence, passerelle, transaction, téléphone, bénéficiaire, notes) ; clic sur une transaction mobile money → détail (fournisseur, statut, téléphone, référence).
- ✅ **Matériaux** : clic sur une ligne de besoin → détail (quantités prévu/livré/consommé/reste, prix unitaire, montant estimé, fournisseur) + liste des **livraisons liées** avec montants.
- ✅ **Documents** : clic sur une carte → détail (catégorie, taille, échéance, dates, type MIME, notes) avec bouton Télécharger.
- 🔧 **Budget** : clic n'importe où sur la ligne d'un poste ouvre le `PosteDetailDialog` (le bouton œil reste disponible).
- ⚠️ Les contrôles internes (édition du budget prévu, boutons d'action) ne déclenchent pas l'ouverture du pop-up.

## v0.39 — Projets : fiche détail au clic sur une carte (2026-08-16)

- 🔧 Page Projets : cliquer sur une carte chantier ouvre désormais une **fiche détail** (`ProjectDetailDialog`) au lieu de ne rien faire — budget consommé (barre de progression dépensé/planifié), résumé financier (budget global, dépenses, tâches), caractéristiques (surfaces, niveaux, type, dates, durée, adresse complète), checklist de démarrage, et actions rapides (Activer ce chantier, Modifier, Membres).
- 🔧 Les clics sur les boutons internes des cartes (Activer, modifier, dupliquer…) ne déclenchent plus l'ouverture de la fiche.

## v0.38 — Vague 7 (clôture) : Branchage LLM pour les réponses ouvertes de l'assistant (2026-08-16)

### Serveur (`src/lib/llm-assistant.functions.ts`)

- ✅ Server function `askLlm` (pattern `createServerFn` + zod, cf. `demo-requests.functions.ts`) : appel **compatible OpenAI** (OpenAI, Groq, OpenRouter, DeepSeek…), clé API lue uniquement côté serveur (`LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`), timeout 25 s, repli silencieux `{ text: null }` en cas d'erreur.

### Helpers clients (`src/lib/llm-assistant.ts`)

- ✅ `summarizeAnalysis` — compaction du contexte chantier (budget/dépensé/reste, avancement tâches, besoins matériaux, risques rupture, panier) en quelques lignes.
- ✅ `buildLlmSystemPrompt` — rôle BâtiBénin, réponse en français, FCFA, 180 mots max, chiffres uniquement issus du contexte, action concrète en conclusion.
- ✅ `clipHistory` — mémoire courte (6 derniers tours non vides).
- ✅ Tests unitaires (`src/lib/llm-assistant.test.ts`).

### Intégration (`assistant.tsx`)

- ✅ Quand aucune intention n'est reconnue (`intent "info"`), la question est envoyée au LLM avec l'historique et le résumé du chantier ; badge **« IA générative »** sur ces réponses.
- ✅ Repli transparent sur le moteur de règles si le LLM n'est pas configuré (`LLM_API_KEY` absente) ou en erreur — les intentions reconnues (achats, budget, planning, stock, recommandations) restent 100 % locales et déterministes.
- ✅ `ai_actions.payload` enregistre `source: "llm"` pour tracer les réponses génératives.
- ⚠️ Pas de persistance des messages (state local, inchangé) ; `.env.example` et `docs/guide-deploiement.md` documentent les 3 nouvelles variables optionnelles.

## v0.37 — Vague 10 (clôture) : Plans d'étage interactifs & visites (2026-08-16)

- ✅ Composant `FloorPlanViewer` (`src/components/floor-plan-viewer.tsx`) : plan d'étage interactif alimenté par les vrais lots (`property_units`) — sélecteur d'étage (RDC + étages), lots colorés par statut (disponible / réservé / vendu), surface/pièces/prix, compteur par étage, légende.
- ✅ Fiche lot sélectionnée : détail complet + **« Planifier une visite »** (message WhatsApp pré-rempli avec lot, type, surface, prix, immeuble) + changement rapide de statut (Marquer réservé → Marquer vendu) pour le promoteur.
- ✅ Intégration dans l'onglet Immeubles d'`immobilier.tsx` : bouton « Plan d'étage » par immeuble, synchronisé avec les statuts des lots.
- ⚠️ Les visites se planifient par WhatsApp (pas de table dédiée) — choix assumé pour rester sans migration.

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
