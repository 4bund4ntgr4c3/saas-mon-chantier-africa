import { describe, expect, it } from "vitest";
import { formatChangelogDate, parseChangelog } from "./changelog";

const SOURCE = `# Changelog — démo

Conventions : ✅ ajouté · 🔧 amélioré.

## v0.2 — Deuxième livraison (2026-08-02)

- ✅ Première fonctionnalité ajoutée.
- 🔧 Amélioration **de la page** \`code\`.

### Migration

- \`supabase/migrations/demo.sql\`
  - ✅ Colonne \`stores.delivery_radius_km\` ajoutée.

## v0.1 — Fondations (2026-08-01)

- ✅ Socle initial.

## Base de référence

- **Premier commit** : \`633ac1d\`
`;

describe("parseChangelog", () => {
  it("parse les versions, titres et dates dans l'ordre du document", () => {
    const entries = parseChangelog(SOURCE);
    expect(entries.map((entry) => entry.version)).toEqual(["v0.2", "v0.1"]);
    expect(entries[0]?.title).toBe("Deuxième livraison");
    expect(entries[0]?.date).toBe("2026-08-02");
  });

  it("extrait l'icône de convention en marqueur et conserve le texte inline", () => {
    const items = parseChangelog(SOURCE)[0]?.sections.flatMap((section) => section.items) ?? [];
    expect(items[0]?.icon).toBe("✅");
    expect(items[0]?.text).toBe("Première fonctionnalité ajoutée.");
    expect(items[1]?.text).toBe("Amélioration **de la page** `code`.");
    expect(items.find((item) => !item.icon)?.icon).toBeNull();
  });

  it("gère les sous-sections ### et les puces imbriquées", () => {
    const entry = parseChangelog(SOURCE)[0];
    expect(entry?.sections.map((section) => section.heading)).toEqual([null, "Migration"]);
    const nested = entry?.sections[1]?.items.find((item) => item.nested);
    expect(nested?.text).toBe("Colonne `stores.delivery_radius_km` ajoutée.");
    expect(nested?.icon).toBe("✅");
  });

  it("ignore les sections annexes après les versions", () => {
    const lastEntry = parseChangelog(SOURCE)[1];
    const items = lastEntry?.sections.flatMap((section) => section.items) ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toBe("Socle initial.");
  });

  it("dérive l'icône d'entrée : premier ✅, sinon première icône, sinon ✨", () => {
    const entries = parseChangelog(SOURCE);
    expect(entries[0]?.icon).toBe("✅");
    expect(entries[1]?.icon).toBe("✅");
    expect(parseChangelog("## v0.3 — Sans icônes (2026-08-03)\n\n- Simple puce.\n")[0]?.icon).toBe(
      "✨",
    );
  });
});

describe("formatChangelogDate", () => {
  it("formate une date ISO en français", () => {
    expect(formatChangelogDate("2026-08-16")).toBe("16 août 2026");
    expect(formatChangelogDate("2026-01-05")).toBe("5 janvier 2026");
    expect(formatChangelogDate("2026-12-31")).toBe("31 décembre 2026");
  });

  it("restitue tel quel ce qui n'est pas une date ISO", () => {
    expect(formatChangelogDate("trimestre 3")).toBe("trimestre 3");
    expect(formatChangelogDate("")).toBe("");
  });
});
