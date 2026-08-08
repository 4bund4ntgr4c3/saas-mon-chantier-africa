CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  record_id uuid,
  label text,
  amount_before numeric,
  amount_after numeric,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX audit_logs_user_created_idx ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX audit_logs_project_idx ON public.audit_logs (project_id);

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row jsonb;
  _user uuid;
  _project uuid;
  _entity text := TG_ARGV[0];
  _action text;
  _label text;
  _before numeric;
  _after numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _row := to_jsonb(OLD);
    _action := 'suppression';
  ELSIF TG_OP = 'UPDATE' THEN
    _row := to_jsonb(NEW);
    _action := 'modification';
  ELSE
    _row := to_jsonb(NEW);
    _action := 'creation';
  END IF;

  _user := NULLIF(_row->>'user_id', '')::uuid;
  IF _user IS NULL THEN _user := auth.uid(); END IF;
  IF _user IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  IF _row ? 'project_id' THEN
    _project := NULLIF(_row->>'project_id', '')::uuid;
  ELSIF _entity = 'projet' THEN
    _project := NULLIF(_row->>'id', '')::uuid;
  END IF;

  _label := COALESCE(_row->>'label', _row->>'title', _row->>'name', _row->>'reference');

  IF _entity = 'budget' THEN
    _before := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE (to_jsonb(OLD)->>'planned_amount')::numeric END;
    _after  := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE (to_jsonb(NEW)->>'planned_amount')::numeric END;
    IF TG_OP = 'UPDATE' AND _before IS NOT DISTINCT FROM _after THEN
      RETURN NEW;
    END IF;
  ELSIF _row ? 'amount' THEN
    _before := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE (to_jsonb(OLD)->>'amount')::numeric END;
    _after  := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE (to_jsonb(NEW)->>'amount')::numeric END;
  END IF;

  INSERT INTO public.audit_logs (user_id, project_id, action, entity, record_id, label, amount_before, amount_after, details)
  VALUES (_user, _project, _action, _entity, NULLIF(_row->>'id','')::uuid, _label, _before, _after,
          jsonb_build_object('op', TG_OP, 'row', _row));

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_audit_event() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER audit_budget_lines
AFTER INSERT OR UPDATE OR DELETE ON public.budget_lines
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('budget');

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('paiement');

CREATE TRIGGER audit_expenses_delete
AFTER DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('depense');

CREATE TRIGGER audit_quotes_delete
AFTER DELETE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('devis');

CREATE TRIGGER audit_site_logs_delete
AFTER DELETE ON public.site_logs
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('journal');

CREATE TRIGGER audit_projects_delete
AFTER DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('projet');

CREATE TRIGGER audit_suppliers_delete
AFTER DELETE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('fournisseur');

CREATE TRIGGER audit_companies_delete
AFTER DELETE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('entreprise');