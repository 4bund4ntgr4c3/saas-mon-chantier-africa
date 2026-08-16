# BâtiBénin — Plateforme africaine de construction

Application web moderne et responsive de gestion de chantier et de suivi des dépenses pour la construction au Bénin et en Afrique de l'Ouest : gestion de projets, budget prévisionnel vs réel, fournisseurs, devis, paiements, facturation, matériaux, marketplace e-commerce, prestataires, collaboration multi-acteurs et comparaison de prix.

> **Documentation de référence** : consultez [docs/STACK.md](docs/STACK.md) (stack, scripts, conventions) et [docs/CHANGELOG.md](docs/CHANGELOG.md) (toutes les évolutions depuis la v1) avant toute modification, pour ne pas réimplémenter ou dégrader une fonctionnalité existante.

## Objectif

Permettre à un particulier, un maître d'œuvre ou une entreprise de suivre l'ensemble des coûts de construction d'une maison, depuis l'achat du terrain jusqu'à la remise des clés, et de comparer le budget prévisionnel avec les dépenses réelles pour anticiper les dépassements.

## Stack technique

| Couche        | Technologie                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| Framework     | TanStack Start + TanStack Router (fichiers)                                          |
| UI            | React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix)                          |
| Données       | TanStack Query + Supabase (PostgreSQL, Auth, Storage, Edge Functions)                |
| Exports       | PDF (jspdf) · Excel (xlsx)                                                           |
| Cartes        | Leaflet (`react-leaflet` v5) — multi-fournisseurs (OSM / Esri / CARTO)               |
| Notifications | Resend (e-mail) + notifications persistées multi-canal (in-app, push, SMS, WhatsApp) |
| Tests         | Vitest + jsdom                                                                       |
| Déploiement   | Vercel / Cloudflare Workers (Nitro)                                                  |

Voir [docs/STACK.md](docs/STACK.md) pour les versions exactes et les conventions.

## Fonctionnalités principales

### Suivi de chantier

- Tableau de bord : budget global, dépenses, restant, coût au m², avancement, graphiques, évolution mensuelle
- Projets multi-chantiers, catégories de dépenses adaptées au Bénin
- Dépenses (FCFA, quantité, prix unitaire, moyen de paiement, photo/PDF, observations), fournisseurs, entreprises, devis avec comparaison, paiements (comptant, partiel, acompte, solde), facturation, stock de matériaux, matériaux chantier (besoins, commandes, livraisons), tâches & planning, photos, journal de chantier, réserves, plans, documents, messages

### Alertes & notifications

- Alertes métier (budget dépassant 80 %, échéances, paiements en retard, documents manquants), notifications e-mail (quotidiennes + digest hebdomadaire), préférences dans Paramètres
- Notifications persistées multi-canal (in-app dans la cloche, push navigateur, SMS/WhatsApp configurables) : commandes, paiements, livraisons — page « Mes notifications » avec historique et filtres, canaux préférentiels dans Paramètres, appareils web enregistrés pour le push

### Rapports & recherche

- Rapports par mois/catégorie/fournisseur/commune/entreprise, budget prévu vs réalisé, coût moyen au m², exports PDF et Excel, recherche globale

### Marketplace

- **Prestataires BTP** : annuaire par domaine (13 domaines) + avis
- **E-commerce** : boutiques, catalogue de matériaux, panier, commandes, livraison, transporteurs
- **Comparateur de prix** : fiche produit enrichie, offres concurrentes, distance « près de moi », économies
- **Géolocalisation** : carte des boutiques (Leaflet multi-fournisseurs), recherche « près de moi » avec rayon de livraison, badge distance sur les produits ; carte des chantiers et des prestataires (`PointsMap`), recherche « près de moi » dans l'annuaire prestataires, suivi de livraison sur carte avec position temps réel du transporteur
- **Portail vendeur** : boutique, produits, commandes reçues, analytics (CA, panier moyen, meilleures ventes), suivi stock/prix, rayon de livraison

### Collaboration & multi-tenant

- Invitation de membres par e-mail sur un chantier (rôles owner/editor/viewer), cloche d'invitations, organisations

### Matériaux chantier

- Besoins en matériaux par chantier : quantités prévues / commandées / livrées / consommées / restantes, montant estimé, barre de progression
- Enregistrement des livraisons avec mise à jour automatique du besoin, historique des livraisons, clôture des besoins livrés

### Paiement mobile money (sandbox)

- Transactions mobile money : MTN MoMo, Moov Money & passerelles (PayDunya, Bankly, CMI, Paystack)
- Initier → confirmer/annuler un paiement, confirmation simulée du retour passerelle, création automatique du paiement comptable, badge de statut par transaction
- Lien de paiement public `/paiement/$reference` partageable (WhatsApp), paiement à la livraison

### Devis & factures

- Devis dépliables avec lignes de détail (postes, quantités, unités, prix), total automatique
- Détail des postes sur chaque facture

### Demande de devis en ligne

- Publiez un besoin (domaine, budget, localisation, échéance) et recevez des offres chiffrées de prestataires
- Répondez aux demandes ouvertes et comparez ; attribuez l'offre retenue

### Litiges & médiation

- Ouvrez un litige (commande, devis, paiement, livraison, facturation), déposez vos preuves
- Suivez la décision de médiation et le remboursement associé

### Confiance & vérification

- Soumettez vos documents (identité, RCCM, patente, CNPS, quittance…) depuis les paramètres ; suivez leur statut
- Back-office admin de validation : approuvez/rejetez les documents et faites évoluer le niveau de confiance des profils
- Avis étendus sur les vendeurs, produits et transporteurs, avec badge « Achat vérifié » et anti-faux avis (un avis par utilisateur et par cible)

### Location de matériel

- Catalogue de matériel à louer (prix par jour/semaine, caution, état, ville) avec recherche et filtre par catégorie
- Demande de location avec période et livraison ; blocage des chevauchements de période, le propriétaire confirme la disponibilité
- Suivi du retour : QR code de remise (code à 6 caractères) affiché au client, le propriétaire valide le code pour clôturer la location
- Paiement de la caution et du loyer intégral (hors caution) par mobile money (MTN MoMo / Moov Money)
- Mon parc de matériel : ajout, modification, statut (disponible/loué/hors service)

### Immobilier promoteurs

- Programmes immobiliers décomposés en immeubles puis en lots/appartements (type, étage, surface, pièces, prix, statut)
- Plans d'étage interactifs : lots colorés par statut, fiche lot, planification de visite par WhatsApp (`FloorPlanViewer`)
- Budget / objectif de ventes par programme avec barre d'avancement (vendus / réservés / disponibles + montant encaissé)
- Dossiers clients : réservation, confirmation (lot réservé), vente (lot vendu), annulation, paiement de l'acompte par mobile money

### IA — Assistant conversationnel

- Assistant par rôle (« Parler au chantier ») : dictée vocale (Web Speech), questions en français, réponses à base de règles sur vos données réelles
- IA Achats : besoins matériaux restants, meilleure offre par produit parmi toutes les boutiques (comparaison multi-boutiques), calcul des quantités au multiple de la commande minimale, estimation du plan d'achat et économie vs prix de référence, ajout au panier
- Recommandations marketplace (meilleures notes et meilleurs prix par boutique), alertes budget et planning, fils de discussion et actions persistés
- IA fournisseur (rôle quincaillerie) : prévision de stock sur 30 jours (vélocité, jours de couverture, réappro suggéré), panel dédié et intention « stock / réappro »
- Descriptions IA de produits : générateur à base de règles intégré au formulaire « Ma boutique »

### Expérience

- PWA installable, i18n FR/EN (navigation), multi-pays/devise (FCFA/XOF, XAF, CDF), mode invité démo, tour guidé, conseiller IA à base de règles, page publique « Nouveautés » (changelog)

## Technologies (détail)

Frontend : React · TanStack Start · TypeScript · Tailwind CSS · shadcn/ui
Backend : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
Authentification : Supabase Auth (+ mode invité démo)
Stockage : Supabase Storage (buckets `documents`, `photos`)

## Qualité

Projet prêt pour la production : RLS activée, journal d'audit, types générés, tests unitaires, eslint/prettier, build SSR Nitro. Livrables : schéma de BDD, guide d'installation, guide de déploiement, changelog, roadmap par vagues.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/89f09aed-5680-4b1f-bf42-a5bd00ee953e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Scripts

```sh
npm run dev        # serveur de développement
npm run build      # build production (régénère routeTree.gen.ts)
npm run lint       # eslint .
npm run format     # prettier --write .
npm run test       # vitest run
```

## Documentation

- [Changelog (toutes les évolutions)](docs/CHANGELOG.md)
- [Stack & spécifications](docs/STACK.md)
- [Roadmap par vagues](docs/roadmap.md)
- [Schéma de base de données & diagramme](docs/schema-bdd.md)
- [Guide d'installation](docs/guide-installation.md)
- [Guide de déploiement](docs/guide-deploiement.md)
