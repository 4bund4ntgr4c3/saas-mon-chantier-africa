export type ChangelogItem = {
  icon: string | null;
  text: string;
  nested: boolean;
};

export type ChangelogSection = {
  heading: string | null;
  items: ChangelogItem[];
};

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  icon: string;
  sections: ChangelogSection[];
};

const ENTRY_RE = /^## (v\d+\.\d+) — (.+) \((\d{4}-\d{2}-\d{2})\)$/;
const ITEM_ICON_RE = /^(✅|🔧|🐛|🗑️|⚠️|🔒|ℹ️)\s+/;

/**
 * Parse `docs/CHANGELOG.md` (chargé en brut via `?raw`) en entrées affichables.
 * Les sections annexes (« Base de référence », « Règle de mise à jour ») sont ignorées.
 */
export function parseChangelog(source: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();
    const entryMatch = ENTRY_RE.exec(line);
    if (entryMatch) {
      current = {
        version: entryMatch[1] ?? "",
        title: entryMatch[2] ?? "",
        date: entryMatch[3] ?? "",
        icon: "✨",
        sections: [],
      };
      entries.push(current);
      continue;
    }
    if (line.startsWith("## ")) {
      current = null;
      continue;
    }
    if (!current) continue;

    if (line.startsWith("### ")) {
      current.sections.push({ heading: line.slice(4).trim(), items: [] });
      continue;
    }

    const itemMatch = /^(\s*)- (.*)$/.exec(line);
    if (!itemMatch) continue;
    const indent = itemMatch[1] ?? "";
    const body = (itemMatch[2] ?? "").trim();
    const marker = ITEM_ICON_RE.exec(body)?.[0] ?? "";
    const icon = marker.trim() || null;
    const text = marker ? body.slice(marker.length) : body;

    let section = current.sections[current.sections.length - 1];
    if (!section) {
      section = { heading: null, items: [] };
      current.sections.push(section);
    }
    section.items.push({ icon, text, nested: indent.length >= 2 });
  }

  for (const entry of entries) {
    const icons = entry.sections.flatMap((section) => section.items.map((item) => item.icon));
    entry.icon = icons.find((icon) => icon === "✅") ?? icons.find((icon) => icon !== null) ?? "✨";
  }
  return entries;
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** Date ISO « 2026-08-16 » → « 16 août 2026 », sans dépendre du fuseau horaire. */
export function formatChangelogDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS_FR[Number(match[2]) - 1] : undefined;
  if (!match || !month || Number.isNaN(Number(match[3]))) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}
