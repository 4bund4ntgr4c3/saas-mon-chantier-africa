-- Vague 11 — Géolocalisation & cartes (tranche 1).
-- Rayon de livraison (km) des boutiques : sert au calcul de livraison « près de moi »
-- et à la couche cartes (cercles de livraison).

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS delivery_radius_km numeric(6, 2);

CREATE INDEX IF NOT EXISTS stores_delivery_radius_idx ON public.stores (delivery_radius_km);

COMMENT ON COLUMN public.stores.delivery_radius_km IS
  'Rayon de livraison en kilomètres autour de la boutique (NULL = non renseigné).';
