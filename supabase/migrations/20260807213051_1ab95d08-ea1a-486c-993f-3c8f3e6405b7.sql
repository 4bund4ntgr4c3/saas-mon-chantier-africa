DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('particulier', 'maitre_oeuvre', 'entreprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type public.account_type NOT NULL DEFAULT 'particulier';

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

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  END IF;

  PERFORM public.seed_demo_data(new.id);

  RETURN new;
END;
$function$;