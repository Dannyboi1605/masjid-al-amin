create table public.org_chart (
  id boolean primary key default true check (id),
  image_path text not null,
  image_width int not null check (image_width between 1 and 20000),
  image_height int not null check (image_height between 1 and 20000),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger org_chart_set_updated_at
  before update on public.org_chart
  for each row execute function public.set_updated_at();

alter table public.org_chart enable row level security;

create policy "org_chart_public_select"
  on public.org_chart for select
  to anon, authenticated
  using (true);

create policy "org_chart_admin_insert"
  on public.org_chart for insert
  to authenticated
  with check (public.is_admin());

create policy "org_chart_admin_update"
  on public.org_chart for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "org_chart_admin_delete"
  on public.org_chart for delete
  to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'org-chart',
  'org-chart',
  true,
  4194304,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "org_chart_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'org-chart');

create policy "org_chart_admin_insert_object"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'org-chart' and public.is_admin());

create policy "org_chart_admin_update_object"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'org-chart' and public.is_admin())
  with check (bucket_id = 'org-chart' and public.is_admin());

create policy "org_chart_admin_delete_object"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'org-chart' and public.is_admin());
