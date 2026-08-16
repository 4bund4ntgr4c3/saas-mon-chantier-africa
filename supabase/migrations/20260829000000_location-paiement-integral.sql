-- Vague 9 (suite) : paiement intégral de la location par mobile money (hors caution).

ALTER TABLE public.equipment_rentals
  ADD COLUMN IF NOT EXISTS total_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_paid_at timestamptz;
