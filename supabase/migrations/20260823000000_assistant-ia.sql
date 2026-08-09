-- Vague 7 — IA.
-- 1. Assistant conversationnel par rôle : ai_conversations (fils de discussion persistés).
-- 2. Actions suggérées par l'assistant : ai_actions (type + payload JSONB).
-- Le moteur de réponses reste applicatif (règles sur les données réelles, lib/data.ts),
-- cohérent avec le « Conseiller de chantier » existant (component ai-conseiller.tsx).

DO $$ BEGIN
  CREATE TYPE public.ai_action_type AS ENUM ('achat', 'finance', 'planning', 'document', 'recommandation', 'autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_conversations_user_idx ON public.ai_conversations (user_id, updated_at DESC);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;

CREATE POLICY "ai_conversations read own" ON public.ai_conversations FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "ai_conversations insert own" ON public.ai_conversations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "ai_conversations update own" ON public.ai_conversations FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "ai_conversations delete own" ON public.ai_conversations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.ai_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type public.ai_action_type NOT NULL DEFAULT 'autre',
  title text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_actions_conversation_idx ON public.ai_actions (conversation_id, created_at DESC);

ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_actions TO authenticated;
GRANT ALL ON public.ai_actions TO service_role;

CREATE POLICY "ai_actions read own" ON public.ai_actions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "ai_actions insert own" ON public.ai_actions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "ai_actions update own" ON public.ai_actions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "ai_actions delete own" ON public.ai_actions FOR DELETE TO authenticated
  USING (user_id = auth.uid());