# Guide de déploiement — BâtiBénin

Application **TanStack Start** (SSR) buildée par **Vite** et empaquetée par **Nitro**. Le preset de build par défaut vise **Cloudflare** (config `nitro({ defaultPreset: "cloudflare-module" })` dans `vite.config.ts`, `NITRO_PRESET` restant prioritaire).

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
| `VITE_VAPID_PUBLIC_KEY`         | non         | Push web réel (clé publique VAPID, injectée au build)                              |

> ⚠️ Les variables `VITE_*` sont injectées **au build** (client) : définissez-les avant `npm run build`. Les autres (`SUPABASE_*` serveur, `LLM_*`) sont des **secrets runtime** : `wrangler secret put <NOM>` côté Cloudflare, jamais dans le build client.

## 3. Déploiement Cloudflare Workers (recommandé)

Le build produit un **Worker** (preset `cloudflare-module`) : `.output/server/` (dont `wrangler.json` généré) + `.output/public/` (assets). Ne **pas** déployer en Pages statique (SSR perdu).

### Via Wrangler

```sh
npm i -g wrangler
npm run build
# secrets runtime (serveur uniquement) :
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_PUBLISHABLE_KEY
# LLM_* et VAPID privée : idem si utilisées
# publier (depuis la racine, Nitro sait où est le prebuilt) :
npx nitro deploy --prebuilt
# ou directement :
wrangler deploy --config .output/server/wrangler.json
```

### Déploiement continu (dashboard Cloudflare)

1. Créez un projet **Workers** branché au repo.
2. Commande build : `npm ci && npm run build` ; les variables `VITE_*` vont dans les **variables de build**.
3. Secrets runtime (`SUPABASE_*`, `LLM_*`) dans **Settings → Variables → Secrets**.
4. `wrangler.json` est généré à chaque build dans `.output/server/` (nom auto `4bund4ntgr4c3-saas-mon-chantier-africa`, modifiable via `NITRO_*` ou un `wrangler.toml` racine).

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
