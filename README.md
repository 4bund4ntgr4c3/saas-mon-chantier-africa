# Remix of Remix of Chantier Budget

Agis comme un architecte logiciel senior, un UX/UI designer et un développeur Full Stack.

Conçois une application web moderne et responsive de gestion de projet et de suivi des dépenses pour la construction d'une maison au Bénin.

## Objectif

L'application doit permettre à un particulier, un maître d'œuvre ou une entreprise de suivre l'ensemble des coûts de construction d'une maison au Bénin, depuis l'achat du terrain jusqu'à la remise des clés.

La devise utilisée est le Franc CFA (XOF).

L'application doit permettre de comparer le budget prévisionnel avec les dépenses réelles et d'anticiper les dépassements.

## Fonctionnalités principales

### Tableau de bord

Afficher en temps réel :

- Budget global

- Dépenses totales

- Budget restant

- Coût par m²

- Pourcentage d'avancement financier

- Nombre de fournisseurs

- Nombre de factures

- Nombre de paiements

- Graphiques des dépenses

- Évolution mensuelle des dépenses

### Gestion des projets

Un utilisateur peut gérer plusieurs projets de construction.

Chaque projet comprend :

- Nom du projet

- Localisation (Ville, Commune, Arrondissement, Quartier)

- Adresse

- Surface du terrain

- Surface construite

- Type de maison

- Nombre de niveaux

- Date de début

- Date prévisionnelle de fin

- Budget global

### Catégories de dépenses adaptées au Bénin

Créer les catégories suivantes :

- Achat du terrain

- Frais de notaire

- Géomètre

- Permis de construire

- Plans architecturaux

- Terrassement

- Fondation

- Béton

- Fer à béton

- Ciment

- Sable

- Gravier

- Parpaings

- Maçonnerie

- Charpente

- Toiture

- Menuiserie aluminium

- Menuiserie bois

- Électricité

- Plomberie

- Carrelage

- Peinture

- Plafond

- Cuisine

- Salle de bain

- Climatisation

- Clôture

- Forage

- Château d'eau

- Main-d'œuvre

- Transport

- Divers

- Imprévus

### Gestion des dépenses

Chaque dépense possède :

- Date

- Libellé

- Catégorie

- Fournisseur

- Entreprise

- Commune

- Ville

- Montant en FCFA

- Quantité

- Prix unitaire

- Moyen de paiement (Espèces, Mobile Money, Virement bancaire, Chèque)

- Référence du paiement

- Photo de la facture

- Pièce jointe PDF

- Observations

### Gestion des fournisseurs

Créer une base de données des fournisseurs :

- Nom

- Téléphone

- WhatsApp

- Email

- Ville

- Commune

- Activité

- Produits vendus

- Historique des achats

### Gestion des entreprises

- Entreprise

- Responsable

- Téléphone

- Email

- Corps de métier

- Contrat

- Historique des paiements

### Gestion des devis

- Plusieurs devis par fournisseur

- Comparaison automatique

- Choix du meilleur devis

- Conversion en commande

- Suivi des acomptes

### Gestion des paiements

Prendre en charge :

- Paiement comptant

- Paiement partiel

- Acompte

- Solde

Moyens de paiement :

- MTN Mobile Money

- Moov Money

- Banque

- Espèces

### Gestion des documents

Stocker :

- Plans

- Permis de construire

- Factures

- Contrats

- Garanties

- Photos du chantier

### Journal de chantier

Créer un historique contenant :

- Date

- Photos

- Commentaires

- Avancement

- Difficultés rencontrées

### Alertes

Notifier lorsque :

- Le budget d'un poste dépasse 80 %

- Une facture arrive à échéance

- Un paiement est en retard

- Un document est manquant

### Rapports

Produire automatiquement :

- Dépenses par mois

- Dépenses par catégorie

- Dépenses par fournisseur

- Dépenses par commune

- Dépenses par entreprise

- Budget prévu vs réalisé

- Coût moyen au m²

- Export PDF et Excel

### Recherche

Permettre une recherche rapide par :

- Fournisseur

- Catégorie

- Date

- Ville

- Commune

- Chantier

### Technologies

Frontend :

- React

- Next.js

- TypeScript

- Tailwind CSS

- shadcn/ui

Backend :

- Laravel 12 (API REST)

Base de données :

- PostgreSQL

Authentification :

- Laravel Sanctum

Stockage :

- Local ou Amazon S3

### Qualité

Le projet doit être prêt pour la production, sécurisé, évolutif, documenté et respecter les bonnes pratiques (SOLID, architecture en couches, API REST).

### Livrables attendus

- Architecture complète du projet

- Schéma de base de données

- Diagramme UML

- Migrations

- API REST documentée

- Interfaces utilisateur modernes

- Tableau de bord interactif

- Tests unitaires

- Guide d'installation

- Guide de déploiement

L'application doit être conçue pour répondre aux réalités du secteur de la construction au Bénin, avec une interface simple, intuitive et adaptée aux particuliers, maîtres d'œuvre, entreprises de BTP et promoteurs immobiliers.

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
