# Guide d'installation — BâtiBénin

## Prérequis

- **Node.js ≥ 20** (recommandé via [nvm](https://github.com/nvm-sh/nvm)).
- **npm ≥ 10**.
- Un compte **Supabase** (projet cloud) pour le backend.

## 1. Cloner le dépôt

```sh
git clone <this-repository-url>
cd saas-mon-chantier
npm i
```

## 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) et récupérez :
   - `Project URL` (ex. `https://xxxx.supabase.co`)
   - `Project ID`
   - `publishable key` (onglet API)
2. Copiez `.env` :

```sh
cp .env.example .env
```

3. Renseignez `.env` :

```env
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=<votre-projet-id>
SUPABASE_URL=https://<votre-projet>.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=<votre-projet-id>
```

> Les clefs `SUPABASE_*` (sans préfixe `VITE_`) sont utilisées côté serveur/nitro.

## 3. Appliquer les migrations

### Option A — CLI Supabase

```sh
supabase link --project-ref <votre-projet-id>
supabase db push
```

### Option B — Dashboard

Pour chaque fichier de `supabase/migrations/` (dans l'ordre de nommage) :
1. Ouvrez **SQL Editor** dans le dashboard.
2. Collez le contenu du fichier.
3. Exécutez.

Ordre requis :
1. `20260807213051_1ab95d08-….sql` — enums de base
2. `20260807213112_….sql`
3. `20260808073702_….sql` — audit
4. `20260808100000_….sql` — documents
5. `20260809000000_….sql` — stockage démo
6. `20260810000000_….sql` — notifications e-mail
7. `20260811000000_….sql` — facturation, matériaux, photos, tâches
8. `20260813000000_….sql` — prestataires
9. `20260814000000_….sql` — marketplace e-commerce
10. `20260814000001_….sql` — réserves, plans, messages
11. `20260814000002_….sql` — rôles étendus
12. `20260815000000_….sql` — collaboration (organizations, project_members) — Vague 1
13. `20260816000000_….sql` — e-commerce avancé (product_prices, product_inventory) — Vague 2
14. `20260817000000_….sql` — matériaux & inventaire (material_requirements, material_deliveries) — Vague 3

> Il faut aussi créer les **buckets de stockage** (`documents`) si ce n'est pas déjà couvert par les migrations.

## 4. Lancer en développement

```sh
npm run dev
```

Ouvrez `http://localhost:3000`. Le mode invité (aperçu sans compte) est disponible depuis la page d'accueil.

## 5. Scripts utiles

| Commande | Action |
| --- | --- |
| `npm run dev` | Serveur de dev |
| `npm run build` | Build de production (client + SSR + nitro) |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires Vitest |
| `npm run test:watch` | Tests en mode watch |

## Dépannage

- **« Table does not exist »** : les migrations n'ont pas été appliquées (étape 3).
- **Erreur de routes après ajout** : `npm run build` régénère `routeTree.gen.ts` via le plugin TanStack Router ; lancez le build puis tsc.
- **Mode invité vide** : les données de démo sont remises à zéro à chaque entrée/sortie de l'aperçu (`resetDemoData`).
