-- Vague 8 — Notifications multi-canal
-- Notifications persistées + tokens d'appareils + préférences de canaux.

-- Canal de diffusion d'une notification.
CREATE TYPE public.notification_channel AS ENUM ('in_app', 'email', 'push', 'sms', 'whatsapp');

-- Type métier de la notification (utilisé pour cibler l'icône et le lien).
CREATE TYPE public.notification_kind AS ENUM (
  'alerte', 'commande', 'livraison', 'paiement', 'devis', 'rapport', 'litige', 'verification', 'assistant'
);

-- Notifications persistées de l'utilisateur.
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  kind public.notification_kind NOT NULL DEFAULT 'alerte',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS
  'Notifications persistées, multi-canal (in_app, e-mail, push, SMS, WhatsApp). '
  'Une notification est créée côté client et peut être marquée lue.';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications read own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications insert own" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications update own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications delete own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx
  ON public.notifications (user_id) WHERE read_at IS NULL;

-- Appareils abonnés aux notifications push.
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

COMMENT ON TABLE public.device_tokens IS
  'Tokens de notifications push enregistrés par appareil (web mobile-first / PWA).';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_tokens TO authenticated;
GRANT ALL ON public.device_tokens TO service_role;

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_tokens read own" ON public.device_tokens
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "device_tokens insert own" ON public.device_tokens
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "device_tokens update own" ON public.device_tokens
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "device_tokens delete own" ON public.device_tokens
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Préférences de canaux : on étend notification_preferences (déjà existante).
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS push_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT true;
