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
export { DEMO_USER };

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
    mkExpense(
      "terrassement",
      sSable!.id,
      null,
      -115,
      "Décapage et nivellement du terrain",
      "Abomey-Calavi",
      950000,
      1,
      950000,
      "especes",
      "FAC-0001",
      "Location engin 2 jours",
    ),
    mkExpense(
      "fondation",
      sQuinc!.id,
      null,
      -98,
      "Ciment CIMBENIN 50 kg",
      "Cotonou",
      2400000,
      400,
      6000,
      "mtn_momo",
      "FAC-0002",
      "Livraison incluse",
    ),
    mkExpense(
      "fondation",
      sSable!.id,
      null,
      -92,
      "Sable et gravier fondation",
      "Abomey-Calavi",
      1350000,
      15,
      90000,
      "especes",
      "FAC-0003",
      "15 camions",
    ),
    mkExpense(
      "elevation-murs",
      null,
      cMac!.id,
      -60,
      "Élévation murs — tranche 1",
      "Abomey-Calavi",
      4200000,
      1,
      4200000,
      "virement",
      "FAC-0004",
      "Situation n°1 maçonnerie",
    ),
    mkExpense(
      "dalle-plancher",
      sQuinc!.id,
      null,
      -34,
      "Fer à béton HA12 et HA8",
      "Cotonou",
      3100000,
      62,
      50000,
      "virement",
      "FAC-0005",
      "Barres de 12 m",
    ),
    mkExpense(
      "main-doeuvre",
      null,
      cMac!.id,
      -27,
      "Main d'œuvre coffrage dalle",
      "Abomey-Calavi",
      1450000,
      1,
      1450000,
      "especes",
      "FAC-0006",
      "9 ouvriers / 12 jours",
    ),
    mkExpense(
      "charpente-toiture",
      sQuinc!.id,
      null,
      -18,
      "Tôles bac alu 6/10",
      "Cotonou",
      2250000,
      90,
      25000,
      "moov_money",
      "FAC-0007",
      "Coloris rouge",
    ),
    mkExpense(
      "electricite",
      null,
      cElec!.id,
      -12,
      "Pré-câblage électrique",
      "Abomey-Calavi",
      1150000,
      1,
      1150000,
      "mtn_momo",
      "FAC-0008",
      "Gaines et boîtiers",
    ),
    mkExpense(
      "plomberie",
      null,
      cElec!.id,
      -8,
      "Réseau plomberie sanitaire",
      "Abomey-Calavi",
      980000,
      1,
      980000,
      "virement",
      "FAC-0009",
      "PVC + PPR",
    ),
    mkExpense(
      "carrelage",
      sQuinc!.id,
      null,
      -3,
      "Carrelage 60x60 (acompte)",
      "Cotonou",
      870000,
      120,
      7250,
      "especes",
      "FAC-0010",
      "Première livraison",
    ),
  ];

  const payments: DemoRow[] = [
    [
      expenses[0]!.id,
      sSable!.id,
      null,
      -115,
      950000,
      "comptant",
      "especes",
      "PAY-0001",
      "Réglé sur place",
    ],
    [
      expenses[1]!.id,
      sQuinc!.id,
      null,
      -98,
      1500000,
      "acompte",
      "mtn_momo",
      "PAY-0002",
      "Acompte 60 %",
    ],
    [
      expenses[1]!.id,
      sQuinc!.id,
      null,
      -80,
      900000,
      "solde",
      "mtn_momo",
      "PAY-0003",
      "Solde ciment",
    ],
    [expenses[2]!.id, sSable!.id, null, -90, 1350000, "comptant", "especes", "PAY-0004", null],
    [
      expenses[3]!.id,
      null,
      cMac!.id,
      -58,
      2500000,
      "acompte",
      "virement",
      "PAY-0005",
      "Situation n°1",
    ],
    [
      expenses[3]!.id,
      null,
      cMac!.id,
      -40,
      1700000,
      "solde",
      "virement",
      "PAY-0006",
      "Solde tranche 1",
    ],
    [
      expenses[4]!.id,
      sQuinc!.id,
      null,
      -33,
      3100000,
      "comptant",
      "virement",
      "PAY-0007",
      "Fer à béton",
    ],
    [null, null, cElec!.id, -10, 1000000, "partiel", "mtn_momo", "PAY-0008", "Avance électricité"],
    [null, sQuinc!.id, null, -2, 500000, "acompte", "especes", "PAY-0009", "Acompte carrelage"],
  ].map((r) => {
    const [expense_id, supplier_id, company_id, days, amount, kind, method, reference, notes] =
      r as [
        string | null,
        string | null,
        string | null,
        number,
        number,
        string,
        string,
        string,
        string | null,
      ];
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

  const payment_transactions: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      order_id: null,
      provider: "mtn_momo",
      amount: 1500000,
      currency: "XOF",
      phone: "+229 97 00 11 22",
      status: "confirmee",
      reference: "MM-AC11F2",
      transaction_id: "MTN-88213",
      raw_response: null,
      created_at: shift(-98),
      updated_at: shift(-98),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      order_id: null,
      provider: "moov_money",
      amount: 900000,
      currency: "XOF",
      phone: "+229 97 00 11 22",
      status: "confirmee",
      reference: "MM-B904A1",
      transaction_id: "MOOV-19644",
      raw_response: null,
      created_at: shift(-80),
      updated_at: shift(-80),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      order_id: null,
      provider: "mtn_momo",
      amount: 500000,
      currency: "XOF",
      phone: "+229 97 00 11 22",
      status: "echouee",
      reference: "MM-C7703B",
      transaction_id: null,
      raw_response: { reason: "solde_insuffisant" },
      created_at: shift(-2),
      updated_at: shift(-2),
    },
  ];

  const quotes: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("charpente-toiture"),
      supplier_id: null,
      company_id: cMac!.id,
      reference: "DEV-0001",
      label: "Charpente bois + couverture tôles",
      amount: 4650000,
      quote_date: shift(-45),
      valid_until: shift(15),
      status: "accepte",
      notes: "Négocié à la baisse",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("peinture"),
      supplier_id: sQuinc!.id,
      company_id: null,
      reference: "DEV-0002",
      label: "Peinture intérieure et extérieure",
      amount: 1750000,
      quote_date: shift(-20),
      valid_until: shift(40),
      status: "en_attente",
      notes: "À comparer avec 2 autres offres",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("electricite"),
      supplier_id: null,
      company_id: cElec!.id,
      reference: "DEV-0003",
      label: "Installation électrique complète",
      amount: 2150000,
      quote_date: shift(-30),
      valid_until: shift(10),
      status: "converti",
      notes: "Devis transformé en facture",
    },
  ];
  const [quoteCharpente, quotePeinture, quoteElec] = quotes;

  const quote_items: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      quote_id: quoteCharpente!.id,
      designation: "Charpente bois (sciage + pose)",
      quantity: 1,
      unit: "forfait",
      unit_price: 3250000,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      quote_id: quoteCharpente!.id,
      designation: "Tôles bac alu 0.5 mm (150 m²)",
      quantity: 150,
      unit: "m²",
      unit_price: 7200,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      quote_id: quotePeinture!.id,
      designation: "Peinture intérieure (3 chambres)",
      quantity: 1,
      unit: "forfait",
      unit_price: 980000,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      quote_id: quotePeinture!.id,
      designation: "Peinture extérieure (façades)",
      quantity: 1,
      unit: "forfait",
      unit_price: 770000,
    },
  ];

  const site_logs: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("fondation"),
      log_date: shift(-90),
      title: "Coulage des semelles",
      progress: 100,
      weather: "Ensoleillé",
      workers: 12,
      comment: "Semelles coulées sur l'ensemble de l'emprise.",
      difficulties: null,
      photos: [],
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("elevation-murs"),
      log_date: shift(-55),
      title: "Montage des murs RDC",
      progress: 80,
      weather: "Nuageux",
      workers: 9,
      comment: "Élévation jusqu'au niveau chaînage.",
      difficulties: "Retard de livraison des agglos de 2 jours.",
      photos: [],
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("dalle-plancher"),
      log_date: shift(-20),
      title: "Ferraillage dalle de toiture",
      progress: 45,
      weather: "Pluie",
      workers: 14,
      comment: "Ferraillage en cours, coffrage terminé à 70 %.",
      difficulties: "Pluies fréquentes ralentissant le chantier.",
      photos: [],
    },
  ];

  const documents: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Plan architectural RDC.pdf",
      category: "plan",
      file_path: null,
      size_bytes: 2400000,
      mime_type: "application/pdf",
      expiry_date: null,
      notes: "Architecte : ATB Bénin",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Permis de construire.pdf",
      category: "permis_construire",
      file_path: null,
      size_bytes: 1800000,
      mime_type: "application/pdf",
      expiry_date: shift(240),
      notes: "Mairie d'Abomey-Calavi",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Contrat maçonnerie.pdf",
      category: "contrat",
      file_path: null,
      size_bytes: 950000,
      mime_type: "application/pdf",
      expiry_date: null,
      notes: "ETS BATIR SOLIDE",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Attestation de vente.pdf",
      category: "acte_vente",
      file_path: null,
      size_bytes: 1100000,
      mime_type: "application/pdf",
      expiry_date: null,
      notes: "Lot 452, Togoudo",
    },
  ];

  const invoices: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      reference: "FAC-2026-001",
      title: "Acompte travaux — 40 %",
      amount: 16500000,
      invoice_date: shift(-70),
      due_date: shift(-30),
      status: "partielle",
      notes: "Premier appel de fonds client.",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      reference: "FAC-2026-002",
      title: "Situation gros œuvre",
      amount: 9800000,
      invoice_date: shift(-25),
      due_date: shift(35),
      status: "emise",
      notes: null,
    },
  ];
  const [invAcompte, invGros] = invoices;

  const invoice_payments: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      invoice_id: invAcompte!.id,
      project_id: project.id,
      amount: 9000000,
      payment_date: shift(-55),
      method: "virement",
      reference: "VIR-CLIENT-001",
      notes: null,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      invoice_id: invAcompte!.id,
      project_id: project.id,
      amount: 3000000,
      payment_date: shift(-12),
      method: "mtn_momo",
      reference: "MOMO-CLIENT-009",
      notes: "Paiement partiel en attente du solde.",
    },
  ];

  const invoice_items: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      invoice_id: invAcompte!.id,
      designation: "Acompte travaux — 40 %",
      quantity: "1",
      unit: "forfait",
      unit_price: 16500000,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      invoice_id: invGros!.id,
      designation: "Murs RDC (agglos + main d'œuvre)",
      quantity: "1",
      unit: "forfait",
      unit_price: 5800000,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      invoice_id: invGros!.id,
      designation: "Dalle de toiture (coulage + ferraillage)",
      quantity: "1",
      unit: "forfait",
      unit_price: 4000000,
    },
  ];

  const materials: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Ciment CIMBENIN 50 kg",
      category: "Liants",
      quantity: 80,
      unit: "sac",
      unit_price: 6000,
      reorder_level: 30,
      supplier_id: sQuinc!.id,
      notes: "Stock chantier.",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Fer à béton HA12",
      category: "Acier",
      quantity: 25,
      unit: "barre",
      unit_price: 5000,
      reorder_level: 15,
      supplier_id: sQuinc!.id,
      notes: "Barres de 12 m.",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Sable (camion)",
      category: "Granulats",
      quantity: 3,
      unit: "camion",
      unit_price: 90000,
      reorder_level: 2,
      supplier_id: sSable!.id,
      notes: null,
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Tôles bac alu 6/10",
      category: "Couverture",
      quantity: 12,
      unit: "feuille",
      unit_price: 25000,
      reorder_level: 20,
      supplier_id: sQuinc!.id,
      notes: "Reste à commander pour la toiture.",
    },
  ];

  const material_requirements: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Ciment CIMBENIN 50 kg",
      category: "Liants",
      unit: "sac",
      quantity_needed: 120,
      quantity_ordered: 100,
      quantity_delivered: 80,
      quantity_consumed: 65,
      unit_price: 6000,
      supplier_id: sQuinc!.id,
      status: "partiel",
      notes: "Livraison finale pour la finition.",
      created_at: shift(-20),
      updated_at: shift(-2),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Fer à béton HA12",
      category: "Acier",
      unit: "barre",
      quantity_needed: 60,
      quantity_ordered: 60,
      quantity_delivered: 60,
      quantity_consumed: 52,
      unit_price: 5000,
      supplier_id: sQuinc!.id,
      status: "livre",
      notes: "Ferraillage dalle terminé.",
      created_at: shift(-15),
      updated_at: shift(-1),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      name: "Tôles bac alu 6/10",
      category: "Couverture",
      unit: "feuille",
      quantity_needed: 45,
      quantity_ordered: 12,
      quantity_delivered: 12,
      quantity_consumed: 0,
      unit_price: 25000,
      supplier_id: sQuinc!.id,
      status: "commande",
      notes: "Compléter la commande pour la toiture.",
      created_at: shift(-8),
      updated_at: shift(-1),
    },
  ];

  const material_deliveries: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      requirement_id: material_requirements[0]!.id,
      supplier_id: sQuinc!.id,
      quantity: 80,
      unit_price: 6000,
      delivered_at: shift(-3),
      status: "livree",
      notes: "Première livraison chantier.",
      created_at: shift(-3),
      updated_at: shift(-3),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      requirement_id: material_requirements[1]!.id,
      supplier_id: sQuinc!.id,
      quantity: 60,
      unit_price: 5000,
      delivered_at: shift(-12),
      status: "livree",
      notes: "Toutes les barres livrées.",
      created_at: shift(-12),
      updated_at: shift(-12),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      requirement_id: material_requirements[2]!.id,
      supplier_id: sQuinc!.id,
      quantity: 12,
      unit_price: 25000,
      delivered_at: shift(-2),
      status: "partielle",
      notes: "Début de la livraison des tôles.",
      created_at: shift(-2),
      updated_at: shift(-2),
    },
  ];

  const tasks: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Coulage dalle de toiture",
      description: "Vérifier le coffrage avant bétonnage.",
      status: "en_cours",
      priority: "haute",
      due_date: shift(3),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Commander tôles et gouttières",
      description: "Négocier le prix avec la quincaillerie.",
      status: "a_faire",
      priority: "moyenne",
      due_date: shift(7),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Pré-câblage électricité RDC",
      description: null,
      status: "a_faire",
      priority: "haute",
      due_date: shift(10),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Rendez-vous topographe",
      description: "Bornage parcelle avant clôture.",
      status: "terminee",
      priority: "basse",
      due_date: shift(-5),
    },
  ];

  const photos: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("fondation"),
      phase: "Gros œuvre",
      file_path: null,
      caption: "Coulage des semelles",
      taken_at: shift(-90),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      category_id: cat("elevation-murs"),
      phase: "Gros œuvre",
      file_path: null,
      caption: "Élévation murs RDC",
      taken_at: shift(-55),
    },
  ];

  const mkProvider = (p: {
    name: string;
    category: string;
    services: string;
    certifications: string;
    years: number;
    city: string;
    commune: string;
    phone: string;
    whatsapp: string;
    email: string | null;
    rating: number;
    count: number;
    verified?: boolean;
    contact_name?: string | null;
  }): DemoRow => ({
    id: uid(),
    user_id: null,
    name: p.name,
    contact_name: p.contact_name ?? null,
    category: p.category,
    services: p.services,
    certifications: p.certifications,
    years_experience: p.years,
    phone: p.phone,
    whatsapp: p.whatsapp,
    email: p.email,
    website: null,
    city: p.city,
    commune: p.commune,
    rating: p.rating,
    review_count: p.count,
    verified: p.verified ?? true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const providers: DemoRow[] = [
    mkProvider({
      name: "ETS BATIR SOLIDE",
      contact_name: "Koffi Ahouandjinou",
      category: "maconnerie",
      services: "Construction de murs, fondations, dalles et clôtures. Équipe de maçons confirmés.",
      certifications: "Agrément BTP C1 · Qualification gros œuvre",
      years: 15,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 95 44 22 10",
      whatsapp: "+229 95 44 22 10",
      email: "contact@batirsolide.bj",
      rating: 4.8,
      count: 24,
    }),
    mkProvider({
      name: "SARL VOLT PLUS",
      contact_name: "Rachidath Idrissou",
      category: "electricite",
      services: "Installations électriques domestiques et tertiaires, mise en conformité SBEE.",
      certifications: "Attestation SBEE · Norme NF C 15-100",
      years: 12,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 94 08 76 33",
      whatsapp: "+229 94 08 76 33",
      email: "volt.plus@mail.bj",
      rating: 4.6,
      count: 18,
    }),
    mkProvider({
      name: "PLOMBERIE AZIZ PRO",
      contact_name: "Aziz Chabi",
      category: "plomberie",
      services: "Réseaux sanitaires, évacuations, chauffe-eau et adductions d'eau.",
      certifications: "Certification plomberie sanitaire",
      years: 9,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      phone: "+229 97 33 45 90",
      whatsapp: "+229 97 33 45 90",
      email: null,
      rating: 4.5,
      count: 12,
    }),
    mkProvider({
      name: "ATELIER FERRONNERIE GBETO",
      contact_name: "Barnabé Gbéto",
      category: "charpente",
      services: "Charpentes bois et métalliques, toitures bac alu, étanchéité.",
      certifications: "Qualification charpente & couverture",
      years: 18,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 96 22 17 84",
      whatsapp: "+229 96 22 17 84",
      email: null,
      rating: 4.7,
      count: 9,
    }),
    mkProvider({
      name: "PEINTURE PRUDENCE",
      contact_name: "Prudence Djossou",
      category: "peinture",
      services: "Peinture intérieure et extérieure, enduits, revêtements décoratifs.",
      certifications: "Formation peinture pro",
      years: 7,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      phone: "+229 90 05 61 28",
      whatsapp: "+229 90 05 61 28",
      email: null,
      rating: 4.4,
      count: 15,
    }),
    mkProvider({
      name: "ATB Architecture",
      contact_name: "Arch. Aminatou B.",
      category: "architecture",
      services: "Conception architecturale, plans, suivi de chantier et décoration.",
      certifications: "Ordre des architectes du Bénin",
      years: 20,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 97 10 42 77",
      whatsapp: "+229 97 10 42 77",
      email: "atb.archi@mail.bj",
      rating: 4.9,
      count: 32,
    }),
    mkProvider({
      name: "BEC — Bureau d'études Cotonou",
      contact_name: "Ing. Médard Houngbédji",
      category: "ingenierie",
      services: "Études de structure béton, dimensionnement, contrôle technique.",
      certifications: "Bureau d'études agréé",
      years: 14,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 95 20 38 51",
      whatsapp: "+229 95 20 38 51",
      email: "bec.structure@mail.bj",
      rating: 4.8,
      count: 21,
    }),
    mkProvider({
      name: "GÉOMÈTRE EXPERT KANHOÉ",
      contact_name: "Jules Kanhoé",
      category: "geometre",
      services: "Bornage, levés topographiques, plans cadastraux et implantation.",
      certifications: "Ordre des géomètres experts",
      years: 16,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 97 60 12 03",
      whatsapp: "+229 97 60 12 03",
      email: null,
      rating: 4.7,
      count: 14,
    }),
    mkProvider({
      name: "Quincaillerie La Référence",
      contact_name: "Souleymane Agossa",
      category: "fournisseurs",
      services: "Ciment, fer à béton, tôles, peinture, outillage et matériel de chantier.",
      certifications: "Distributeur agréé CIMBENIN",
      years: 10,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 96 55 30 11",
      whatsapp: "+229 96 55 30 11",
      email: null,
      rating: 4.3,
      count: 40,
    }),
    mkProvider({
      name: "SÉCURITÉ VIP GARDE",
      contact_name: "Cap. Frédéric Zinsou",
      category: "securite",
      services: "Gardiennage de chantier, pose de clôtures et systèmes de surveillance.",
      certifications: "Agrément sécurité privée",
      years: 8,
      city: "Cotonou",
      commune: "Cotonou",
      phone: "+229 95 77 84 20",
      whatsapp: "+229 95 77 84 20",
      email: "vip.garde@mail.bj",
      rating: 4.2,
      count: 8,
    }),
    mkProvider({
      name: "DÉCO MAISON BÉNIN",
      contact_name: "Estelle Hounkpatin",
      category: "decoration",
      services: "Décoration intérieure, menuiserie, stores et aménagement sur mesure.",
      certifications: "",
      years: 5,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      phone: "+229 96 40 09 73",
      whatsapp: "+229 96 40 09 73",
      email: null,
      rating: 4.6,
      count: 11,
      verified: false,
    }),
    mkProvider({
      name: "TRAVAUX PUBLICS AGOSSA",
      contact_name: "Yacoubou Agossa",
      category: "vrd",
      services: "Terrassement, compactage, voirie et réseaux divers (VRD).",
      certifications: "Agrément travaux publics",
      years: 13,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      phone: "+229 97 88 30 45",
      whatsapp: "+229 97 88 30 45",
      email: null,
      rating: 4.5,
      count: 16,
    }),
  ];
  const provArchi = providers[5]!;
  const provMac = providers[0]!;

  const provider_reviews: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      provider_id: provArchi.id,
      rating: 5,
      comment: "Plans clairs et suivi rigoureux du chantier. Je recommande vivement.",
      created_at: new Date(Date.now() - 20 * 864e5).toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      provider_id: provArchi.id,
      rating: 5,
      comment: "Disponibilité et conseils très professionnels.",
      created_at: new Date(Date.now() - 60 * 864e5).toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      provider_id: provMac.id,
      rating: 4,
      comment: "Belle finition sur l'élévation des murs, délais respectés.",
      created_at: new Date(Date.now() - 12 * 864e5).toISOString(),
    },
  ];

  const quote_requests: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      title: "Construction d'une clôture de 60 mètres",
      description:
        "Je souhaite réaliser une clôture en parpaings de 60 m de long, hauteur 2 m, avec portail. Terrain à Cotonou, quartier Fidjrossè.",
      category: "maconnerie",
      budget_min: 450000,
      budget_max: 750000,
      city: "Cotonou",
      commune: "Cotonou",
      deadline: shift(21),
      status: "ouverte",
      winner_bid_id: null,
      created_at: shift(-3),
      updated_at: shift(-3),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      title: "Réfection électrique d'une villa (R+1)",
      description:
        "Mise aux normes du tableau électrique et remplacement de l'installation existante, 5 pièces + dépendance. Plans disponibles.",
      category: "electricite",
      budget_min: 300000,
      budget_max: 500000,
      city: "Cotonou",
      commune: "Cotonou",
      deadline: shift(14),
      status: "ouverte",
      winner_bid_id: null,
      created_at: shift(-5),
      updated_at: shift(-5),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      title: "Peinture intérieure et extérieure",
      description:
        "Peinture complète d'un duplex de 3 chambres + salon. Surface estimée 320 m². Sous-couche et finition.",
      category: "peinture",
      budget_min: 250000,
      budget_max: 380000,
      city: "Abomey-Calavi",
      commune: "Abomey-Calavi",
      deadline: shift(30),
      status: "attribuee",
      winner_bid_id: null,
      created_at: shift(-10),
      updated_at: shift(-4),
    },
  ];
  const reqMac = quote_requests[0]!;

  const quote_bids: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      request_id: reqMac.id,
      amount: 520000,
      message:
        "Clôture en parpaings de 15, 2 m de haut, portail métallique inclus. Délai 3 semaines.",
      status: "soumise",
      created_at: shift(-2),
      updated_at: shift(-2),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      request_id: reqMac.id,
      amount: 680000,
      message: "Réalisation soignée avec fondation filante et poteaux en béton armé tous les 3 m.",
      status: "soumise",
      created_at: shift(-1),
      updated_at: shift(-1),
    },
  ];

  const stores: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Quincaillerie La Référence",
      city: "Cotonou",
      commune: "Littoral",
      lat: 6.3656,
      lng: 2.4231,
      phone: "+229 01 12 34 56",
      delivery_available: true,
      delivery_zone: "Cotonou & Calavi",
      verified: true,
      active: true,
      rating: 4.6,
      review_count: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Dépôt Sable & Gravier",
      city: "Abomey-Calavi",
      commune: "Atlantique",
      lat: 6.4397,
      lng: 2.3525,
      phone: "+229 01 98 76 54",
      delivery_available: true,
      delivery_zone: "Calavi, Ouidah, Allada",
      verified: true,
      active: true,
      rating: 4.3,
      review_count: 11,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Quincaillerie du Centre",
      city: "Cotonou",
      commune: "Littoral",
      lat: 6.3724,
      lng: 2.3928,
      phone: "+229 01 45 67 89",
      delivery_available: true,
      delivery_zone: "Cotonou & environs",
      verified: false,
      active: true,
      rating: 4.1,
      review_count: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const productCats = [
    { id: uid(), name: "Gros œuvre", slug: "gros-oeuvre", parent_id: null, sort_order: 0 },
    { id: uid(), name: "Ciment & liants", slug: "ciment", parent_id: null, sort_order: 1 },
    { id: uid(), name: "Fer à béton", slug: "fer", parent_id: null, sort_order: 2 },
    { id: uid(), name: "Plomberie", slug: "plomberie", parent_id: null, sort_order: 3 },
    { id: uid(), name: "Électricité", slug: "electricite", parent_id: null, sort_order: 4 },
    { id: uid(), name: "Finition", slug: "finition", parent_id: null, sort_order: 5 },
    { id: uid(), name: "Outillage", slug: "outillage", parent_id: null, sort_order: 6 },
  ].map((c) => ({ ...c, created_at: new Date().toISOString() }));

  const productsSeed: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      store_id: stores[0]!.id,
      category_id: productCats[1]!.id,
      name: "Ciment CIMBENIN 42.5",
      unit: "sac",
      price: 4200,
      compare_price: 4500,
      min_order_quantity: 10,
      stock: 500,
      images: [],
      delivery_available: true,
      rating: 4.7,
      review_count: 14,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      store_id: stores[0]!.id,
      category_id: productCats[2]!.id,
      name: "Fer à béton 8 mm (barre 12 m)",
      unit: "barre",
      price: 2800,
      min_order_quantity: 5,
      stock: 300,
      images: [],
      delivery_available: true,
      rating: 4.5,
      review_count: 8,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      store_id: stores[1]!.id,
      category_id: productCats[0]!.id,
      name: "Sable de rivière",
      unit: "m3",
      price: 12000,
      min_order_quantity: 2,
      stock: 90,
      images: [],
      delivery_available: true,
      rating: 4.2,
      review_count: 5,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      store_id: stores[2]!.id,
      category_id: productCats[1]!.id,
      name: "Ciment CIMBENIN 42.5",
      unit: "sac",
      price: 4100,
      compare_price: null,
      min_order_quantity: 10,
      stock: 60,
      images: [],
      delivery_available: true,
      rating: 4.6,
      review_count: 3,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const orderDemo: DemoRow = {
    id: uid(),
    user_id: DEMO_USER,
    store_id: stores[0]!.id,
    project_id: project.id,
    status: "paiement_en_attente",
    reference: "CMD-DEMO-MM",
    subtotal: 168000,
    delivery_fee: 2000,
    total: 170000,
    payment_method: "mtn_momo",
    payment_status: "paiement_en_attente",
    delivery_address: "Quartier Gbégamey, Cotonou",
    city: "Cotonou",
    phone: "+229 97 00 11 22",
    notes: "Paiement en attente — lien de paiement mobile money.",
    ordered_at: shift(-1),
    created_at: shift(-1),
    updated_at: shift(-1),
    lat: null,
    lng: null,
  };

  const orderItemsDemo: DemoRow[] = [
    {
      id: uid(),
      order_id: orderDemo.id,
      product_id: productsSeed[0]!.id,
      name: "Ciment CIMBENIN 42.5",
      unit: "sac",
      quantity: 40,
      unit_price: 4200,
    },
  ];

  const disputes: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      ref: "LIT-2026-10001",
      subject: "Quantité de ciment non conforme à la livraison",
      description:
        "La livraison n°0021 annonçait 12 sacs de ciment mais seuls 9 ont été déposés. Photos du bon de livraison disponibles.",
      related_type: "order",
      related_id: orderDemo.id,
      amount: 12600,
      status: "ouverte",
      decision: null,
      decision_note: null,
      decided_by: null,
      decided_at: null,
      created_at: shift(-4),
      updated_at: shift(-4),
    },
  ];

  const dispute_evidences: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      dispute_id: disputes[0]!.id,
      note: "Bon de livraison signé — 9 sacs comptés.",
      file_path: null,
      created_at: shift(-3),
    },
  ];

  const refunds: DemoRow[] = [];

  const driverDemo: DemoRow = {
    id: uid(),
    user_id: DEMO_USER,
    name: "Zinsou K. (Camion 10 t)",
    city: "Cotonou",
    vehicle_type: "camion",
    capacity: 10,
    price_per_km: 400,
    available: true,
    verified: true,
    rating: 4.7,
    review_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const ai_conversations: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Lancement du chantier — achats de matériaux",
      role: "maitre_oeuvre",
      created_at: shift(-2),
      updated_at: shift(-1),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      project_id: project.id,
      title: "Point budget & planning",
      role: "maitre_oeuvre",
      created_at: shift(-6),
      updated_at: shift(-5),
    },
  ];

  const equipment: DemoRow[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Groupe électrogène 15 kVA",
      category: "groupe_electrogene",
      description: "Groupe électrogène diesel, démarrage électrique, faible consommation.",
      brand: "FG Wilson",
      model: "P150",
      image_url: null,
      city: "Cotonou",
      daily_price: 35000,
      weekly_price: 185000,
      deposit: 150000,
      quantity: 2,
      status: "disponible",
      condition: "excellent",
      created_at: shift(-30),
      updated_at: shift(-2),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Brouette renforcée 100 L",
      category: "outillage",
      description: "Brouette à châssis soudé, pneumatique, idéale chantier.",
      brand: "Castor",
      model: "BR-100",
      image_url: null,
      city: "Cotonou",
      daily_price: 2000,
      weekly_price: 10000,
      deposit: 15000,
      quantity: 10,
      status: "disponible",
      condition: "bon",
      created_at: shift(-25),
      updated_at: shift(-5),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Bétonnière 350 L",
      category: "beton",
      description: "Bétonnière à moteur thermique, cuve 350 L.",
      brand: "Honda",
      model: "HMX-350",
      image_url: null,
      city: "Abomey-Calavi",
      daily_price: 25000,
      weekly_price: 120000,
      deposit: 100000,
      quantity: 1,
      status: "loue",
      condition: "bon",
      created_at: shift(-20),
      updated_at: shift(-1),
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      name: "Échafaudage tubulaire (kit 3 m)",
      category: "echafaudage",
      description: "Kit complet d'échafaudage tubulaire avec plateformes.",
      brand: "Layher",
      model: "Allround",
      image_url: null,
      city: "Parakou",
      daily_price: 8000,
      weekly_price: 40000,
      deposit: 50000,
      quantity: 5,
      status: "disponible",
      condition: "moyen",
      created_at: shift(-15),
      updated_at: shift(-6),
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
    payment_transactions,
    quotes,
    quote_items,
    site_logs,
    documents,
    invoices,
    invoice_items,
    invoice_payments,
    materials,
    material_requirements,
    material_deliveries,
    tasks,
    photos,
    providers,
    provider_reviews,
    quote_requests,
    quote_bids,
    product_categories: productCats,
    stores,
    products: productsSeed,
    product_prices: [
      {
        id: uid(),
        product_id: productsSeed[0]!.id,
        price: 4200,
        compare_price: 4500,
        changed_by: DEMO_USER,
        changed_at: shift(-12),
        note: "prix initial",
      },
      {
        id: uid(),
        product_id: productsSeed[0]!.id,
        price: 4300,
        compare_price: 4500,
        changed_by: DEMO_USER,
        changed_at: shift(-30),
        note: "hausse saisonnière",
      },
    ],
    product_inventory: [
      {
        id: uid(),
        product_id: productsSeed[0]!.id,
        quantity_delta: 500,
        reason: "stock_init",
        note: "Réception fournisseur",
        user_id: DEMO_USER,
        created_at: shift(-12),
      },
      {
        id: uid(),
        product_id: productsSeed[0]!.id,
        quantity_delta: -8,
        reason: "sale",
        note: "Commande #0021",
        user_id: DEMO_USER,
        created_at: shift(-3),
      },
    ],
    drivers: [driverDemo],
    vehicles: [],
    carts: [],
    cart_items: [],
    orders: [orderDemo],
    order_items: orderItemsDemo,
    deliveries: [],
    disputes,
    dispute_evidences,
    refunds,
    reserves: [
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        category_id: cat("elevation-murs"),
        title: "Éclats sur l'élévation des murs Nord",
        description:
          "Fissures apparentes sur le mur Nord au niveau du R+0. À faire contrôler avant le coulage de la dalle.",
        status: "ouverte",
        priority: "haute",
        location: "Façade Nord",
        due_date: shift(15),
        assigned_to: null,
        photo_path: null,
        resolved_at: null,
        created_at: shift(-3),
        updated_at: shift(-3),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        category_id: cat("electricite"),
        title: "Tableau électrique incomplet",
        description:
          "Le tableau de distribution n'est pas terminé côté chauffage : 2 disjoncteurs manquants.",
        status: "en_cours",
        priority: "moyenne",
        location: "Dépendance",
        due_date: shift(30),
        assigned_to: null,
        photo_path: null,
        resolved_at: null,
        created_at: shift(-8),
        updated_at: shift(-2),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        category_id: cat("carrelage"),
        title: "Réserve d'étanchéité salle de bain",
        description:
          "Jointure sous la baignoire à reprendre : risque d'infiltration dans la chambre voisine.",
        status: "resolue",
        priority: "critique",
        location: "SDB principale",
        due_date: shift(-5),
        assigned_to: null,
        photo_path: null,
        resolved_at: shift(-2),
        created_at: shift(-20),
        updated_at: shift(-2),
      },
    ],
    plans: [],
    messages: [
      {
        id: uid(),
        user_id: DEMO_USER,
        sender_id: DEMO_USER,
        recipient_id: null,
        project_id: project.id,
        body: "Bonjour, la livraison du ciment est prévue demain matin avant 9h. Merci de préparer l'accès.",
        is_read: true,
        created_at: shift(-2),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        sender_id: DEMO_USER,
        recipient_id: null,
        project_id: project.id,
        body: "Reçu ! Le coffrage de la dalle est terminé, on peut commencer le coulage dès que le camion arrive.",
        is_read: true,
        created_at: shift(-1),
      },
    ],
    profile_verifications: [
      {
        id: uid(),
        user_id: DEMO_USER,
        level: "professionnel",
        verified_identity: true,
        verified_business: true,
        verified_documents: true,
        premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    verification_documents: [
      {
        id: uid(),
        user_id: DEMO_USER,
        doc_type: "rccm",
        file_path: null,
        note: "Récépissé RCCM — Quincaillerie La Référence",
        status: "approuve",
        admin_note: "Documents conformes, profil vérifié.",
        reviewed_by: null,
        reviewed_at: shift(-10),
        created_at: shift(-12),
        updated_at: shift(-10),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        doc_type: "identite",
        file_path: null,
        note: "Carte d'identité nationale (recto-verso)",
        status: "en_attente",
        admin_note: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: shift(-1),
        updated_at: shift(-1),
      },
    ],
    market_reviews: [
      {
        id: uid(),
        user_id: DEMO_USER,
        target_type: "store",
        target_id: stores[0]!.id,
        rating: 5,
        comment: "Matériaux conformes et livraison ponctuelle. Je recommande.",
        verified: true,
        created_at: shift(-15),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        target_type: "product",
        target_id: productsSeed[0]!.id,
        rating: 5,
        comment: "Ciment bien conditionné, prix intéressant par rapport au marché.",
        verified: true,
        created_at: shift(-15),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        target_type: "driver",
        target_id: driverDemo.id,
        rating: 4,
        comment: "Transporteur ponctuel, chargement soigné.",
        verified: true,
        created_at: shift(-8),
      },
    ],
    ai_conversations,
    ai_actions: [
      {
        id: uid(),
        conversation_id: ai_conversations[0]!.id,
        user_id: DEMO_USER,
        action_type: "achat",
        title: "Compléter le ciment (40 sacs restants)",
        payload: { table: "material_requirements", category: "Liants" },
        created_at: shift(-1),
      },
      {
        id: uid(),
        conversation_id: ai_conversations[0]!.id,
        user_id: DEMO_USER,
        action_type: "achat",
        title: "Ajouter 45 feuilles de tôles bac alu 6/10",
        payload: { table: "material_requirements", category: "Couverture" },
        created_at: shift(-1),
      },
      {
        id: uid(),
        conversation_id: ai_conversations[1]!.id,
        user_id: DEMO_USER,
        action_type: "finance",
        title: "Recalibrer le poste fondations (estimé à 112 %)",
        payload: { table: "budget_lines" },
        created_at: shift(-5),
      },
    ],
    notifications: [
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        channel: "in_app",
        kind: "paiement",
        title: "Paiement confirmé — 2 500 000 FCFA",
        body: "Transaction mobile money MTN MoMo confirmée pour le lot n°1 (fondations).",
        link: "/paiements",
        read_at: null,
        created_at: shift(0),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        channel: "in_app",
        kind: "livraison",
        title: "Livraison de matériaux planifiée",
        body: "40 sacs de ciment en cours d'acheminement vers le chantier.",
        link: "/materiaux",
        read_at: null,
        created_at: shift(-1),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        channel: "in_app",
        kind: "devis",
        title: "Nouvelle offre reçue — Maçonnerie gros œuvre",
        body: "Un prestataire a répondu à votre demande de devis.",
        link: "/demandes-devis",
        read_at: null,
        created_at: shift(-3),
      },
      {
        id: uid(),
        user_id: DEMO_USER,
        project_id: project.id,
        channel: "in_app",
        kind: "verification",
        title: "Profil vérifié",
        body: "Votre pièce d'identité a été approuvée par l'administration.",
        link: "/parametres",
        read_at: new Date().toISOString(),
        created_at: shift(-10),
      },
    ],
    device_tokens: [
      {
        id: uid(),
        user_id: DEMO_USER,
        token: "demo-device-web-0001",
        platform: "web",
        created_at: shift(-15),
        last_seen_at: shift(0),
      },
    ],
    equipment,
    equipment_rentals: [
      {
        id: uid(),
        user_id: DEMO_USER,
        equipment_id: equipment[2]!.id,
        project_id: project.id,
        start_date: shift(-6),
        end_date: shift(8),
        daily_price: 25000,
        weekly_price: 120000,
        total_price: 360000,
        deposit: 100000,
        delivery_fee: 25000,
        delivery_address: "Zone industrielle, Akpakpa — Cotonou",
        scheduled_at: shift(-6),
        returned_at: null,
        notes: "Livraison sur chantier le premier jour.",
        status: "confirmee",
        created_at: shift(-8),
        updated_at: shift(-6),
      },
    ],
    profiles: [
      {
        id: DEMO_USER,
        full_name: "Visiteur démo",
        phone: null,
        email: "demo@batibenin.bj",
        account_type: "maitre_oeuvre",
      },
    ],
    demo_requests: [] as DemoRow[],
    organizations: [] as DemoRow[],
    organization_members: [] as DemoRow[],
    project_members: [] as DemoRow[],
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

/** Répartition par défaut du budget d'un chantier (workflow Bénin, total 100 %). */
export const DEFAULT_BUDGET_SPLIT: Array<{ slug: string; pct: number }> = [
  { slug: "terrassement", pct: 3 },
  { slug: "fondation", pct: 15 },
  { slug: "elevation-murs", pct: 20 },
  { slug: "dalle-plancher", pct: 13 },
  { slug: "charpente-toiture", pct: 12 },
  { slug: "electricite", pct: 6 },
  { slug: "plomberie", pct: 5 },
  { slug: "carrelage", pct: 8 },
  { slug: "peinture", pct: 5 },
  { slug: "main-doeuvre", pct: 13 },
];

/** Crée les postes de budget d'un projet à partir de son enveloppe globale (mode invité). */
export function demoSeedBudgetLines(projectId: string, budget: number) {
  const cats = db["categories"] as DemoRow[];
  const existing = (db["budget_lines"] as DemoRow[]).filter((l) => l["project_id"] === projectId);
  if (existing.length > 0) return;
  const lines: (DemoRow | null)[] = DEFAULT_BUDGET_SPLIT.map(({ slug, pct }) => {
    const cat = cats.find((c) => c["slug"] === slug);
    if (!cat) return null;
    return {
      id: uid(),
      user_id: DEMO_USER,
      project_id: projectId,
      category_id: cat.id,
      planned_amount: Math.round((budget * pct) / 100),
    };
  });
  const rows = lines.filter((l): l is DemoRow => l !== null);
  if (rows.length > 0) (db["budget_lines"] as DemoRow[]).push(...rows);
}

/** Duplique un projet et toutes ses données liées (mode invité). Renvoie le nouvel id. */
export function demoDuplicateProject(projectId: string): string {
  const project = (db["projects"] as DemoRow[]).find((p) => p["id"] === projectId);
  if (!project) throw new Error("Projet introuvable");
  const newId = uid();
  const idMap = new Map<string, string>();
  const copy = (table: DemoTableName, source: DemoRow) => {
    const dest: DemoRow = { ...source };
    dest.id = uid();
    dest["created_at"] = new Date().toISOString();
    dest["updated_at"] = new Date().toISOString();
    idMap.set(source.id, dest.id);
    (db[table] as DemoRow[]).push(dest);
    return dest;
  };

  const newProject = copy("projects", project);
  newProject.id = newId;
  newProject["name"] = `${project["name"]} — copie`;
  newProject["status"] = "planifie";

  (db["budget_lines"] as DemoRow[])
    .filter((l) => l["project_id"] === projectId)
    .forEach((l) => copy("budget_lines", l));

  (db["expenses"] as DemoRow[])
    .filter((e) => e["project_id"] === projectId)
    .forEach((e) => copy("expenses", e));

  (db["payments"] as DemoRow[])
    .filter((p) => p["project_id"] === projectId)
    .forEach((p) => {
      const dest = copy("payments", p);
      if (p["expense_id"]) dest["expense_id"] = idMap.get(p["expense_id"]) ?? p["expense_id"];
    });

  (db["payment_transactions"] as DemoRow[])
    .filter((t) => t["project_id"] === projectId)
    .forEach((t) => {
      const dest = copy("payment_transactions", t);
      if (t["order_id"]) dest["order_id"] = idMap.get(t["order_id"]) ?? t["order_id"];
    });

  (db["quotes"] as DemoRow[])
    .filter((q) => q["project_id"] === projectId)
    .forEach((q) => copy("quotes", q));

  (db["site_logs"] as DemoRow[])
    .filter((s) => s["project_id"] === projectId)
    .forEach((s) => copy("site_logs", s));

  (db["documents"] as DemoRow[])
    .filter((d) => d["project_id"] === projectId)
    .forEach((d) => copy("documents", d));

  (db["materials"] as DemoRow[])
    .filter((m) => m["project_id"] === projectId)
    .forEach((m) => copy("materials", m));

  (db["material_requirements"] as DemoRow[])
    .filter((r) => r["project_id"] === projectId)
    .forEach((r) => copy("material_requirements", r));

  (db["material_deliveries"] as DemoRow[])
    .filter((d) => d["project_id"] === projectId)
    .forEach((d) => copy("material_deliveries", d));

  (db["tasks"] as DemoRow[])
    .filter((t) => t["project_id"] === projectId)
    .forEach((t) => copy("tasks", t));

  (db["photos"] as DemoRow[])
    .filter((p) => p["project_id"] === projectId)
    .forEach((p) => copy("photos", p));

  (db["invoices"] as DemoRow[])
    .filter((i) => i["project_id"] === projectId)
    .forEach((i) => {
      const dest = copy("invoices", i);
      idMap.set(i.id, dest.id);
    });

  (db["invoice_payments"] as DemoRow[])
    .filter((p) => p["project_id"] === projectId)
    .forEach((p) => {
      const dest = copy("invoice_payments", p);
      if (p["invoice_id"]) dest["invoice_id"] = idMap.get(p["invoice_id"]) ?? p["invoice_id"];
    });

  (db["quote_items"] as DemoRow[])
    .filter((q) => q["quote_id"] !== undefined)
    .forEach((q) => {
      const dest = copy("quote_items", q);
      if (q["quote_id"]) dest["quote_id"] = idMap.get(q["quote_id"]) ?? q["quote_id"];
    });

  (db["invoice_items"] as DemoRow[])
    .filter((i) => i["invoice_id"] !== undefined)
    .forEach((i) => {
      const dest = copy("invoice_items", i);
      if (i["invoice_id"]) dest["invoice_id"] = idMap.get(i["invoice_id"]) ?? i["invoice_id"];
    });

  (db["quote_requests"] as DemoRow[])
    .filter((r) => r["user_id"] === project["user_id"] || true)
    .forEach((r) => {
      const dest = copy("quote_requests", r);
      idMap.set(r.id, dest.id);
    });

  (db["quote_bids"] as DemoRow[])
    .filter((b) => b["request_id"] !== undefined)
    .forEach((b) => {
      const dest = copy("quote_bids", b);
      if (b["request_id"]) dest["request_id"] = idMap.get(b["request_id"]) ?? b["request_id"];
    });

  (db["disputes"] as DemoRow[])
    .filter((d) => d["user_id"] === project["user_id"] || true)
    .forEach((d) => {
      const dest = copy("disputes", d);
      idMap.set(d.id, dest.id);
    });

  (db["dispute_evidences"] as DemoRow[])
    .filter((e) => e["dispute_id"] !== undefined)
    .forEach((e) => {
      const dest = copy("dispute_evidences", e);
      if (e["dispute_id"]) dest["dispute_id"] = idMap.get(e["dispute_id"]) ?? e["dispute_id"];
    });

  (db["refunds"] as DemoRow[])
    .filter((r) => r["dispute_id"] !== undefined)
    .forEach((r) => {
      const dest = copy("refunds", r);
      if (r["dispute_id"]) dest["dispute_id"] = idMap.get(r["dispute_id"]) ?? r["dispute_id"];
    });

  return newId;
}

export function resetDemoData() {
  db = seed();
}
