-- roles
do $$ begin
  create type public.app_role as enum ('admin','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- demo request lifecycle
do $$ begin
  create type public.demo_request_status as enum ('nouveau','contacte','planifie','traite','archive');
exception when duplicate_object then null; end $$;

alter table public.demo_requests
  add column if not exists status public.demo_request_status not null default 'nouveau',
  add column if not exists admin_notes text;

grant select, update, delete on public.demo_requests to authenticated;

drop policy if exists "admins read demo requests" on public.demo_requests;
create policy "admins read demo requests" on public.demo_requests
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update demo requests" on public.demo_requests;
create policy "admins update demo requests" on public.demo_requests
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete demo requests" on public.demo_requests;
create policy "admins delete demo requests" on public.demo_requests
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));