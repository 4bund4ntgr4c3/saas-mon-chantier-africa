/**
 * Jeu de données de démonstration en mémoire, utilisé par le mode invité
 * (aperçu sans compte). Aucune écriture ne part vers le backend.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type DemoRow = Record<string, any> & { id: string };

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `demo-${Math.random().toString(36).slice(2)}`;

const today = () => new Date();
const shift = (days: number) => {
  const d = today();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const DEMO_USER = "00000000-0000-0000-0000-0000000000de";

function seed() {
  const cats = [
    ["Terrassement", "terrassement", "Gros œuvre"],
    ["Fondation", "fondation", "Gros œuvre"],
    ["Élévation des murs", "elevation-murs", "Gros œuvre"],
    ["Dalle / Plancher", "dalle-plancher", "Gros œuvre"],
    ["Charpente & toiture", "charpente-toiture", "Gros œuvre"],
    ["Électricité", "electricite", "Second œuvre"],
    ["Plomberie", "plomberie", "Second œuvre"],
    ["Carrelage", "carrelage", "Finitions"],
    ["Peinture", "peinture", "Finitions"],
    ["Main d'œuvre", "main-doeuvre", "Divers"],
  ].map(([name, slug, phase], i) => ({
    id: uid(),
    user_id: null,
    name,
    slug,
    phase,
    sort_order: i,
    created_at: new Date().toISOString(),
  }));
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;

  const project: DemoRow = {
    id: uid(),
    user_id: DEMO_USER,
    name: "Villa Démo — Calavi",
    city: "Abomey-Calavi",
    commune: "Abomey-Calavi",
    arrondissement: "Godomey",
    quartier: "Togoudo",
    address: "Lot 452, Togoudo",
    land_area: 500,
    built_area: 180,
    house_type: "Villa basse 4 chambres",
    levels: 1,
    start_date: shift(-120),
    end_date: shift(150),
    budget: 42000000,
    status: "en_cours",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const suppliers: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Dépôt Sable & Gravier Togoudo",
      phone: "+229 97 12 45 78",
      whatsapp: "+229 97 12 45 78",
      email: null,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      activity: "Matériaux de construction",
      products: "Sable, gravier, latérite",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Quincaillerie La Référence",
      phone: "+229 96 55 30 11",
      whatsapp: "+229 96 55 30 11",
      email: null,
      city: "Cotonou",
      commune: "Cotonou",
      activity: "Quincaillerie",
      products: "Ciment, fer à béton, tôles, peinture",
    },
  ];
  const [sSable, sQuinc] = suppliers;

  const companies: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "ETS BATIR SOLIDE",
      manager: "Koffi Ahouandjinou",
      phone: "+229 95 44 22 10",
      email: "contact@batirsolide.bj",
      trade: "Maçonnerie & gros œuvre",
      contract_ref: "CTR-2026-001",
      contract_amount: 12500000,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "SARL VOLT PLUS",
      manager: "Rachidath Idrissou",
      phone: "+229 94 08 76 33",
      email: "volt.plus@mail.bj",
      trade: "Électricité & plomberie",
      contract_ref: "CTR-2026-002",
      contract_amount: 4200000,
    },
  ];
  const [cMac, cElec] = companies;

  const budgetPlan: Array<[string, number]> = [
    ["terrassement", 1200000],
    ["fondation", 6500000],
    ["elevation-murs", 8000000],
    ["dalle-plancher", 5500000],
    ["charpente-toiture", 4800000],
    ["electricite", 2200000],
    ["plomberie", 2000000],
    ["carrelage", 3200000],
    ["peinture", 1800000],
    ["main-doeuvre", 6800000],
  ];

  const budget_lines: DemoRow[] = budgetPlan.map(([slug, amount]) => ({
    id: uid(),
    user_id: DEMO_USER,
    project_id: project.id,
    category_id: cat(slug),
    planned_amount: amount,
  }));

  const mkExpense = (
    slug: string,
    supplier_id: string | null,
    company_id: string | null,
    days: number,
    label: string,
    city: string,
    amount: number,
    quantity: number,
    unit_price: number,
    method: string,
    reference: string,
    notes: string | null,
  ): DemoRow => ({
    id: uid(),
    user_id: DEMO_USER,
    project_id: project.id,
    category_id: cat(slug),
    supplier_id,
    company_id,
    expense_date: shift(days),
    label,
    city,
    commune: city,
    amount,
    quantity,
    unit_price,
    method,
    reference,
    notes,
  });

  const expenses: DemoRow[] = [
    mkExpense("terrassement", sSable!.id, null, -115, "Décapage et nivellement du terrain", "Abomey-Calavi", 950000, 1, 950000, "especes", "FAC-0001", "Location engin 2 jours"),
    mkExpense("fondation", sQuinc!.id, null, -98, "Ciment CIMBENIN 50 kg", "Cotonou", 2400000, 400, 6000, "mtn_momo", "FAC-0002", "Livraison incluse"),
    mkExpense("fondation", sSable!.id, null, -92, "Sable et gravier fondation", "Abomey-Calavi", 1350000, 15, 90000, "especes", "FAC-0003", "15 camions"),
    mkExpense("elevation-murs", null, cMac!.id, -60, "Élévation murs — tranche 1", "Abomey-Calavi", 4200000, 1, 4200000, "virement", "FAC-0004", "Situation n°1 maçonnerie"),
    mkExpense("dalle-plancher", sQuinc!.id, null, -34, "Fer à béton HA12 et HA8", "Cotonou", 3100000, 62, 50000, "virement", "FAC-0005", "Barres de 12 m"),
    mkExpense("main-doeuvre", null, cMac!.id, -27, "Main d'œuvre coffrage dalle", "Abomey-Calavi", 1450000, 1, 1450000, "especes", "FAC-0006", "9 ouvriers / 12 jours"),
    mkExpense("charpente-toiture", sQuinc!.id, null, -18, "Tôles bac alu 6/10", "Cotonou", 2250000, 90, 25000, "moov_money", "FAC-0007", "Coloris rouge"),
    mkExpense("electricite", null, cElec!.id, -12, "Pré-câblage électrique", "Abomey-Calavi", 1150000, 1, 1150000, "mtn_momo", "FAC-0008", "Gaines et boîtiers"),
    mkExpense("plomberie", null, cElec!.id, -8, "Réseau plomberie sanitaire", "Abomey-Calavi", 980000, 1, 980000, "virement", "FAC-0009", "PVC + PPR"),
    mkExpense("carrelage", sQuinc!.id, null, -3, "Carrelage 60x60 (acompte)", "Cotonou", 870000, 120, 7250, "especes", "FAC-0010", "Première livraison"),
  ];

  const payments: DemoRow[] = [
    [expenses[0]!.id, sSable!.id, null, -115, 950000, "comptant", "especes", "PAY-0001", "Réglé sur place"],
    [expenses[1]!.id, sQuinc!.id, null, -98, 1500000, "acompte", "mtn_momo", "PAY-0002", "Acompte 60 %"],
    [expenses[1]!.id, sQuinc!.id, null, -80, 900000, "solde", "mtn_momo", "PAY-0003", "Solde ciment"],
    [expenses[2]!.id, sSable!.id, null, -90, 1350000, "comptant", "especes", "PAY-0004", null],
    [expenses[3]!.id, null, cMac!.id, -58, 2500000, "acompte", "virement", "PAY-0005", "Situation n°1"],
    [expenses[3]!.id, null, cMac!.id, -40, 1700000, "solde", "virement", "PAY-0006", "Solde tranche 1"],
    [expenses[4]!.id, sQuinc!.id, null, -33, 3100000, "comptant", "virement", "PAY-0007", "Fer à béton"],
    [null, null, cElec!.id, -10, 1000000, "partiel", "mtn_momo", "PAY-0008", "Avance électricité"],
    [null, sQuinc!.id, null, -2, 500000, "acompte", "especes", "PAY-0009", "Acompte carrelage"],
  ].map((r) => {
    const [expense_id, supplier_id, company_id, days, amount, kind, method, reference, notes] =
      r as [string | null, string | null, string | null, number, number, string, string, string, string | null];
    return {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      expense_id,
      supplier_id,
      company_id,
      payment_date: shift(days),
      amount,
      kind,
      method,
      reference,
      notes,
    };
  });

  const quotes: DemoRow[] = [
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("charpente-toiture"),
      supplier_id: null, company_id: cMac!.id, reference: "DEV-0001",
      label: "Charpente bois + couverture tôles", amount: 4650000,
      quote_date: shift(-45), valid_until: shift(15), status: "accepte", notes: "Négocié à la baisse",
    },
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("peinture"),
      supplier_id: sQuinc!.id, company_id: null, reference: "DEV-0002",
      label: "Peinture intérieure et extérieure", amount: 1750000,
      quote_date: shift(-20), valid_until: shift(40), status: "en_attente", notes: "À comparer avec 2 autres offres",
    },
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("electricite"),
      supplier_id: null, company_id: cElec!.id, reference: "DEV-0003",
      label: "Installation électrique complète", amount: 2150000,
      quote_date: shift(-30), valid_until: shift(10), status: "converti", notes: "Devis transformé en facture",
    },
  ];

  const site_logs: DemoRow[] = [
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("fondation"),
      log_date: shift(-90), title: "Coulage des semelles", progress: 100, weather: "Ensoleillé",
      workers: 12, comment: "Semelles coulées sur l'ensemble de l'emprise.", difficulties: null, photos: [],
    },
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("elevation-murs"),
      log_date: shift(-55), title: "Montage des murs RDC", progress: 80, weather: "Nuageux",
      workers: 9, comment: "Élévation jusqu'au niveau chaînage.",
      difficulties: "Retard de livraison des agglos de 2 jours.", photos: [],
    },
    {
      id: uid(), user_id: DEMO_USER, project_id: project.id, category_id: cat("dalle-plancher"),
      log_date: shift(-20), title: "Ferraillage dalle de toiture", progress: 45, weather: "Pluie",
      workers: 14, comment: "Ferraillage en cours, coffrage terminé à 70 %.",
      difficulties: "Pluies fréquentes ralentissant le chantier.", photos: [],
    },
  ];

  return {
    categories: cats as unknown as DemoRow[],
    projects: [project],
    suppliers,
    companies,
    budget_lines,
    expenses,
    payments,
    quotes,
    site_logs,
    profiles: [
      { id: DEMO_USER, full_name: "Visiteur démo", phone: null, email: "demo@batibenin.bj" },
    ],
    demo_requests: [] as DemoRow[],
  };
}

export type DemoTables = ReturnType<typeof seed>;
export type DemoTableName = keyof DemoTables;

let db: DemoTables = seed();

export function demoRows<T = DemoRow>(table: DemoTableName): T[] {
  return (db[table] as unknown as T[]).map((r) => ({ ...(r as object) }) as T);
}

export function demoInsert(table: DemoTableName, values: Record<string, any>) {
  (db[table] as DemoRow[]).unshift({
    id: uid(),
    user_id: DEMO_USER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...values,
  });
}

export function demoUpdate(table: DemoTableName, id: string, values: Record<string, any>) {
  const rows = db[table] as DemoRow[];
  const i = rows.findIndex((r) => r.id === id);
  if (i >= 0) rows[i] = { ...rows[i]!, ...values, updated_at: new Date().toISOString() };
}

export function demoDelete(table: DemoTableName, id: string) {
  const rows = db[table] as DemoRow[];
  const i = rows.findIndex((r) => r.id === id);
  if (i >= 0) rows.splice(i, 1);
}

export function resetDemoData() {
  db = seed();
}
