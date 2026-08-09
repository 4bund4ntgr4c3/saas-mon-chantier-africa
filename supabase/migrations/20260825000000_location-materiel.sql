-- Vague 9 — Location de matériel (equipment + equipment_rentals).
-- Un propriétaire met du matériel en location (prix par jour/semaine, caution, état) ;
-- un client réserve pour une période, avec ou sans livraison, puis le propriétaire confirme
-- et suit l'état jusqu'au retour.

/* ---------- Enums ---------- */

CREATE TYPE public.equipment_status AS ENUM ('disponible', 'loue', 'hors_service');
CREATE TYPE public.equipment_condition AS ENUM ('excellent', 'bon', 'moyen', 'mauvais');
CREATE TYPE public.equipment_rental_status AS ENUM (
  'demande', 'confirmee', 'en_cours', 'retour_en_cours', 'terminee', 'annulee', 'litige'
);

/* ---------- Équipements (matériel à louer) ---------- */

CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'autre',
  description text,
  brand text,
  model text,
  image_url text,
  city text,
  daily_price numeric(14,2) NOT NULL DEFAULT 0,
  weekly_price numeric(14,2) NOT NULL DEFAULT 0,
  deposit numeric(14,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  status public.equipment_status NOT NULL DEFAULT 'disponible',
  condition public.equipment_condition NOT NULL DEFAULT 'bon',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equipment_user_idx ON public.equipment (user_id);
CREATE INDEX IF NOT EXISTS equipment_status_idx ON public.equipment (status);
CREATE INDEX IF NOT EXISTS equipment_category_idx ON public.equipment (category);

/* ---------- Locations ---------- */

CREATE TABLE IF NOT EXISTS public.equipment_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_price numeric(14,2) NOT NULL DEFAULT 0,
  weekly_price numeric(14,2) NOT NULL DEFAULT 0,
  total_price numeric(14,2) NOT NULL DEFAULT 0,
  deposit numeric(14,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(14,2) NOT NULL DEFAULT 0,
  delivery_address text,
  scheduled_at timestamptz,
  returned_at timestamptz,
  return_code text NOT NULL DEFAULT '',
  deposit_paid boolean NOT NULL DEFAULT false,
  notes text,
  status public.equipment_rental_status NOT NULL DEFAULT 'demande',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equipment_rentals_equipment_idx ON public.equipment_rentals (equipment_id);
CREATE INDEX IF NOT EXISTS equipment_rentals_user_idx ON public.equipment_rentals (user_id);
CREATE INDEX IF NOT EXISTS equipment_rentals_status_idx ON public.equipment_rentals (status);

/* ---------- RLS ---------- */

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_rentals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_rentals TO authenticated;
GRANT ALL ON public.equipment_rentals TO service_role;

-- Équipements : catalogue lisible par tous les connectés, écriture réservée au propriétaire.
CREATE POLICY "equipment read all" ON public.equipment FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "equipment insert own" ON public.equipment FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "equipment update own" ON public.equipment FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "equipment delete own" ON public.equipment FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Locations : le client (auteur) et le propriétaire du matériel peuvent lire ;
-- le client crée ; le client annule et le propriétaire fait évoluer le statut.
CREATE POLICY "rentals read renter or owner" ON public.equipment_rentals FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = equipment_rentals.equipment_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "rentals insert own" ON public.equipment_rentals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "rentals update renter or owner" ON public.equipment_rentals FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = equipment_rentals.equipment_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "rentals delete own" ON public.equipment_rentals FOR DELETE TO authenticated
  USING (user_id = auth.uid());

/* ---------- Trigger : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_equipment()
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

DROP TRIGGER IF EXISTS equipment_touch ON public.equipment;
CREATE TRIGGER equipment_touch
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.touch_equipment();

CREATE OR REPLACE FUNCTION public.touch_equipment_rental()
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

DROP TRIGGER IF EXISTS equipment_rentals_touch ON public.equipment_rentals;
CREATE TRIGGER equipment_rentals_touch
  BEFORE UPDATE ON public.equipment_rentals
  FOR EACH ROW EXECUTE FUNCTION public.touch_equipment_rental();
