drop policy if exists "admins read demo requests" on public.demo_requests;
create policy "admins read demo requests" on public.demo_requests
  for select to authenticated using (
    exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
  );

drop policy if exists "admins update demo requests" on public.demo_requests;
create policy "admins update demo requests" on public.demo_requests
  for update to authenticated
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'))
  with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "admins delete demo requests" on public.demo_requests;
create policy "admins delete demo requests" on public.demo_requests
  for delete to authenticated using (
    exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
  );

drop function if exists public.has_role(uuid, public.app_role);