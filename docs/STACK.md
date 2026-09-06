# Stack & spécifications — BâtiBénin / Plateforme africaine de construction

Document de référence **vivant** : versions exactes des outils, scripts, conventions, architecture et comportements clés. Mis à jour à chaque commit/push. Permet d'éviter de réimplémenter une fonctionnalité existante ou de la dégrader.

---

## 1. Stack (versions au 2026-08-09)

| Couche        | Technologie                                                     | Version                                                              |
| ------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Runtime       | Node.js                                                         | ≥ 20 (via nvm)                                                       |
| Framework     | TanStack Start + TanStack Router                                | `@tanstack/react-start` 1.168.32 · `@tanstack/react-router` 1.170.18 |
| UI            | React + TypeScript                                              | React 19.2.0 · TS 5.8.3                                              |
| Styling       | Tailwind CSS v4 + shadcn/ui (Radix)                             | `tailwindcss` 4.2.1 · `tw-animate-css`                               |
| Requêtes      | TanStack Query                                                  | 5.101.1                                                              |
| Backend / BDD | Supabase (PostgreSQL + Auth + Storage + Edge Functions)         | `@supabase/supabase-js` 2.112.2                                      |
| Formulaires   | react-hook-form + zod                                           | 7.71.2 · 3.24.2                                                      |
| Charts        | recharts                                                        | 2.15.4                                                               |
| Exports       | jspdf, jspdf-autotable, xlsx, html2canvas                       | 4.2.1 · 5.0.8 · 0.18.5                                               |
| Notifications | Resend (Edge Function `email-notifications`)                    | —                                                                    |
| Emails / Auth | `@lovable.dev/cloud-auth-js`                                    | 1.1.2                                                                |
| Déploiement   | Vercel / Cloudflare Workers (preset `cloudflare-module`, Nitro) | `nitro` 3.0.260603-beta                                              |
| Lint / Format | ESLint 9 + Prettier 3 (plugins)                                 | —                                                                    |
| Tests         | Vitest 4.1.10 + jsdom 30                                        | —                                                                    |

## 2. Scripts (`npm run …`)

| Script       | Rôle                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| `dev`        | Serveur de développement (`vite dev`)                                    |
| `build`      | Build production (client + SSR + Nitro). **Régénère `routeTree.gen.ts`** |
| `build:dev`  | Build mode development                                                   |
| `preview`    | Prévisualisation du build (`vite preview`)                               |
| `lint`       | `eslint .`                                                               |
| `format`     | `prettier --write .`                                                     |
| `test`       | `vitest run` (une fois)                                                  |
| `test:watch` | `vitest` (mode watch)                                                    |

## 3. Architecture & conventions

### Organisation

- **Routing par fichiers** : `src/routes/**` (ex. `_authenticated/boutique.tsx`). Toute nouvelle route → le build régénère `routeTree.gen.ts`.
- **Données** : `src/lib/data.ts` centralise tous les hooks (queries TanStack Query + mutations Supabase). **Ne pas disperser les requêtes SQL dans les pages.**
- **Couches** : routes (UI) → `data.ts` (hooks) → `supabase` (client + types) ; `demo-store.ts` simule Supabase en mode invité.
- **Préférences** : `src/context/preferences-context.tsx` (`usePreferences()` : `lang`, `country`, persistés localStorage `batibenin.lang` / `batibenin.country`).
- **Page « Nouveautés »** : `src/routes/changelog.tsx` importe `docs/CHANGELOG.md` en brut (`?raw`, inliné au build) et le rend via le parser pur `src/lib/changelog.ts` (`parseChangelog`, `formatChangelogDate` — tests `changelog.test.ts`). Ne **jamais** recopier les entrées du changelog dans le composant : mettre à jour `docs/CHANGELOG.md` suffit.
- **Composants UI** : `src/components/ui/**` (shadcn/Radix) ; composants métier dans `src/components/**`.

### Contraintes TypeScript (critical)

- `tsconfig` : **`exactOptionalPropertyTypes: true`** → une propriété optionnelle ne peut PAS être assignée `undefined` ; utiliser `prop?: T | undefined` ou renvoyer `null`.
- Types de BDD générés dans `src/integrations/supabase/types.ts` (générateur `supabase gen types`).
- `routeTree.gen.ts` ne doit **jamais** être édité à la main — il est régénéré par `npm run build`.
- Workflow imposé après chaque modification : `npm run build` → `npx tsc --noEmit` → `npx eslint .` → `npm run test`.

### Mode invité (démo)

- `src/lib/guest-mode.ts` (`isGuestMode()`) + `src/lib/demo-store.ts` : une base démo en mémoire reproduit les tables Supabase (seed chantier, fournisseurs, dépenses, panier, commandes, prestataires, boutiques, produits).
- Chaque hook de `data.ts` a une branche `isGuestMode()` pour fonctionner sans compte.
- Inscription → seed d'un projet démo (signalé `demo_requests` pour la démo commerciale).

### Server functions & secrets

- Pattern `createServerFn` + zod : `src/lib/demo-requests.functions.ts` (submitDemoRequest), `src/lib/llm-assistant.functions.ts` (`askLlm` — LLM compatible OpenAI, clé `LLM_API_KEY`/`LLM_BASE_URL`/`LLM_MODEL` lue uniquement côté serveur via `process.env`).
- Helpers LLM clients : `src/lib/llm-assistant.ts` (`summarizeAnalysis`, `buildLlmSystemPrompt`, `clipHistory`, `askLlmAssistant`) — repli transparent sur le moteur de règles si non configuré.

### Gates de fonctionnalités & rôles

- `src/components/feature-gate.tsx` : `<FeatureGate feature="…">` active/désactive des modules.
- **Valeurs `Feature` existantes** (`src/lib/roles.ts` — ⚠️ ne pas en inventer) : `tableau-de-bord`, `projets`, `journal`, `documents`, `budget`, `depenses`, `devis`, `paiements`, `fournisseurs`, `entreprises`, `facturation`, `stock`, `photos`, `taches`, `partage`, `marketplace`, `rapports`, `recherche`, `alertes`, `calendrier`, `parametres`, `audit`.
- ⚠️ Pas de valeur `messages` : la route `/messages` utilise `journal` ; `/plans` et `/documents` utilisent `documents` ; `/prestataires`, `/boutique`, `/panier`, `/commandes`, `/ma-boutique` utilisent `marketplace`.
- Rôles : `src/lib/roles.ts` (`ACCOUNT_TYPES`) + `useIsAdmin()` (table `user_roles`).

### Formatage & valeurs

- `src/lib/format.ts` : `fcfa()` **résout la devise par pays** (XOF défaut, XAF pour `cg`, CDF pour `cd`) ; listes `ORDER_STATUSES`, `DELIVERY_STATUSES`, `PRODUCT_UNITS`, `DOCUMENT_CATEGORIES`, `QUOTE_STATUSES`, `PAYMENT_METHODS`, `RESERVE_STATUSES`, `RESERVE_PRIORITIES`, `PROVIDER_DOMAINS`, `PROJECT_STATUSES`.
- i18n : `src/lib/i18n.ts` (`tr(lang, key)`, `I18nKey`) — **navigation/header traduits**, écrans en FR.
- Navigation : sidebar `src/components/app-shell.tsx` — 2 entrées de premier niveau (tableau de bord, projets) + **sections repliables** (`ui/accordion.tsx`, `type="multiple"`) définies dans `NAV_SECTIONS`/`ADMIN_SECTION` ; filtrage par rôle via `accessFor` (section vide = masquée), la section contenant la route active s'ouvre automatiquement ; la barre mobile horizontale consomme la même liste aplatie.
- Géolocalisation : `src/lib/geo.ts` (`haversineKm`, `useGeolocation`, `distanceKm`, `withinRadius`, `formatDistance`) — comparateur « près de moi » + recherche par rayon en boutique et prestataires.
- Cartes : `src/components/store-map.tsx` (`StoreMap`) — **Leaflet** (`react-leaflet` v5, `leaflet` ^1.9.4) multi-fournisseurs (OpenStreetMap / Esri World / CARTO Voyager), marqueurs, cercles de rayon de livraison, position utilisateur. `src/components/points-map.tsx` (`PointsMap`) — carte générique réutilisable (projets, prestataires, suivi livraison), points typés (pin/project/provider/truck/target), polyligne itinéraire. Sélecteur de fond de carte partagé (`MAP_PROVIDERS`). La carte n'est montée qu'à la demande (pas de SSR).

### Exports PDF (thème partagé)

- `src/lib/pdf-theme.ts` : **identité visuelle unique** de tous les exports jsPDF — palette `pdfColors` (graphite zinc + accent ambre du design system), `pdfHeader` (bandeau + barre ambre + méta), `pdfSectionTitle` (barre ambre), `pdfKpiRow` (cartes KPI tonales ink/amber/green/red), `pdfTableTheme` (styles autoTable : têtes graphite, zébrures subtiles, totaux ambre pâle, marge basse réservée au pied de page), `pdfFooter` (marque + note + pagination « Page X / Y » sur toutes les pages), `slug`/`fileStamp`. Unité : **points (pt)**, format A4.
- Tout nouvel export PDF DOIT réutiliser ce module — **pas de palette locale** (les anciennes identités zinc neutre / bleu / vert BTP ont été supprimées).
- Générateurs sur le thème : `report-export.ts` (rapports génériques), `budget-export.ts` (KPI + écarts négatifs en rouge), `project-summary-export.ts` (KPI + fiche 2 colonnes), `dossier-export.ts` (statuts de phases colorés, notes encadrées), `contracts.ts` (contrats/PV en pt, parapheurs de signature).
- Tests : `src/lib/pdf-exports.test.ts` (les 4 exportateurs exécutés, `save` neutralisé via sous-classe — jsPDF attache `save` à l'instance, pas au prototype).

### Composants partagés réutilisés (ne pas dupliquer)

- `ProductCard` / `QtyStepper` / `CloseButton` (`boutique.tsx`, exportés)
- `StatusBadge` (`commandes.tsx`, importé par `ma-boutique.tsx` et `store-analytics.tsx`)
- `PageHeader`, `FeatureGate`, `Badge`, `ProductDetailDialog` (`product-compare.tsx`), `StoreAnalytics`/`TopProducts`/`RecentSales`/`ProductMovement` (`store-analytics.tsx`), `ProjectMembersButton` (`project-members.tsx`), `ProjectInvitesButton` (`project-invites.tsx`)
- `RecordDialog` (`record-form.tsx`) : formulaire générique déclaratif (`Field[]`) + `toNumber`/`orNull`
- `NotificationKindIcon` (`notification-kind-icon.tsx`) : pastille teintée par type de notification (`AppNotificationKind`), variants clair/sombre — utilisée par la cloche et `/notifications` ; ne pas réimplémenter d'icônes de kind localement
- Saisie guidée & dictée : `QuickAddWizard` (`quick-add-wizard.tsx`, wizard pas-à-pas acceptant les mêmes `Field[]` que `RecordDialog` + `parseMapping`), `DictationButton` (`dictation-button.tsx`), hook `useDictation` + `isDictationSupported` (`src/lib/use-dictation.ts`), parseur de phrases dictées `parseSpokenItems`/`normalizeSpokenNumber` (`src/lib/spoken-item.ts`, tests `spoken-item.test.ts`). Ne jamais réimplémenter l'API Web Speech dans les pages — passer par `useDictation`/`DictationButton`.
- Navigation : `NAV_MAIN` / `NAV_SECTIONS` / `ADMIN_SECTION` vivent dans **`src/lib/nav.ts`** (types `NavEntry`/`NavSection`) — sidebar `app-shell.tsx` et palette `command-palette.tsx` les consomment ; ne plus redéfinir la navigation localement.
- Palette de commandes : `CommandPalette` (`command-palette.tsx`, cmdk + `ui/command.tsx`) — Ctrl/Cmd+K, changement de chantier, navigation filtrée par rôle, thème.
- Signature électronique : `SignaturePad` (`signature-pad.tsx`) + `src/lib/esign.ts` (`documentFingerprint` SHA-256, `canonicalize`, `formatFingerprint`, tests) ; contrats via `ContractData.esign`.
- Courbe en S : `src/lib/s-curve.ts` (`computeSCurve`, `smoothstep`, `physicalProgress`, tests) — utilisée par le tableau de bord, ne pas recalculer le phasing localement.
- Export comptable : `src/lib/ohada-export.ts` (`ohadaAccountFor`, `buildOhadaJournal`, `exportOhadaExcel`, tests) — bouton dans Rapports.
- Undo suppressions : intégré dans `useDeleteRow` (`data.ts`) — ne pas ajouter de dialogues de confirmation en amont, le toast « Annuler » couvre le besoin.

### UI — contraintes (déjà posées)

- Variantes `Badge` limitées à `default/secondary/destructive/outline` (les badges custom utilisent des classes Tailwind).
- Enum `document_category` : plan, permis_construire, acte_vente, facture, contrat, garantie, photo_chantier, autre.

## 4. Base de données

- Schéma PostgreSQL versionné dans `supabase/migrations/` (ordre chronologique par horodatage).
- **État** : les migrations **ne sont pas encore appliquées** au projet Supabase (`zyiujrofyziewlpildyd`) — la CLI `supabase` n'est pas installée ; application manuelle via le SQL Editor du dashboard. Sans cela, les nouvelles tables ne fonctionnent qu'en mode invité (demo-store).
- Buckets Storage : `documents` (plans, documents), `photos` (photos produits/chantier), `journal-photos`.
- RLS activée partout ; pas de clef de service côté client (clef publishable).
- Détails par table : voir `docs/schema-bdd.md`.

### Liste des migrations

| Fichier                                           | Contenu                                                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260807…` → `20260809…`                         | Schéma de base : comptes, projets, catégories, dépenses, fournisseurs, entreprises, devis, paiements, documents, journal, budget                    |
| `20260810000000_64f2a1c9-email-notifications.sql` | Notifications e-mail + préférences                                                                                                                  |
| `20260811000000_7a8e4d3f-features.sql`            | Features, alertes                                                                                                                                   |
| `20260813000000_marketplace-prestataires.sql`     | Prestataires + avis                                                                                                                                 |
| `20260814000000_marketplace-ecommerce.sql`        | Marketplace e-commerce (boutiques, produits, panier, commandes, livraison)                                                                          |
| `20260814000001_chantier-avance.sql`              | Réserves, plans, messages                                                                                                                           |
| `20260814000002_roles-etendus.sql`                | Rôles étendus (admin)                                                                                                                               |
| `20260815000000_collaboration.sql`                | **Vague 1** : organizations, organization_members, project_members                                                                                  |
| `20260816000000_ecommerce.sql`                    | **Vague 2** : product_prices, product_inventory (+ trigger prix)                                                                                    |
| `20260817000000_materiaux-inventaire.sql`         | **Vague 3** : material_requirements, material_deliveries                                                                                            |
| `20260818000000_mobile-money.sql`                 | **Vague 3/4** : payment_transactions, enums payment_provider/status, payments.provider/transaction_id/status                                        |
| `20260819000000_devis-lignes.sql`                 | **Vague 3/4** : quote_items, invoice_items (lignes de devis/facture)                                                                                |
| `20260820000000_demandes-devis.sql`               | **Vague 5** : quote_requests, quote_bids (demande de devis en ligne)                                                                                |
| `20260821000000_litiges-remboursements.sql`       | **Vague 5** : disputes, dispute_evidences, refunds (médiation + remboursement)                                                                      |
| `20260822000000_confiance-verification.sql`       | **Vague 6** : verification_documents, market_reviews, provider_reviews.verified, products.rating/review_count (+ contraintes UNIQUE anti-faux avis) |
| `20260823000000_assistant-ia.sql`                 | **Vague 7** : ai_conversations, ai_actions, enum ai_action_type (assistant conversationnel par rôle)                                                |

## 5. Fonctionnalités livrées (map rapide → pour éviter de refaire)

| Domaine                             | Pages / Routes                                                                                                                                                                                                | Hooks (`data.ts`)                                                                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chantier                            | projets, budget, depenses, devis, paiements, facturation, stock, taches, photos, journal, reserves, plans, documents, messages, calendrier, alertes                                                           | `useProjects`, `useCategories`, `useBudgetLines`, `useExpenses`, `usePayments`, `useQuotes`, `useInvoices`, `useMaterials`, `useTasks`, `useReserves`, `usePlans`, `useMessages`…                                                                       |
| Rapports                            | rapports, recherche                                                                                                                                                                                           | `useAllExpenses`, exports PDF/Excel                                                                                                                                                                                                                     |
| Prestataires                        | prestataires                                                                                                                                                                                                  | `useProviders`, `useProviderReviews`                                                                                                                                                                                                                    |
| Marketplace                         | boutique, panier, commandes, ma-boutique                                                                                                                                                                      | `useStores`, `useProducts`, `useProductCategories`, `useProductsByStore`, `useMyCart`, `useAddToCart`, `useCreateOrder`, `useOrders`, `useDeliveries`, `useDrivers`, `useProductImageUrls`                                                              |
| E-commerce avancé (Vague 2)         | boutique (fiche/comparateur), ma-boutique (analytics)                                                                                                                                                         | `useProductPrices`, `useProductInventory`, `useAddInventoryMovement`, `useCompareOffers`, `useStoreAnalytics`                                                                                                                                           |
| Collaboration (Vague 1)             | header + cartes projets                                                                                                                                                                                       | `useProjectMembers`, `useMyProjectInvites`, `useAcceptProjectInvite`, `useAddProjectMember`, `useUpdateProjectMember`, `useRemoveProjectMember`, `useMyOrganizations`                                                                                   |
| Matériaux & inventaire (Vague 3)    | matériaux (nav, feature `stock`)                                                                                                                                                                              | `useMaterialRequirements`, `useMaterialDeliveries`, `useAddMaterialRequirement`, `useUpdateMaterialRequirement`, `useAddMaterialDelivery`                                                                                                               |
| Paiement mobile money (Vague 4)     | paiements (bouton + onglet transactions), commandes (paiement en attente + partage lien), panier (checkout mobile money), `/paiement/$reference` (publique)                                                   | `usePaymentTransactions`, `useInitiateMobileMoney`, `useConfirmMobileMoney`, `useCancelMobileMoney`, `usePublicOrderByReference`                                                                                                                        |
| Lignes devis & factures (Vague 3/4) | devis (postes dépliables + ajout), facturation (détail des postes)                                                                                                                                            | `useQuoteItems`, `useInvoiceItems`                                                                                                                                                                                                                      |
| Demande de devis (Vague 5)          | demandes-devis (mes demandes + répondre aux besoins)                                                                                                                                                          | `useQuoteRequests`, `useMyQuoteRequests`, `useQuoteBids`, `useMyQuoteBids`, `useAwardQuoteBid`                                                                                                                                                          |
| Litiges & remboursements (Vague 5)  | litiges (mes litiges + tous)                                                                                                                                                                                  | `useDisputes`, `useMyDisputes`, `useDisputeEvidences`, `useRefunds`, `useDecideDispute`                                                                                                                                                                 |
| Confiance & vérification (Vague 6)  | parametres (section vérification), admin/verifications, avis vendeurs/produits/transporteurs (boutique — fiche produit, panier, prestataires)                                                                 | `useProfileVerification`, `useMyVerificationDocuments`, `useAllVerificationDocuments`, `useSubmitVerificationDocument`, `useReviewVerificationDocument`, `useMarketReviews`, `useAddMarketReview`                                                       |
| IA — Assistant (Vague 7)            | assistant (conversation par rôle, IA Achats multi-boutiques, calcul de quantités, notes vocales, prévision de stock fournisseur, descriptions IA produits)                                                    | `useAiConversations`, `useAiActions`, `useUpsertAiConversation`, `useAddAiAction`, `useStoreStockForecast`, `computeStockForecast`, `suggestProductDescription`                                                                                         |
| Notifications multi-canal (Vague 8) | cloche (notifications persistées + marquage lu), parametres (canaux push/SMS/WhatsApp + autorisation navigateur), `/notifications` (historique/filtres/suppression), commandes (partage SMS lien de paiement) | `useNotifications`, `useUnreadNotificationCount`, `useMarkNotificationsRead`, `useMarkNotificationRead`, `useDeleteNotification`, `useAddNotification`, `addPersistedNotification`, `useDeviceTokens`, `useRegisterDeviceToken`, `useRemoveDeviceToken` |
| Location de matériel (Vague 9)      | `/location` (catalogue, mon matériel, mes locations, QR de remise, paiement caution)                                                                                                                          | `useEquipment`, `useMyEquipment`, `useMyEquipmentRentals`, `useCreateEquipmentRental`, `useUpdateEquipmentRentalStatus`, `useReturnEquipmentRental`, `computeRentalPrice`, `hasRentalConflict`, `generateReturnCode`                                    |
| Immobilier promoteurs (Vague 10)    | `/immobilier` (programmes, immeubles & lots, dossiers clients)                                                                                                                                                | `useMyDevelopmentPrograms`, `useBuildings`, `useProgramUnits`, `useMyPropertyReservations`, `useCreatePropertyReservation`, `useUpdatePropertyReservationStatus`, `computeProgramStats`                                                                 |
| Admin                               | admin/, admin/utilisateurs, admin/demandes-demo, admin/verifications, audit                                                                                                                                   | `useAdminStats`, `useAdminUsers`, `useSetAccountType`, `useToggleAdmin`, `useAuditLogs`                                                                                                                                                                 |
| IA (règles)                         | tableau-de-bord (Conseiller)                                                                                                                                                                                  | —                                                                                                                                                                                                                                                       |
| Saisie guidée & dictée vocale       | stock, materiaux (wizard guidé + « Formulaire complet »), devis (lignes)                                                                                                                                      | `useDictation`, `isDictationSupported` (`use-dictation.ts`), `parseSpokenItems`/`normalizeSpokenNumber` (`spoken-item.ts`) — aucun hook data nouveau, payloads `useSaveRow`/`useAddMaterialRequirement` inchangés                                       |

## 6. Contrôles qualité (commandes)

```sh
npm run build      # génère routeTree.gen.ts + build complet
npx tsc --noEmit   # 0 erreur attendue
npx eslint .       # 0 erreur (warnings fast-refresh tolérés)
npm run test       # 138 tests (dont spoken-item 13, s-curve 13, ohada 7, esign 6)
```

## 7. Prochaines étapes

Voir `docs/roadmap.md` — **Vague 8** (notifications) : push web réel (service worker) et SMS/WhatsApp transactionnels. **Vague 9** (location de matériel) : paiement intégral de la location par mobile money (hors caution). **Vague 10** (immobilier promoteurs) : plans d'étage interactifs. **Vague 11** (géolocalisation & cartes) : tranche 2 — géolocalisation des projets/prestataires et suivi de livraison sur carte.
