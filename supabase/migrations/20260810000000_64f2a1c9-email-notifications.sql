-- Notifications e-mail (Resend) : préférences par utilisateur + journal des envois.

CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  alerts_enabled boolean NOT NULL DEFAULT true,
  alert_due_payments boolean NOT NULL DEFAULT true,
  alert_late_payments boolean NOT NULL DEFAULT true,
  alert_budget boolean NOT NULL DEFAULT true,
  alert_documents boolean NOT NULL DEFAULT true,
  alert_projects boolean NOT NULL DEFAULT true,
  weekly_digest boolean NOT NULL DEFAULT true,
  last_digest_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_prefs read own" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notification_prefs insert own" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notification_prefs update own" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notification_prefs delete own" ON public.notification_preferences
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  items integer NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now(),
  details jsonb
);

GRANT SELECT, INSERT ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_log read own" ON public.email_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "email_log insert own" ON public.email_log
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX email_log_user_kind_sent_idx ON public.email_log (user_id, kind, sent_at DESC);

-- Crée aussi les préférences par défaut à l'inscription d'un nouvel utilisateur.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _type public.account_type;
BEGIN
  BEGIN
    _type := COALESCE((new.raw_user_meta_data->>'account_type')::public.account_type, 'particulier');
  EXCEPTION WHEN others THEN
    _type := 'particulier';
  END;

  INSERT INTO public.profiles (id, full_name, phone, account_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', _type);

  INSERT INTO public.notification_preferences (user_id) VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  END IF;

  PERFORM public.seed_demo_data(new.id);

  RETURN new;
END;
$function$;