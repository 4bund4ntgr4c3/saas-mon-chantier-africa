/**
 * Export comptable SYSCOHADA (OHADA) : transforme les dépenses d'un chantier
 * en écritures de journal équilibrées (débit compte de charges 6x / crédit 401
 * Fournisseurs), prêtes à saisir dans un logiciel comptable (Sage, SAARI…).
 *
 * ⚠️ Le mapping par mots-clés est indicatif : le comptable valide les comptes.
 */

export type OhadaAccount = { account: string; label: string };

/** Règles ordonnées : la première correspondance (insensible à la casse) gagne. */
const OHADA_RULES: { keywords: string[]; account: OhadaAccount }[] = [
  {
    keywords: [
      "salaire",
      "ouvrier",
      "journalier",
      "main d'oeuvre",
      "main-d'oeuvre",
      "personnel",
      "paie",
      "pointage",
    ],
    account: { account: "661", label: "Charges de personnel" },
  },
  {
    keywords: ["sous-traitance", "sous traitance", "entreprise", "artisan", "prestataire"],
    account: { account: "621", label: "Sous-traitance générale" },
  },
  {
    keywords: [
      "architecte",
      "honoraires",
      "étude",
      "etude",
      "géomètre",
      "geometre",
      "topographe",
      "bureau d'etudes",
      "conception",
    ],
    account: { account: "626", label: "Études, recherches et documentation" },
  },
  {
    keywords: ["transport", "livraison", "convoi", "camion", "logistique"],
    account: { account: "61", label: "Transports" },
  },
  {
    keywords: [
      "location",
      "loue",
      "location materiel",
      "bétonnière",
      "betonniere",
      "échafaudage",
      "echafaudage",
      "engin",
    ],
    account: { account: "622", label: "Locations et charges locatives" },
  },
  {
    keywords: ["entretien", "réparation", "reparation", "maintenance", "dépannage", "depannage"],
    account: { account: "624", label: "Entretien, réparations et maintenance" },
  },
  {
    keywords: ["assurance", "décennale", "decennale", "garantie"],
    account: { account: "625", label: "Primes d'assurance" },
  },
  {
    keywords: ["téléphone", "telephone", "internet", "télécom", "telecom", "communication"],
    account: { account: "628", label: "Frais de télécommunications" },
  },
  {
    keywords: [
      "banque",
      "frais bancaires",
      "intérêt",
      "interet",
      "découvert",
      "decouvert",
      "escompte",
    ],
    account: { account: "631", label: "Frais bancaires et assimilés" },
  },
  {
    keywords: ["impôt", "impot", "taxe", "patente", "permis", "autorisation", "foncier", "cnps"],
    account: { account: "64", label: "Impôts et taxes" },
  },
  {
    keywords: [
      "électricité",
      "electricite",
      "eau",
      "forage",
      "carburant",
      "gasoil",
      "énergie",
      "energie",
      "groupe électrogène",
      "groupe electrogene",
    ],
    account: { account: "605", label: "Autres achats (énergie, eau)" },
  },
  {
    keywords: [
      "ciment",
      "fer",
      "acier",
      "sable",
      "gravier",
      "agglo",
      "brique",
      "bloc",
      "carrelage",
      "faience",
      "faïence",
      "tôle",
      "tole",
      "toiture",
      "charpente",
      "bois",
      "peinture",
      "plomberie",
      "sanitaire",
      "menuiserie",
      "plâtre",
      "platre",
      "étanchéité",
      "etancheite",
      "isolation",
      "électricite materiau",
      "câble",
      "cable",
      "matériau",
      "materiau",
      "quincaillerie",
      "coffrage",
      "armature",
    ],
    account: { account: "602", label: "Achats de matières premières et fournitures liées" },
  },
  {
    keywords: ["marchandise", "revende", "achat revente"],
    account: { account: "601", label: "Achats de marchandises" },
  },
];

const OHADA_FALLBACK: OhadaAccount = { account: "658", label: "Autres charges" };

/** Découpe en mots (sans accents ni ponctuation) pour un matching whole-word. */
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Résout le compte SYSCOHADA d'une dépense depuis sa catégorie et son libellé. */
export function ohadaAccountFor(...hints: (string | null | undefined)[]): OhadaAccount {
  const haystack = tokens(hints.filter((h): h is string => !!h).join(" "));
  for (const rule of OHADA_RULES) {
    if (
      rule.keywords.some((k) => {
        const parts = tokens(k);
        return parts.length > 0 && parts.every((p) => haystack.includes(p));
      })
    ) {
      return rule.account;
    }
  }
  return OHADA_FALLBACK;
}

export type OhadaExpenseRow = {
  id: string;
  label: string;
  amount: number | string;
  expense_date: string | null;
  categoryName?: string | null;
  supplierName?: string | null;
};

export type OhadaEntry = {
  date: string;
  journal: string;
  piece: string;
  account: string;
  accountLabel: string;
  libelle: string;
  debit: number;
  credit: number;
};

/** Écritures équilibrées : une charge (débit 6x) + son contrepartie (crédit 401). */
export function buildOhadaJournal(expenses: readonly OhadaExpenseRow[]): {
  entries: OhadaEntry[];
  total: number;
} {
  const entries: OhadaEntry[] = [];
  let total = 0;
  expenses.forEach((e, i) => {
    const amount = Number(e.amount);
    if (!Number.isFinite(amount) || amount === 0) return;
    const { account, label } = ohadaAccountFor(e.categoryName, e.label);
    const piece = `DP-${String(i + 1).padStart(4, "0")}`;
    const date = e.expense_date ?? "";
    const libelle = [e.label, e.supplierName].filter(Boolean).join(" — ");
    entries.push({
      date,
      journal: "AC",
      piece,
      account,
      accountLabel: label,
      libelle,
      debit: amount,
      credit: 0,
    });
    entries.push({
      date,
      journal: "AC",
      piece,
      account: "401",
      accountLabel: "Fournisseurs",
      libelle: libelle,
      debit: 0,
      credit: amount,
    });
    total += amount;
  });
  return { entries, total };
}

/** Agrège les montants par compte de charges (feuille de synthèse). */
export function ohadaAccountSummary(
  expenses: readonly OhadaExpenseRow[],
): { account: string; label: string; total: number }[] {
  const map = new Map<string, { account: string; label: string; total: number }>();
  expenses.forEach((e) => {
    const amount = Number(e.amount);
    if (!Number.isFinite(amount) || amount === 0) return;
    const { account, label } = ohadaAccountFor(e.categoryName, e.label);
    const key = account;
    const prev = map.get(key);
    map.set(key, {
      account,
      label,
      total: (prev?.total ?? 0) + amount,
    });
  });
  return [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
}

/** Export Excel (2 feuilles : écritures + synthèse par compte). */
export async function exportOhadaExcel(params: {
  projectName: string;
  expenses: readonly OhadaExpenseRow[];
}) {
  const XLSX = await import("xlsx");
  const { entries, total } = buildOhadaJournal(params.expenses);
  const summary = ohadaAccountSummary(params.expenses);

  const journalAoa: (string | number)[][] = [
    ["Écritures comptables SYSCOHADA — chantier " + params.projectName],
    ["Comptes indicatifs, à valider par votre comptable"],
    [],
    ["Date", "Journal", "Pièce", "Compte", "Intitulé du compte", "Libellé", "Débit", "Crédit"],
    ...entries.map((e) => [
      e.date,
      e.journal,
      e.piece,
      e.account,
      e.accountLabel,
      e.libelle,
      e.debit,
      e.credit,
    ]),
    ["", "", "", "", "TOTAUX", "", total, total],
  ];
  const summaryAoa: (string | number)[][] = [
    ["Synthèse par compte SYSCOHADA"],
    [],
    ["Compte", "Intitulé", "Total FCFA"],
    ...summary.map((s) => [s.account, s.label, s.total]),
    ["", "TOTAL", summary.reduce((s, r) => s + r.total, 0)],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(journalAoa), "Écritures");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryAoa), "Synthèse comptes");

  const stamp = new Date().toISOString().slice(0, 10);
  const slug = params.projectName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  XLSX.writeFile(wb, `comptable-syscohada-${slug}-${stamp}.xlsx`);
}
