# Règles du projet — BâtiBénin

## Mise à jour de la documentation (obligatoire avant chaque commit/push)

Toute livraison de fonctionnalité, de correctif ou de nettoyage DOIT mettre à jour les documents de référence, afin de conserver une spécification exacte et d'éviter de réimplémenter ou de dégrader une fonctionnalité existante :

1. `docs/CHANGELOG.md` — ajouter une entrée en haut (incrémenter `v0.x`, conventions `✅ 🔧 🐛 🗑️ ⚠️`).
2. `README.md` — refléter la stack, les scripts et la documentation courants.
3. `docs/STACK.md` — versions exactes, hooks, conventions, contraintes TypeScript, gates de rôles.
4. `docs/schema-bdd.md` — nouvelles tables/colonnes, diagramme ER.
5. `docs/roadmap.md` — état des vagues (✅/🔄/⬜), tests, livrables.

Ne jamais réécrire l'historique du changelog ni les entrées passées.

## Règles techniques non négociables

- `exactOptionalPropertyTypes: true` — une propriété optionnelle ne s'assigne pas `undefined`.
- Ne jamais éditer `routeTree.gen.ts` à la main (régénéré par `npm run build`).
- Workflow de validation après toute modification : `npm run build` → `npx tsc --noEmit` → `npx eslint .` → `npm run test`.
- Centraliser toutes les requêtes Supabase dans `src/lib/data.ts` (pas de SQL dans les pages).
- Ne pas réinventer les composants existants (`ProductCard`, `StatusBadge`, `QtyStepper`, `ProductDetailDialog`, `StoreAnalytics`, `ProjectMembersButton`…) — réutiliser depuis `src/components/**` ou les routes.
- Ne pas inventer de nouvelle valeur de `Feature` (`src/lib/roles.ts`) — ex. `marketplace`, `journal`, `documents`, `partage`.
- La documentation technique (stack, schéma, roadmap) vit dans `docs/`.
