-- Vague 5 — Litiges (disputes) et remboursements (refunds).
-- Workflow de médiation : un utilisateur ouvre un litige sur un besoin/une commande,
-- dépose des preuves, un administrateur rend une décision, puis un remboursement
-- peut être émis et suivi.

/* ---------- Litiges ---------- */

CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ref text NOT NULL,
  subject text NOT NULL,
  description text,
  related_type text,
  related_id uuid,
  amount numeric(14,2),
  status text NOT NULL DEFAULT 'ouverte',
  decision text,
  decision_note text,
  decided_by uuid REFERENCES auth.users(id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS disputes_user_idx
  ON public.disputes (user_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx
  ON public.disputes (status);

/* ---------- Preuves ---------- */

CREATE TABLE IF NOT EXISTS public.dispute_evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  note text,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dispute_evidences_dispute_idx
  ON public.dispute_evidences (dispute_id);

/* ---------- Remboursements ---------- */

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'mobile_money',
  status text NOT NULL DEFAULT 'initie',
  reference text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refunds_dispute_idx
  ON public.refunds (dispute_id);
CREATE INDEX IF NOT EXISTS refunds_user_idx
  ON public.refunds (user_id);

/* ---------- RLS ---------- */

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dispute_evidences TO authenticated;
GRANT ALL ON public.dispute_evidences TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;

-- Litiges : lisibles par tous les connectés (médiation transparente),
-- modifiables par le propriétaire ou un administrateur (décision de médiation).
CREATE POLICY "disputes read all" ON public.disputes FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "disputes insert own" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "disputes update owner or admin" ON public.disputes FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );
CREATE POLICY "disputes delete owner or admin" ON public.disputes FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );

-- Preuves : lisibles par l'auteur, le propriétaire du litige ou un admin ;
-- écriture réservée à l'auteur.
CREATE POLICY "evidences read owner or dispute or admin" ON public.dispute_evidences FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = dispute_evidences.dispute_id
        AND (d.user_id = auth.uid()
             OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
    )
  );
CREATE POLICY "evidences insert own" ON public.dispute_evidences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "evidences delete own" ON public.dispute_evidences FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Remboursements : visibles par l'auteur ou un admin ; écriture réservée à l'auteur (initié)
-- et aux admins (statut de traitement).
CREATE POLICY "refunds read owner or admin" ON public.refunds FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );
CREATE POLICY "refunds insert own" ON public.refunds FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "refunds update owner or admin" ON public.refunds FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );
CREATE POLICY "refunds delete owner or admin" ON public.refunds FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  );

/* ---------- Trigger : updated_at ---------- */

CREATE OR REPLACE FUNCTION public.touch_dispute()
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

DROP TRIGGER IF EXISTS disputes_touch ON public.disputes;
CREATE TRIGGER disputes_touch
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.touch_dispute();

CREATE OR REPLACE FUNCTION public.touch_refund()
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

DROP TRIGGER IF EXISTS refunds_touch ON public.refunds;
CREATE TRIGGER refunds_touch
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW EXECUTE FUNCTION public.touch_refund();