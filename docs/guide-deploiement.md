# Guide de déploiement — BâtiBénin

Application **TanStack Start** (SSR) buildée par **Vite** et empaquetée par **Nitro**. Le preset de build par défaut vise **Cloudflare** (config `@lovable.dev/vite-tanstack-config`).

## Vue d'ensemble

- **Frontend/SSR** : TanStack Start + Nitro → déployable sur Cloudflare Workers, Node ou Netlify.
- **Backend** : Supabase (Postgres + Auth + Storage), aucune API REST custom à héberger.
- **PWA** : `public/manifest.json` + `public/sw.js` (service worker cache-first) servis statiquement.

## 1. Build de production

```sh
npm ci
npm run build
```

Les artefacts sortent dans `.output/` (SSR) et `.output/public/` (assets statiques, manifest PWA, service worker).

Vérifiez la présence de `sw.js` et `manifest.json` dans `.output/public/` avant de déployer.

## 2. Variables d'environnement

Définissez côté serveur/hébergeur les mêmes variables que `.env` :

| Variable                        | Obligatoire | Usage                                                                                |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`             | oui         | Client (injectée au build)                                                           |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | oui         | Client                                                                               |
| `VITE_SUPABASE_PROJECT_ID`      | oui         | Client                                                                               |
| `SUPABASE_URL`                  | oui         | Serveur/nitro                                                                        |
| `SUPABASE_PUBLISHABLE_KEY`      | oui         | Serveur                                                                              |
| `LLM_API_KEY`                   | non         | Assistant IA générative (aucune clé = repli règles)                                  |
| `LLM_BASE_URL`                  | non         | Endpoint compatible OpenAI (défaut `https://api.openai.com/v1`, ex. Groq/OpenRouter) |
| `LLM_MODEL`                     | non         | Modèle (défaut `gpt-4o-mini`)                                                        |

## 3. Déploiement Cloudflare (recommandé)

### Via Wrangler

```sh
npm i -g wrangler
wrangler pages deploy .output/public --project-name <mon-chantier>
```

> Le preset nitro `cloudflare` génère déjà la configuration adaptée au build.

### Via le dashboard Cloudflare Pages

1. Créez un projet **Cloudflare Pages**.
2. Framework : **Static** (aucun), répertoire de sortie : `.output/public`.
3. Renseignez les variables d'environnement de l'étape 2.
4. Déployez (ou branchez le repo pour le déploiement continu).

## 4. Déploiement Node/Netlify

- **Node** : Nitro génère aussi une sortie serveur (`node-server`) ; servez avec votre PM2/container préféré.
- **Netlify** : commande build `npm run build`, répertoire de sortie `.output/public`.

## 5. Supabase en production

1. Appliquez les migrations (voir `docs/guide-installation.md`, étape 3).
2. Créez les buckets de stockage (`documents`).
3. Vérifiez que **RLS** est active sur toutes les tables.
4. Configurez les redirections Auth (Site URL / Redirect URLs) sur l'URL finale.

## 6. PWA en production

- Le manifest et le service worker sont servis depuis la racine (`/manifest.json`, `/sw.js`).
- Le service worker met en cache les assets du même origine (cache-first) et bascule sur `/` hors ligne.
- Changez la constante `CACHE` dans `public/sw.js` (`batibenin-v1`) à chaque release pour forcer l'invalidation.

## 7. Post-déploiement

- [ ] Migration appliquées (comptes, marketplace, chantier avancé).
- [ ] Bucket `documents` présent.
- [ ] Env variables serveur définies.
- [ ] Redirections Auth configurées.
- [ ] Test : création de compte, mode invité, commande marketplace, PWA installable.
- [ ] Promouvoir un utilisateur en admin (`user_roles` role = `admin`) pour accéder à `/admin`.
