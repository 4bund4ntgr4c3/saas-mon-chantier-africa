-- Vague 11 tranche 2 : géolocalisation des projets et prestataires,
-- suivi de livraison sur carte (position temps réel du transporteur).

-- Coordonnées des projets de chantier (carte des projets)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

-- Coordonnées des prestataires (recherche « près de moi »)
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

-- Position temps réel de la livraison (déplacements du transporteur)
ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS current_lat double precision,
  ADD COLUMN IF NOT EXISTS current_lng double precision,
  ADD COLUMN IF NOT EXISTS position_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS projects_geo_idx ON public.projects (lat, lng);
CREATE INDEX IF NOT EXISTS providers_geo_idx ON public.providers (lat, lng);
