-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- Seed shared default construction categories
insert into public.categories (name, slug, phase, sort_order, user_id)
select v.name, v.slug, v.phase, v.sort_order, null
from (values
  ('Terrassement',           'terrassement',    'Phase 01 — Terrassement',  1),
  ('Démolition / déblaiement','demolition',       'Phase 01 — Terrassement',  2),
  ('Fondations',              'fondations',       'Phase 02 — Fondations',    3),
  ('Assainissement',          'assainissement',  'Phase 02 — Fondations',    4),
  ('Gros œuvre / maçonnerie', 'gros-oeuvre',      'Phase 03 — Élévation',     5),
  ('Charpente',               'charpente',        'Phase 04 — Charpente',     6),
  ('Toiture & étanchéité',    'toiture',          'Phase 04 — Charpente',     7),
  ('Électricité',             'electricite',      'Phase 05 — Finitions',     8),
  ('Plomberie',               'plomberie',        'Phase 05 — Finitions',     9),
  ('Menuiserie',              'menuiserie',       'Phase 05 — Finitions',    10),
  ('Carrelage / revêtement',  'carrelage',        'Phase 05 — Finitions',    11),
  ('Peinture',                'peinture',         'Phase 05 — Finitions',    12),
  ('Main d''œuvre',           'main-d-oeuvre',   'Phase 06 — Divers',        13),
  ('Transport / location',     'transport',        'Phase 06 — Divers',       14),
  ('Divers',                  'divers',           'Phase 06 — Divers',       15)
) as v(name, slug, phase, sort_order)
where not exists (select 1 from public.categories c where c.slug = v.slug);