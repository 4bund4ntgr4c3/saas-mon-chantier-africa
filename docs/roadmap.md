# Roadmap — BâtiBénin / Plateforme africaine de construction

Ce document traduit le **prompt maître** en plan d'implémentation par vagues. Chaque vague est un incrément livrable : migration SQL → hooks `data.ts` → routes → gates de rôle → tests.

Légende d'état : ✅ fait · 🔄 en cours · ⬜ à faire

---

## Fondations déjà en place (Phases 0-4)

| Module | État |
| --- | --- |
| Paiement mobile money sandbox (Vague 4 fondations) | ✅ |
| Comptes 7 types + rôles admin étendus | ✅ |
| Gestion de chantier (projets, budget, dépenses, devis, paiements, facturation, stock, tâches, photos, journal, réserves, plans, documents, messages) | ✅ |
| Marketplace prestataires + avis | ✅ |
| Marketplace e-commerce (boutiques, produits, panier, commandes, livraison, transporteurs) | ✅ |
| Back-office admin | ✅ |
| PWA installable, i18n FR/EN (nav), multi-pays/devise, Conseil IA à base de règles | ✅ |
| Lignes de devis & factures (Vague 5 — quote_items, invoice_items) | ✅ |
| Demande de devis en ligne (Vague 5 — quote_requests, quote_bids) | ✅ |
| Litiges & remboursements (Vague 5 — disputes, dispute_evidences, refunds) | ✅ |
| Tests unitaires (26), docs (schéma, installation, déploiement, changelog, stack) | ✅ |

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

**Page publique « Nouveautés »** (`changelog.tsx`, lien footer landing) : journal des évolutions de la plateforme, accessible sans compte.

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

## Vague 6 — Confiance & vérification ⬜

- Workflow de soumission de documents + validation admin (table `profile_verifications` existante)
- Avis étendus : transporteurs, vendeurs, produits
- Avis vérifiés + lutte anti-faux avis

## Vague 7 — IA ⬜

- Notes vocales + speech-to-text « Parler au chantier »
- IA achats : liste de matériaux, calcul de quantités, comparaison, préparation de panier
- Assistant conversationnel par rôle (`ai_conversations`, `ai_actions`)
- Recommandations marketplace, IA fournisseur (prévision stock, descriptions)

## Vague 8 — Notifications multi-canal ⬜

- Table `notifications` persistée + `device_tokens`
- Push web/mobile, SMS, WhatsApp (partage devis/commande/rapport, liens de paiement, suivi de livraison)

## Vague 9 — Location de matériel ⬜

- `equipment` + `equipment_rentals` : prix/jour/semaine, caution, réservation, livraison, état du matériel

## Vague 10 — Immobilier promoteurs ⬜

- Programmes → immeubles → étages → lots/appartements
- Budgets, avancement, ventes, dossiers clients, réservation

## Vague 11 — Géolocalisation & cartes ⬜

- Couche cartes multi-fournisseurs, distances, rayon de livraison, recherche « près de moi »
- (colonnes `lat`/`lng` déjà présentes sur projects/providers/stores/orders/deliveries)

## Vague 12 — Abonnements & commissions ⬜

- `subscriptions`, `plans`, `commissions` : billing, mise en avant des vendeurs, freemium

## Vague 13 — Mobile & faible connexion ⬜

- App Expo/React Native (navigation Accueil/Projets/Marketplace/Commandes/Messages/Profil + bouton central `+`)
- Mode offline : cache local, sync différée, compression images, upload en arrière-plan
- Pointage d'équipe, accueils spécialisés (particulier / vendeur / artisan)

---

## Ordre recommandé

1. **Vague 1** (socle collaboration) — débloque le multi-acteurs
2. **Vagues 2-4** (marketplace + paiement) — cœur lucratif
3. **Vagues 5-6** (devis, litiges, confiance) — rétention
4. **Vagues 7-8** (IA, notifications) — différenciation
5. **Vagues 9-13** (location, immobilier, cartes, abonnements, mobile) — expansion

Chaque vague inclut : migration SQL + RLS, hooks, routes, gates de rôle, tests, et une validation `tsc`/`eslint`/`build`.
