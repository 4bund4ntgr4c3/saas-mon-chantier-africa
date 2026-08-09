# Changelog — BâtiBénin / Plateforme africaine de construction

Ce document retrace **tous les changements depuis la première version**. Il est mis à jour à chaque commit/push, en même temps que le README, le schéma de base de données et la roadmap, afin de garder une spécification toujours exacte et d'éviter de réimplémenter ou de dégrader une fonctionnalité existante.

Conventions : `✅` ajouté · `🔧` amélioré · `🐛` corrigé · `🗑️` supprimé/nettoyé · `⚠️` à noter.

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
