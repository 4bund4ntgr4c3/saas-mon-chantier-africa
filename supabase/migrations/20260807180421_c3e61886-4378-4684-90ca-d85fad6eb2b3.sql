CREATE TABLE public.demo_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.demo_requests TO service_role;

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER demo_requests_updated
BEFORE UPDATE ON public.demo_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();