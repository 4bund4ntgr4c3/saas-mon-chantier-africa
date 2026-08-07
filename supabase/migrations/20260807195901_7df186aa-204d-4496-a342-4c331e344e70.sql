-- 1. Catégories globales (partagées, lisibles par tous les utilisateurs connectés)
INSERT INTO public.categories (user_id, name, slug, phase, sort_order) VALUES
  (NULL, 'Études & permis',        'etudes-permis',      'Préparation',   10),
  (NULL, 'Terrassement',           'terrassement',       'Gros œuvre',    20),
  (NULL, 'Fondation',              'fondation',          'Gros œuvre',    30),
  (NULL, 'Élévation murs',         'elevation-murs',     'Gros œuvre',    40),
  (NULL, 'Dalle & plancher',       'dalle-plancher',     'Gros œuvre',    50),
  (NULL, 'Charpente & toiture',    'charpente-toiture',  'Gros œuvre',    60),
  (NULL, 'Menuiserie',             'menuiserie',         'Second œuvre',  70),
  (NULL, 'Électricité',            'electricite',        'Second œuvre',  80),
  (NULL, 'Plomberie',              'plomberie',          'Second œuvre',  90),
  (NULL, 'Carrelage',              'carrelage',          'Finitions',    100),
  (NULL, 'Peinture',               'peinture',           'Finitions',    110),
  (NULL, 'Clôture & aménagement',  'cloture-amenagement','Finitions',    120),
  (NULL, 'Main d''œuvre',          'main-doeuvre',       'Autres',       130),
  (NULL, 'Transport & divers',     'transport-divers',   'Autres',       140);

-- 2. Fonction de création du chantier de démonstration
CREATE OR REPLACE FUNCTION public.seed_demo_data(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_id uuid;
  s_sable uuid;
  s_quinc uuid;
  c_mac uuid;
  c_elec uuid;
  cat_terr uuid; cat_fond uuid; cat_elev uuid; cat_dalle uuid; cat_toit uuid;
  cat_elec uuid; cat_plomb uuid; cat_carr uuid; cat_peint uuid; cat_mo uuid;
  e1 uuid; e2 uuid; e3 uuid; e4 uuid; e5 uuid;
BEGIN
  -- Ne pas dupliquer si l'utilisateur a déjà un projet
  IF EXISTS (SELECT 1 FROM public.projects WHERE user_id = _user_id) THEN
    RETURN;
  END IF;

  SELECT id INTO cat_terr  FROM public.categories WHERE slug = 'terrassement'      AND user_id IS NULL;
  SELECT id INTO cat_fond  FROM public.categories WHERE slug = 'fondation'         AND user_id IS NULL;
  SELECT id INTO cat_elev  FROM public.categories WHERE slug = 'elevation-murs'    AND user_id IS NULL;
  SELECT id INTO cat_dalle FROM public.categories WHERE slug = 'dalle-plancher'    AND user_id IS NULL;
  SELECT id INTO cat_toit  FROM public.categories WHERE slug = 'charpente-toiture' AND user_id IS NULL;
  SELECT id INTO cat_elec  FROM public.categories WHERE slug = 'electricite'       AND user_id IS NULL;
  SELECT id INTO cat_plomb FROM public.categories WHERE slug = 'plomberie'         AND user_id IS NULL;
  SELECT id INTO cat_carr  FROM public.categories WHERE slug = 'carrelage'         AND user_id IS NULL;
  SELECT id INTO cat_peint FROM public.categories WHERE slug = 'peinture'          AND user_id IS NULL;
  SELECT id INTO cat_mo    FROM public.categories WHERE slug = 'main-doeuvre'      AND user_id IS NULL;

  INSERT INTO public.projects (user_id, name, city, commune, arrondissement, quartier, address,
                               land_area, built_area, house_type, levels, start_date, end_date,
                               budget, status)
  VALUES (_user_id, 'Villa Démo — Calavi', 'Abomey-Calavi', 'Abomey-Calavi', 'Godomey', 'Togoudo',
          'Lot 452, Togoudo', 500, 180, 'Villa basse 4 chambres', 1,
          CURRENT_DATE - 120, CURRENT_DATE + 150, 42000000, 'en_cours')
  RETURNING id INTO p_id;

  INSERT INTO public.suppliers (user_id, name, phone, whatsapp, city, commune, activity, products)
  VALUES (_user_id, 'Dépôt Sable & Gravier Togoudo', '+229 97 12 45 78', '+229 97 12 45 78',
          'Abomey-Calavi', 'Abomey-Calavi', 'Matériaux de construction', 'Sable, gravier, latérite')
  RETURNING id INTO s_sable;

  INSERT INTO public.suppliers (user_id, name, phone, whatsapp, city, commune, activity, products)
  VALUES (_user_id, 'Quincaillerie La Référence', '+229 96 55 30 11', '+229 96 55 30 11',
          'Cotonou', 'Cotonou', 'Quincaillerie', 'Ciment, fer à béton, tôles, peinture')
  RETURNING id INTO s_quinc;

  INSERT INTO public.companies (user_id, name, manager, phone, email, trade, contract_ref, contract_amount)
  VALUES (_user_id, 'ETS BATIR SOLIDE', 'Koffi Ahouandjinou', '+229 95 44 22 10',
          'contact@batirsolide.bj', 'Maçonnerie & gros œuvre', 'CTR-2026-001', 12500000)
  RETURNING id INTO c_mac;

  INSERT INTO public.companies (user_id, name, manager, phone, email, trade, contract_ref, contract_amount)
  VALUES (_user_id, 'SARL VOLT PLUS', 'Rachidath Idrissou', '+229 94 08 76 33',
          'volt.plus@mail.bj', 'Électricité & plomberie', 'CTR-2026-002', 4200000)
  RETURNING id INTO c_elec;

  INSERT INTO public.budget_lines (user_id, project_id, category_id, planned_amount) VALUES
    (_user_id, p_id, cat_terr,  1200000),
    (_user_id, p_id, cat_fond,  6500000),
    (_user_id, p_id, cat_elev,  8000000),
    (_user_id, p_id, cat_dalle, 5500000),
    (_user_id, p_id, cat_toit,  4800000),
    (_user_id, p_id, cat_elec,  2200000),
    (_user_id, p_id, cat_plomb, 2000000),
    (_user_id, p_id, cat_carr,  3200000),
    (_user_id, p_id, cat_peint, 1800000),
    (_user_id, p_id, cat_mo,    6800000);

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes)
  VALUES (_user_id, p_id, cat_terr, s_sable, NULL, CURRENT_DATE - 115,
          'Décapage et nivellement du terrain', 'Abomey-Calavi', 'Abomey-Calavi',
          950000, 1, 950000, 'especes', 'FAC-0001', 'Location engin 2 jours')
  RETURNING id INTO e1;

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes)
  VALUES (_user_id, p_id, cat_fond, s_quinc, NULL, CURRENT_DATE - 98,
          'Ciment CIMBENIN 50 kg', 'Cotonou', 'Cotonou',
          2400000, 400, 6000, 'mtn_momo', 'FAC-0002', 'Livraison incluse')
  RETURNING id INTO e2;

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes)
  VALUES (_user_id, p_id, cat_fond, s_sable, NULL, CURRENT_DATE - 92,
          'Sable et gravier fondation', 'Abomey-Calavi', 'Abomey-Calavi',
          1350000, 15, 90000, 'especes', 'FAC-0003', '15 camions')
  RETURNING id INTO e3;

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes)
  VALUES (_user_id, p_id, cat_elev, NULL, c_mac, CURRENT_DATE - 60,
          'Élévation murs — tranche 1', 'Abomey-Calavi', 'Abomey-Calavi',
          4200000, 1, 4200000, 'virement', 'FAC-0004', 'Situation n°1 maçonnerie')
  RETURNING id INTO e4;

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes)
  VALUES (_user_id, p_id, cat_dalle, s_quinc, NULL, CURRENT_DATE - 34,
          'Fer à béton HA12 et HA8', 'Cotonou', 'Cotonou',
          3100000, 62, 50000, 'virement', 'FAC-0005', 'Barres de 12 m')
  RETURNING id INTO e5;

  INSERT INTO public.expenses (user_id, project_id, category_id, supplier_id, company_id, expense_date,
                               label, city, commune, amount, quantity, unit_price, method, reference, notes) VALUES
    (_user_id, p_id, cat_mo,    NULL,    c_mac,  CURRENT_DATE - 27, 'Main d''œuvre coffrage dalle', 'Abomey-Calavi', 'Abomey-Calavi', 1450000, 1, 1450000, 'especes',   'FAC-0006', '9 ouvriers / 12 jours'),
    (_user_id, p_id, cat_toit,  s_quinc, NULL,   CURRENT_DATE - 18, 'Tôles bac alu 6/10',           'Cotonou',       'Cotonou',       2250000, 90, 25000, 'moov_money','FAC-0007', 'Coloris rouge'),
    (_user_id, p_id, cat_elec,  NULL,    c_elec, CURRENT_DATE - 12, 'Pré-câblage électrique',       'Abomey-Calavi', 'Abomey-Calavi', 1150000, 1, 1150000, 'mtn_momo',  'FAC-0008', 'Gaines et boîtiers'),
    (_user_id, p_id, cat_plomb, NULL,    c_elec, CURRENT_DATE - 8,  'Réseau plomberie sanitaire',   'Abomey-Calavi', 'Abomey-Calavi',  980000, 1,  980000, 'virement',  'FAC-0009', 'PVC + PPR'),
    (_user_id, p_id, cat_carr,  s_quinc, NULL,   CURRENT_DATE - 3,  'Carrelage 60x60 (acompte)',    'Cotonou',       'Cotonou',        870000, 120,  7250, 'especes',   'FAC-0010', 'Première livraison');

  INSERT INTO public.payments (user_id, project_id, expense_id, supplier_id, company_id, payment_date,
                               amount, kind, method, reference, notes) VALUES
    (_user_id, p_id, e1, s_sable, NULL,   CURRENT_DATE - 115,  950000, 'comptant', 'especes',    'PAY-0001', 'Réglé sur place'),
    (_user_id, p_id, e2, s_quinc, NULL,   CURRENT_DATE - 98,  1500000, 'acompte',  'mtn_momo',   'PAY-0002', 'Acompte 60 %'),
    (_user_id, p_id, e2, s_quinc, NULL,   CURRENT_DATE - 80,   900000, 'solde',    'mtn_momo',   'PAY-0003', 'Solde ciment'),
    (_user_id, p_id, e3, s_sable, NULL,   CURRENT_DATE - 90,  1350000, 'comptant', 'especes',    'PAY-0004', NULL),
    (_user_id, p_id, e4, NULL,    c_mac,  CURRENT_DATE - 58,  2500000, 'acompte',  'virement',   'PAY-0005', 'Situation n°1'),
    (_user_id, p_id, e4, NULL,    c_mac,  CURRENT_DATE - 40,  1700000, 'solde',    'virement',   'PAY-0006', 'Solde tranche 1'),
    (_user_id, p_id, e5, s_quinc, NULL,   CURRENT_DATE - 33,  3100000, 'comptant', 'virement',   'PAY-0007', 'Fer à béton'),
    (_user_id, p_id, NULL, NULL,  c_elec, CURRENT_DATE - 10,  1000000, 'partiel',  'mtn_momo',   'PAY-0008', 'Avance électricité'),
    (_user_id, p_id, NULL, s_quinc, NULL, CURRENT_DATE - 2,    500000, 'acompte',  'especes',    'PAY-0009', 'Acompte carrelage');

  INSERT INTO public.quotes (user_id, project_id, category_id, supplier_id, company_id, reference,
                             label, amount, quote_date, valid_until, status, notes) VALUES
    (_user_id, p_id, cat_toit,  NULL,    c_mac,  'DEV-0001', 'Charpente bois + couverture tôles', 4650000, CURRENT_DATE - 45, CURRENT_DATE + 15, 'accepte',   'Négocié à la baisse'),
    (_user_id, p_id, cat_peint, s_quinc, NULL,   'DEV-0002', 'Peinture intérieure et extérieure', 1750000, CURRENT_DATE - 20, CURRENT_DATE + 40, 'en_attente','À comparer avec 2 autres offres'),
    (_user_id, p_id, cat_elec,  NULL,    c_elec, 'DEV-0003', 'Installation électrique complète',  2150000, CURRENT_DATE - 30, CURRENT_DATE + 10, 'converti',  'Devis transformé en facture');

  INSERT INTO public.site_logs (user_id, project_id, category_id, log_date, title, progress, weather, workers, comment, difficulties) VALUES
    (_user_id, p_id, cat_fond,  CURRENT_DATE - 90, 'Coulage des semelles',        100, 'Ensoleillé', 12, 'Semelles coulées sur l''ensemble de l''emprise.', NULL),
    (_user_id, p_id, cat_elev,  CURRENT_DATE - 55, 'Montage des murs RDC',         80, 'Nuageux',    9,  'Élévation jusqu''au niveau chaînage.', 'Retard de livraison des agglos de 2 jours.'),
    (_user_id, p_id, cat_dalle, CURRENT_DATE - 20, 'Ferraillage dalle de toiture', 45, 'Pluie',      14, 'Ferraillage en cours, coffrage terminé à 70 %.', 'Pluies fréquentes ralentissant le chantier.');
END;
$$;

-- 3. Le déclencheur d'inscription crée aussi le chantier de démonstration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  END IF;

  PERFORM public.seed_demo_data(new.id);

  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.seed_demo_data(uuid) FROM anon, authenticated;