-- Vague 10 — Immobilier promoteurs.
-- Un promoteur gère des programmes immobiliers, décomposés en immeubles puis en
-- lots/appartements (unités). Les ventes passent par des dossiers clients (réservations)
-- qui font évoluer le statut des lots : disponible → réservé → vendu.

/* ---------- Enums ---------- */

CREATE TYPE public.development_program_status AS ENUM (
  'planification', 'commercialisation', 'en_construction', 'livre'
);
CREATE TYPE public.building_status AS ENUM (
  'planification', 'en_construction', 'livre'
);
CREATE TYPE public.property_unit_type AS ENUM (
  'appartement', 'villa', 'boutique', 'bureau', 'terrain', 'garage', 'magasin'
);
CREATE TYPE public.property_unit_status AS ENUM (
  'disponible', 'reserve', 'vendu'
);
CREATE TYPE public.property_reservation_status AS ENUM (
  'demande', 'confirmee', 'vendue', 'annulee'
);

/* ---------- Programmes immobiliers ---------- */

CREATE TABLE IF NOT EXISTS public.development_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  city text,
  address text,
  status public.development_program_status NOT NULL DEFAULT 'commercialisation',
  budget_total numeric(14,2) NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS development_programs_user_idx ON public.development_programs (user_id);
CREATE INDEX IF NOT EXISTS development_programs_status_idx ON public.development_programs (status);

/* ---------- Immeubles ---------- */

CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.development_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  floor_count integer NOT NULL DEFAULT 0,
  status public.building_status NOT NULL DEFAULT 'planification',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS buildings_program_idx ON public.buildings (program_id);

/* ---------- Lots / unités ---------- */

CREATE TABLE IF NOT EXISTS public.property_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  unit_type public.property_unit_type NOT NULL DEFAULT 'appartement',
  surface_m2 numeric(10,2) NOT NULL DEFAULT 0,
  rooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  price numeric(14,2) NOT NULL DEFAULT 0,
  status public.property_unit_status NOT NULL DEFAULT 'disponible',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_units_building_idx ON public.property_units (building_id);
CREATE INDEX IF NOT EXISTS property_units_status_idx ON public.property_units (status);

/* ---------- Dossiers clients (réservations / ventes) ---------- */

CREATE TABLE IF NOT EXISTS public.property_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.property_units(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  deposit_paid boolean NOT NULL DEFAULT false,
  notes text,
  status public.property_reservation_status NOT NULL DEFAULT 'demande',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_reservations_unit_idx ON public.property_reservations (unit_id);
CREATE INDEX IF NOT EXISTS property_reservations_user_idx ON public.property_reservations (user_id);
CREATE INDEX IF NOT EXISTS property_reservations_status_idx ON public.property_reservations (status);

/* ---------- RLS ---------- */

ALTER TABLE public.development_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reservations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.development_programs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_units TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_reservations TO authenticated;
GRANT ALL ON public.development_programs TO service_role;
GRANT ALL ON public.buildings TO service_role;
GRANT ALL ON public.property_units TO service_role;
GRANT ALL ON public.property_reservations TO service_role;

-- Programmes : catalogue lisible par tous les connectés, écriture réservée au promoteur.
CREATE POLICY "programs read all" ON public.development_programs FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "programs insert own" ON public.development_programs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "programs update own" ON public.development_programs FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "programs delete own" ON public.development_programs FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Immeubles : lecture pour tous, écriture pour le promoteur du programme.
CREATE POLICY "buildings read all" ON public.buildings FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "buildings insert owner" ON public.buildings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.development_programs p
    WHERE p.id = program_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "buildings update owner" ON public.buildings FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.development_programs p
    WHERE p.id = program_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "buildings delete owner" ON public.buildings FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.development_programs p
    WHERE p.id = program_id AND p.user_id = auth.uid()
  ));

-- Lots : lecture pour tous, écriture pour le promoteur (via l'immeuble).
CREATE POLICY "units read all" ON public.property_units FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "units insert owner" ON public.property_units FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.buildings b
    JOIN public.development_programs p ON p.id = b.program_id
    WHERE b.id = building_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "units update owner" ON public.property_units FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.buildings b
    JOIN public.development_programs p ON p.id = b.program_id
    WHERE b.id = building_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "units delete owner" ON public.property_units FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.buildings b
    JOIN public.development_programs p ON p.id = b.program_id
    WHERE b.id = building_id AND p.user_id = auth.uid()
  ));

-- Dossiers clients : l'auteur (promoteur) et le propriétaire du programme peuvent lire ;
-- l'auteur crée et supprime ; le promoteur fait évoluer le statut.
CREATE POLICY "reservations read own or owner" ON public.property_reservations FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.property_units u
      JOIN public.buildings b ON b.id = u.building_id
      JOIN public.development_programs p ON p.id = b.program_id
      WHERE u.id = property_reservations.unit_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "reservations insert own" ON public.property_reservations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "reservations update own or owner" ON public.property_reservations FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.property_units u
      JOIN public.buildings b ON b.id = u.building_id
      JOIN public.development_programs p ON p.id = b.program_id
      WHERE u.id = property_reservations.unit_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "reservations delete own" ON public.property_reservations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Triggers : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_development_program()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS development_programs_touch ON public.development_programs;
CREATE TRIGGER development_programs_touch
  BEFORE UPDATE ON public.development_programs
  FOR EACH ROW EXECUTE FUNCTION public.touch_development_program();

CREATE OR REPLACE FUNCTION public.touch_building()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS buildings_touch ON public.buildings;
CREATE TRIGGER buildings_touch
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.touch_building();

CREATE OR REPLACE FUNCTION public.touch_property_unit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS property_units_touch ON public.property_units;
CREATE TRIGGER property_units_touch
  BEFORE UPDATE ON public.property_units
  FOR EACH ROW EXECUTE FUNCTION public.touch_property_unit();

CREATE OR REPLACE FUNCTION public.touch_property_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS property_reservations_touch ON public.property_reservations;
CREATE TRIGGER property_reservations_touch
  BEFORE UPDATE ON public.property_reservations
  FOR EACH ROW EXECUTE FUNCTION public.touch_property_reservation();
