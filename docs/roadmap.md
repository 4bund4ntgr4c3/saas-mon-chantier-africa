# Roadmap — BâtiBénin / Plateforme africaine de construction

Ce document traduit le **prompt maître** en plan d'implémentation par vagues. Chaque vague est un incrément livrable : migration SQL → hooks `data.ts` → routes → gates de rôle → tests.

Légende d'état : ✅ fait · 🔄 en cours · ⬜ à faire

---

## Fondations déjà en place (Phases 0-4)

| Module                                                                                                                                                                                                                                                       | État |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| Paiement mobile money sandbox (Vague 4 fondations)                                                                                                                                                                                                           | ✅   |
| Comptes 7 types + rôles admin étendus                                                                                                                                                                                                                        | ✅   |
| Gestion de chantier (projets, budget, dépenses, devis, paiements, facturation, stock, tâches, photos, journal, réserves, plans, documents, messages)                                                                                                         | ✅   |
| Marketplace prestataires + avis                                                                                                                                                                                                                              | ✅   |
| Marketplace e-commerce (boutiques, produits, panier, commandes, livraison, transporteurs)                                                                                                                                                                    | ✅   |
| Back-office admin                                                                                                                                                                                                                                            | ✅   |
| PWA installable, i18n FR/EN (nav), multi-pays/devise, Conseil IA à base de règles                                                                                                                                                                            | ✅   |
| Lignes de devis & factures (Vague 5 — quote_items, invoice_items)                                                                                                                                                                                            | ✅   |
| Demande de devis en ligne (Vague 5 — quote_requests, quote_bids)                                                                                                                                                                                             | ✅   |
| Litiges & remboursements (Vague 5 — disputes, dispute_evidences, refunds)                                                                                                                                                                                    | ✅   |
| Confiance & vérification (Vague 6 — verification_documents, market_reviews, avis vérifiés)                                                                                                                                                                   | ✅   |
| IA (Vague 7 — ai_conversations, ai_actions, assistant conversationnel, notes vocales, achats multi-boutiques, prévision stock fournisseur, descriptions IA)                                                                                                  | ✅   |
| Saisie guidée pas-à-pas & dictée vocale (ajout de matériaux, besoins et lignes de devis — wizard + parseur de phrases dictées)                                                                                                                               | ✅   |
| Identité visuelle unifiée des exports PDF (`pdf-theme.ts` : bandeau de marque, cartes KPI, pied de page paginé — rapport, budget, fiche chantier, dossier, contrats) & notifications pleinement adaptées au mode sombre (pastilles par type, toasts teintés) | ✅   |
| Tests unitaires (33), docs (schéma, installation, déploiement, changelog, stack)                                                                                                                                                                             | ✅   |

---

## Vague 1 — Socle collaboration & multi-tenant ✅

**Objectif** : permettre à plusieurs comptes de collaborer sur un même chantier (au-delà du partage lecture seule par lien).

**Tables** :

- `organizations` : id, name, created_by, created_at
- `organization_members` : id, organization_id, user_id, role (owner/admin/member), created_at
- `project_members` : id, project_id, user_id (nullable), email (invitation en attente), role (owner/editor/viewer), created_at

**RLS** : lecture/écriture réservées aux membres de l'organisation ; `project_members` lisible par les participants (via `user_id` ou `email = auth.jwt()->>'email'`), gérable par le propriétaire du chantier ou un admin.

**Hooks** : `useProjectMembers(projectId)` (avec noms), `useMyProjectInvites`, `useAcceptProjectInvite`, `useAddProjectMember` (invitation par e-mail), `useUpdateProjectMember`, `useRemoveProjectMember`, `useMyOrganizations`.

**UI** :

- Bouton « Membres » (👥) sur chaque carte de projet → dialogue : invitation par e-mail + rôle, liste des membres avec changement de rôle, retrait, affichage des invitations en attente.
- Cloche « Invitations » (🪖, avec badge) dans le header → liste des invitations reçues par e-mail + bouton Accepter (rattache le compte).

**Dépendances débloquées** : partage en écriture multi-acteurs, base du multi-tenant global.

---

## Vague 2 — E-commerce avancé + comparateur ✅

**Migration** `20260816000000_ecommerce.sql` :

- `product_prices` : historique des prix (déclenché automatiquement sur `products.price` via trigger `track_product_price_change`)
- `product_inventory` : mouvements de stock (`stock_init` / `sale` / `restock` / `adjustment` / `return` / `cancellation`)
- RLS : prix lisibles par tous (transparence), écriture réservée au propriétaire du produit / admin

**Comparateur de prix** (`useCompareOffers`) : regroupe par catégorie + nom normalisé, affiche prix / distance / économie / stock / boutique ; tri « près de moi » via géolocalisation navigateur (`geo.ts` : `haversineKm` + `useGeolocation`, colonnes `stores.lat/lng`).

**Fiche produit enrichie** (`product-compare.tsx`) : galerie multi-images, caractéristiques, garantie, marque/référence, quantité min, commande par offres concurrentes.

**Analytics vendeur** (`useStoreAnalytics` + `store-analytics.tsx`) : CA, panier moyen, nb commandes, ruptures, meilleures ventes, dernières ventes ; suivi stock/prix par produit (`ProductMovement`).

- `product_images` : jugé non nécessaire (déjà couvert par `products.images[]`).
- Recherche géographique : couverte par le comparateur « près de moi » (Vague 2) ; une carte complète reste à venir.

## Vague 3 — Matériaux & inventaire chantier ✅

**Migration** `20260817000000_materiaux-inventaire.sql` :

- `material_requirements` : besoins en matériaux d'un chantier (prévu / commandé / livré / consommé / restant, prix unitaire, fournisseur, statuts `besoin/commande/partiel/livre/termine`)
- `material_deliveries` : livraisons de matériaux liées au chantier (quantité, prix unitaire, date, statuts `planifiee/en_route/partielle/livree/annulee`)
- RLS propriétaire du chantier + admin

**Page « Matériaux chantier »** (`materiaux.tsx`, nav) : table des besoins avec barre de progression, montant estimé, badge statut ; panneau « À commander encore » ; bouton « Livrer » qui met à jour automatiquement le besoin (statut `livre`/`partiel`) ; clôture en `termine` ; historique des 20 dernières livraisons.

**Page publique « Nouveautés »** (`changelog.tsx`, lien footer landing) : journal des évolutions de la plateforme, accessible sans compte — rend **toutes les versions de `docs/CHANGELOG.md` automatiquement** (import brut `?raw` + parser `src/lib/changelog.ts`, testé) ; plus aucune duplication manuelle des entrées.

- Inventaire avancé : pertes, mouvements de stock liés aux commandes marketplace, lien vers `products` — reporté.

## Vague 4 — Paiement mobile money 🔄 (fondations ✅)

**Migration** `20260818000000_mobile-money.sql` :

- `payment_transactions` : montant, devise, `provider`, téléphone, statuts `initiee/en_attente/confirmee/echouee/annulee`, `reference`, `transaction_id`, `raw_response`
- `payments` enrichis : `provider`, `transaction_id`, `status`
- RLS propriétaire du chantier + admin ; index user/project/order/status ; trigger `updated_at`

**Hooks** : `useInitiateMobileMoney` (sandbox), `useConfirmMobileMoney` (retour passerelle simulé → crée le `payments` + marque la commande `payee`), `useCancelMobileMoney`.

**UI** : dialogue `MobileMoneyDialog` (montant → opérateur → numéro → initier → confirmer/échouer) intégré à la page Paiements + onglet transactions ; paiement depuis le panier et le détail de commande ; **lien de paiement public** `/paiement/$reference` partageable via WhatsApp (RPC `get_payment_link_order`).

- ✅ Sandbox MTN MoMo / Moov Money (payement fictif) — **fait**
- ✅ Lien de paiement partageable (WhatsApp) — **fait**
- ✅ Paiement à la livraison (méthode `a_la_livraison`) — **fait**
- ⬜ Gateway réelle MTN MoMo / Moov Money, architecture par pays (PayDunya, Bankly, CMI, Paystack…) à brancher sur `payment_provider`

## Vague 5 — Devis en ligne + litiges ✅

- ✅ `quote_items`, `invoice_items` (lignes de devis/facture) — **fait** (migration `20260819000000_devis-lignes.sql`, UI devis dépliable, détail facture)
- ✅ **Demande de devis** : particulier décrit un besoin (budget, localisation, domaine) → prestataires répondent avec une offre chiffrée → comparaison et attribution — **fait** (migration `20260820000000_demandes-devis.sql`, page `demandes-devis` 2 onglets, RLS dédiées)
- ✅ **Litiges & remboursements** : workflow de médiation (preuves, décision, remboursement) — **fait** (migration `20260821000000_litiges-remboursements.sql`, page `litiges` 2 onglets, décision admin + suivi des remboursements)

## Vague 6 — Confiance & vérification ✅

- ✅ Workflow de soumission de documents + validation admin (table `profile_verifications` existante)
- ✅ Avis étendus : transporteurs, vendeurs, produits
- ✅ Avis vérifiés + lutte anti-faux avis

## Vague 7 — IA ✅

- ✅ Notes vocales + speech-to-text « Parler au chantier » (bouton micro, Web Speech)
- ✅ Assistant conversationnel par rôle (`ai_conversations`, `ai_actions`) — assistant à base de règles, IA Achats (liste + estimation + panier), recommandations produits
- ✅ IA achats avancé : comparaison multi-boutiques (meilleure offre en stock par besoin), calcul de quantités (multiple de la commande minimale), économie estimée
- ✅ IA fournisseur : prévision de stock 30 j (vélocité, jours restants, réappro suggéré) pour le rôle quincaillerie + panel et intention « stock »
- ✅ Descriptions IA de produits (générateur à base de règles + bouton dans Ma boutique)
- ✅ Branchage LLM (optionnel) pour des réponses ouvertes — server function `askLlm` compatible OpenAI (`LLM_API_KEY`/`LLM_BASE_URL`/`LLM_MODEL`, clé côté serveur uniquement), résumé de chantier en prompt système, mémoire 6 tours, badge « IA générative », repli transparent sur le moteur de règles si non configuré

## Vague 8 — Notifications multi-canal 🔄

- ✅ Table `notifications` persistée + `device_tokens` (migration `20260824000000_notifications-multicanal.sql`)
- ✅ Infrastructure : hooks `useNotifications` / `useMarkNotificationsRead` / `useRegisterDeviceToken` / `useAddNotification`, enums `notification_channel` + `notification_kind`
- ✅ Cloche de notifications alimentée par les notifications persistées (canal `in_app`), marquées lues à l'ouverture
- ✅ Câblage des événements : commande passée, paiement confirmé, livraison mise à jour, livraison de matériaux
- ✅ Préférences de canaux Push/SMS/WhatsApp dans Paramètres + enregistrement du navigateur comme appareil web
- ✅ Page « Mes notifications » (`/notifications`) : historique, filtres par type, marquer lu/non lu, supprimer, tout marquer lu
- ✅ Push navigateur (Notification API) : autorisation depuis Paramètres + notification système sur nouveaux événements
- ✅ Partage SMS du lien de paiement (à côté du partage WhatsApp)
- ⬜ Push web réel (service worker) + push mobile
- ⬜ SMS / WhatsApp transactionnels (devis, rapports, suivi de livraison) via fournisseur

## Vague 9 — Location de matériel ✅

- ✅ `equipment` + `equipment_rentals` : prix/jour/semaine, caution, réservation, livraison, état du matériel (migration `20260825000000_location-materiel.sql`)
- ✅ Catalogue `/location` (recherche, filtre catégorie, carte tarifs/caution), demande de location (période + livraison)
- ✅ Mon matériel (CRUD parc, statut/état) et Mes locations (confirmations propriétaire + demandes client)
- ✅ `computeRentalPrice` (semaines + jours), notifications à la demande et au changement de statut
- ✅ Chevauchement de périodes : `hasRentalConflict` (blocage côté client + vérification propriétaire à la confirmation)
- ✅ QR code de remise du matériel (`return_code` + lib `qrcode`) et validation du retour par code
- ✅ Paiement de la caution par mobile money (`MobileMoneyDialog` + `deposit_paid`)
- ✅ Paiement intégral de la location par mobile money (hors caution) — `total_paid`/`total_paid_at` (migration `20260829000000_location-paiement-integral.sql`), helper `rentalTotalDue` (loyer + livraison), bouton « Payer la location » et badge « Location payée » dans Mes locations

## Vague 10 — Immobilier promoteurs 🔄

- ✅ `development_programs` → `buildings` → `property_units` (lots) : statuts, types, prix, étages, surfaces (migration `20260826000000_immobilier-promoteurs.sql`)
- ✅ Budget / objectif de ventes par programme, avancement des ventes (vendus/réservés/dispo + montant encaissé, `computeProgramStats`)
- ✅ Dossiers clients (`property_reservations`) : réservation, confirmation (lot réservé), vente (lot vendu), annulation (lot disponible)
- ✅ Route `/immobilier` : programmes (CRUD + détail), immeubles & lots (CRUD), dossiers clients (par programme)
- ✅ Paiement de l'acompte de réservation par mobile money (`deposit_paid`)
- ✅ Plans d'étage interactifs / visites — `FloorPlanViewer` (`src/components/floor-plan-viewer.tsx`) : sélecteur d'étage, lots colorés par statut, fiche lot, planification de visite par WhatsApp pré-rempli, changement rapide de statut promoteur ; intégré à l'onglet Immeubles

## Vague 11 — Géolocalisation & cartes 🔄

- ✅ Tranche 1 : rayon de livraison des boutiques (`stores.delivery_radius_km`), recherche « près de moi » (géolocalisation + filtre par rayon), **carte Leaflet multi-fournisseurs** (OSM / Esri / CARTO) avec marqueurs et cercles de livraison (`StoreMap`)
- ✅ Tranche 2 : géolocalisation des projets (`projects.lat`/`lng`, carte projets via PointsMap) et prestataires (`providers.lat`/`lng`, recherche « près de moi » + badge distance + carte), suivi de livraison sur carte (`deliveries.current_lat`/`current_lng`, itinéraire transporteur→destination, hook `useUpdateDeliveryPosition`, simulation déplacement)

## Vague 12 — Outillage BTP, Séquestre, OCR & Offline Sync ✅

- ✅ **Calculateur de métré BTP & cubage** (`src/lib/metre.ts`, `src/components/metre-calculator.tsx`) : béton armé, sacs de ciment 50kg, sable, gravier, aciers HA, agglos et toiture.
- ✅ **Séquestre / Escrow d'acomptes BTP** (`src/components/escrow-dialog.tsx`) : déblocage par jalons validés par photos et paiement Mobile Money.
- ✅ **Scan OCR de reçus & factures** (`src/lib/ocr-receipt.ts`, `src/components/receipt-scanner.tsx`) : pré-remplissage automatique des dépenses.
- ✅ **Météo de chantier & alertes coulage béton** (`src/lib/weather.ts`, `src/components/weather-widget.tsx`).
- ✅ **Export Dossier Chantier Banque & Diaspora PDF** (`src/lib/dossier-export.ts`).
- ✅ **Mode Hors-Ligne & Sync PWA** (`src/lib/offline-sync.ts`, `src/components/offline-banner.tsx`).

## Vague 13 — RH Main d'œuvre, Plans 2D interactifs, Tontine & Abonnements SaaS ✅

- ✅ **Pointage ouvriers & Paie journalière** (`src/lib/labor.ts`, `src/components/labor-management.tsx`)
- ✅ **Plans 2D interactifs & Pastilles de réserves** (`src/components/interactive-plan-viewer.tsx`)
- ✅ **Tontine & Cagnotte de matériaux collaborative** (`src/lib/tontine.ts`, `src/components/tontine-dialog.tsx`)
- ✅ **Comparateur d'avancement Avant/Après** (`src/components/before-after-slider.tsx`)
- ✅ **Forfaits & Abonnements SaaS** (`src/components/subscription-plans.tsx`)

## Vague 14 — Simulateur Coût Global, Solaire BTP, WhatsApp Pro & e-MECeF Bénin ✅

- ✅ **Simulateur de Coût Global & Générateur de Projet en 1 clic** (`src/lib/simulator.ts`, `src/components/cost-simulator-dialog.tsx`)
- ✅ **Calculateur de Dimensionnement Solaire & Forage Chantier** (`src/lib/solar.ts`, `src/components/solar-calculator-dialog.tsx`)
- ✅ **Partageur WhatsApp Pro & Templates Automatisés** (`src/lib/whatsapp-templates.ts`, `src/components/whatsapp-share-dialog.tsx`)
- ✅ **Facturation Normalisée e-MECeF Bénin DGI** (`src/lib/emecef.ts`, `src/components/emecef-invoice-dialog.tsx`)

## Vague 15 — Contrats BTP, Planning Gantt, Transport, Assurance & Relances ✅

- ✅ **Générateur de Contrats BTP & PV de Réception (Juridique & Anti-Litiges)** (`src/lib/contracts.ts`, `src/components/contract-generator-dialog.tsx`)
- ✅ **Planning Prédictif Intelligent & Diagramme de Gantt BTP** (`src/lib/gantt-schedule.ts`, `src/components/gantt-schedule-dialog.tsx`)
- ✅ **Simulateur Logistique & Coût de Transport de Matériaux** (`src/lib/transport-cost.ts`, `src/components/transport-cost-dialog.tsx`)
- ✅ **Simulateur d'Assurance Chantier & Garantie Décennale (TRC)** (`src/lib/insurance.ts`, `src/components/insurance-dialog.tsx`)
- ✅ **Centre de Relances Automatisées Factures & Impayés** (`src/lib/payment-reminders.ts`, `src/components/payment-reminders-dialog.tsx`)

## Vague 16 — Rentabilité Locative, Sécurité HSE, Badges QR Code, Bilan Carbone & Passerelles Live ✅

- ✅ **Simulateur de Rentabilité Locative & ROI Post-Construction** (`src/lib/rental-yield.ts`, `src/components/rental-yield-dialog.tsx`)
- ✅ **Registre de Sécurité HSE & Check-list EPI Chantier** (`src/lib/safety-audit.ts`, `src/components/safety-audit-dialog.tsx`)
- ✅ **Générateur de Badges d'Accès & QR Codes Intervenants** (`src/lib/access-badge.ts`, `src/components/access-badge-dialog.tsx`)
- ✅ **Bilan Carbone BTP & Éco-Matériaux** (`src/lib/carbon-footprint.ts`, `src/components/carbon-footprint-dialog.tsx`)
- ✅ **Passerelle de Paiement Live FedaPay / Kkiapay & Webhooks Automatisés** (`src/lib/payment-gateway.ts`, `src/components/payment-gateway-dialog.tsx`)

## Vague 17 — Application Mobile Native Expo & Webhooks WhatsApp Cloud ⬜

- Application mobile autonome sous Expo / React Native
- Passerelle live WhatsApp Cloud API avec webhooks entrants
- Intégration bancaire directe EBICS / UEMOA

## Vague 18 — Professionnalisation & ergonomie ✅

- ✅ **Palette de commandes globale** (Ctrl/Cmd+K) : changement de chantier, navigation filtrée par rôle, actions — navigation centralisée dans `src/lib/nav.ts`
- ✅ **Courbe en S** du tableau de bord (phasing smoothstep BTP, module `s-curve.ts` testé) + confrontation avancement physique vs financier
- ✅ **Undo des suppressions** : `useDeleteRow` relit puis restaure la ligne via toast « Annuler » (6 s), Supabase et mode invité
- ✅ **Export comptable SYSCOHADA** (`ohada-export.ts` testé) : écritures équilibrées 6x/401 + synthèse, bouton dans Rapports
- ✅ **Signature électronique** des contrats & PV : `SignaturePad` + empreinte SHA-256 (`esign.ts` testé) intégrées au PDF
- ✅ **Tableau de bord par rôle** (`RoleDashboardStrip`) : KPIs et raccourcis par `account_type`, visible sans chantier sélectionné
- ✅ **Modèles de chantier** : duplication structure seule (budget + besoins remis à zéro + tâches à faire)
- ✅ **Rapport hebdomadaire e-mail enrichi** (tableau budget par chantier + 7 derniers jours, mode `digest` immédiat)
- ✅ **Push web réel** (Web Push + VAPID) : handlers `push`/`notificationclick` dans `sw.js`, abonnement depuis Paramètres (`VITE_VAPID_PUBLIC_KEY`)
- ✅ i18n FR/EN du tableau de bord (clés `dash.*`)

## Vague 19 — Signature Tactile Canvas, Mode Kiosque Chantier & Centrale d'Achats Groupés ✅

- ✅ **Signature Électronique Tactile sur Écran** (`src/lib/signature.ts`, `src/components/signature-pad-dialog.tsx`)
- ✅ **Mode Kiosque Terrain pour Conducteurs de Travaux** (`src/components/site-kiosk-dialog.tsx`)
- ✅ **Gestionnaire Notifications Push & Alertes Locales** (`src/lib/push-notifications.ts`, `src/components/push-notifications-toggle.tsx`)
- ✅ **Centrale d'Achats Groupés BTP & Remises de Volume** (`src/lib/bulk-purchasing.ts`, `src/components/bulk-purchasing-dialog.tsx`)
- ✅ **Réseau Quincailleries Multi-Dépôts Régionaux** (`src/lib/supplier-network.ts`, `src/components/supplier-network-dialog.tsx`)

## Vague 20 — Financement UEMOA, WhatsApp Cloud API, Carnet d'Entretien & Kits d'Ouvrages ✅

- ✅ **Simulateur de Prêt Bancaire & Crédit Immobilier UEMOA** (`src/lib/bank-loan.ts`, `src/components/bank-loan-dialog.tsx`)
- ✅ **Connecteur Transactionnel WhatsApp Cloud API** (`src/lib/whatsapp-cloud.ts`, `src/components/whatsapp-cloud-dialog.tsx`)
- ✅ **Carnet d'Entretien Numérique & Maintenance Préventive** (`src/lib/maintenance-log.ts`, `src/components/maintenance-log-dialog.tsx`)
- ✅ **Générateur de Kits Matériaux par Ouvrage Type** (`src/lib/material-kits-calculator.ts`, `src/components/material-kits-dialog.tsx`)

## Vague 21 — Suite Promoteur Immobilier & Maître d'Ouvrage ✅

- ✅ **Étude de Faisabilité & Bilan Financier de l'Opération** (`src/lib/developer-feasibility.ts`, `src/components/developer-feasibility-dialog.tsx`)
- ✅ **Échéancier des Appels de Fonds & Trésorerie VEFA** (`src/lib/developer-cashflow.ts`, `src/components/developer-cashflow-dialog.tsx`)
- ✅ **Générateur de Contrats de Réservation VEFA** (`src/lib/vefa-contract.ts`, `src/components/vefa-contract-dialog.tsx`)
- ✅ **Cockpit Exécutif Propriétaire & Diaspora** (`src/lib/owner-dashboard.ts`, `src/components/owner-dashboard-dialog.tsx`)

## Vague 22 — Suite Spéciale Propriétaire & Maître d'Ouvrage ✅

- ✅ **Coffre-Fort Numérique Foncier du Propriétaire** (`src/lib/owner-vault.ts`, `src/components/owner-vault-dialog.tsx`)
- ✅ **Comparateur & Arbitrage des Gammes de Finitions** (`src/lib/finishings-comparator.ts`, `src/components/finishings-comparator-dialog.tsx`)
- ✅ **Guide d'Inspection & Checklist de Réception des Clés** (`src/lib/handover-checklist.ts`, `src/components/handover-checklist-dialog.tsx`)
- ✅ **Simulateur de Factures Énergétiques Post-Emménagement SBEE / SONEB** (`src/lib/utility-bills-estimator.ts`, `src/components/utility-bills-dialog.tsx`)

## Vague 23 — Suite Propriétaire & Gestion Patrimoniale ✅

- ✅ **Assurance Multirisque Habitation (MRH) & Risques Inondations** (`src/lib/home-insurance.ts`, `src/components/home-insurance-dialog.tsx`)
- ✅ **Rentabilité Locative Meublé vs Nu & Cash-Flow Bailleur** (`src/lib/rental-cashflow.ts`, `src/components/rental-cashflow-dialog.tsx`)
- ✅ **Dimensionnement Cuve à Eau & Récupération Pluviale** (`src/lib/rainwater-harvesting.ts`, `src/components/rainwater-harvesting-dialog.tsx`)
- ✅ **Générateur de Bail d'Habitation Conforme Loi 2017-15 Bénin** (`src/lib/lease-agreement.ts`, `src/components/lease-agreement-dialog.tsx`)

## Vague 24 — Performance Chantier, Qualité Béton & Sécurité ✅

- ✅ **Formulation & Dosage des Bétons B25 / B20 / B15** (`src/lib/concrete-mix.ts`, `src/components/concrete-mix-dialog.tsx`)
- ✅ **Registre de Présence Ouvriers & Contrôle EPI** (`src/lib/worker-attendance.ts`, `src/components/worker-attendance-dialog.tsx`)
- ✅ **Audit & Contrôle Ferraillage / Enrobage Côtier** (`src/lib/rebar-inspection.ts`, `src/components/rebar-inspection-dialog.tsx`)
- ✅ **Journal d'Intempéries & Ajustement du Calendrier** (`src/lib/weather-delays.ts`, `src/components/weather-delays-dialog.tsx`)

## Vague 25 — Diagnostics Avant-Projet, Structure & Confort ✅

- ✅ **Capacité Portante des Sols & Choix des Fondations** (`src/lib/soil-foundations.ts`, `src/components/soil-foundations-dialog.tsx`)
- ✅ **Confort Thermique Passif Tropical & Maçonnerie BTC** (`src/lib/thermal-comfort.ts`, `src/components/thermal-comfort-dialog.tsx`)
- ✅ **Dimensionnement Prise de Terre & Protection Foudre** (`src/lib/lightning-grounding.ts`, `src/components/lightning-grounding-dialog.tsx`)
- ✅ **Générateur d'Ordres de Service (OS) & Avenants Contractuels** (`src/lib/service-orders.ts`, `src/components/service-orders-dialog.tsx`)

## Vague 26 — Assainissement, Clôtures, Sécurité Incendie & Décompte Général Définitif DGD ✅

- ✅ **Dimensionnement Fosse Septique Toutes Eaux & Puits Perdu** (`src/lib/septic-tank.ts`, `src/components/septic-tank-dialog.tsx`)
- ✅ **Calculateur de Mur de Clôture & Sécurisation Périphérique** (`src/lib/boundary-wall.ts`, `src/components/boundary-wall-dialog.tsx`)
- ✅ **Guide de Sécurité Incendie & Extincteurs** (`src/lib/fire-safety.ts`, `src/components/fire-safety-dialog.tsx`)
- ✅ **Décompte Général Définitif (DGD) & Retenue de Garantie 5%** (`src/lib/final-settlement.ts`, `src/components/final-settlement-dialog.tsx`)

## Vague 27 — VRD, Raccordements SBEE/SONEB, Déchets & Urbanisme ✅

- ✅ **Bilan de Puissance Électrique & Raccordement SBEE** (`src/lib/electrical-load.ts`, `src/components/electrical-load-dialog.tsx`)
- ✅ **Dimensionnement Surpresseur SONEB & Hauteur Manométrique HMT** (`src/lib/water-booster.ts`, `src/components/water-booster-dialog.tsx`)
- ✅ **Plan de Gestion & Valorisation des Déchets de Chantier** (`src/lib/waste-management.ts`, `src/components/waste-management-dialog.tsx`)
- ✅ **Calculateur d'Emprise au Sol (CES), COS & Reculs Réglementaires** (`src/lib/zoning-footprint.ts`, `src/components/zoning-footprint-dialog.tsx`)

---

## Ordre recommandé

1. **Vague 1** (socle collaboration) — débloque le multi-acteurs
2. **Vagues 2-4** (marketplace + paiement) — cœur lucratif
3. **Vagues 5-6** (devis, litiges, confiance) — rétention
4. **Vagues 7-8** (IA, notifications) — différenciation
5. **Vagues 9-13** (location, immobilier, cartes, abonnements, mobile) — expansion

Chaque vague inclut : migration SQL + RLS, hooks, routes, gates de rôle, tests, et une validation `tsc`/`eslint`/`build`.
