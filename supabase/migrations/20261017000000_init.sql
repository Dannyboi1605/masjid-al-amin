create type public.app_role as enum ('admin', 'superadmin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  body text not null check (char_length(body) between 1 and 5000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  description text check (char_length(description) <= 5000),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table public.site_settings (
  id boolean primary key default true check (id),
  mosque_name text not null,
  address text,
  phone text,
  email text,
  prayer_zone text not null default 'SBH07',
  donation_qr_path text,
  donation_note text,
  updated_at timestamptz not null default now()
);

create table public.prayer_times_cache (
  zone text not null,
  year int not null,
  data jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (zone, year)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index announcements_created_at_idx
  on public.announcements (created_at desc);
create index events_starts_at_idx
  on public.events (starts_at);
create index audit_log_created_at_idx
  on public.audit_log (created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create function public.auth_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_role() in ('admin', 'superadmin'), false)
$$;

create function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_role() = 'superadmin', false)
$$;

create function public.block_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = new.id
     and (new.role is distinct from old.role
       or new.is_active is distinct from old.is_active) then
    raise exception 'Pengguna tidak boleh mengubah peranan atau status sendiri.';
  end if;
  return new;
end;
$$;

create trigger profiles_block_self_role_change
  before update on public.profiles
  for each row execute function public.block_self_role_change();

alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.site_settings enable row level security;
alter table public.prayer_times_cache enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_select_own_or_superadmin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_superadmin());

create policy "profiles_update_superadmin"
  on public.profiles for update
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "announcements_public_select"
  on public.announcements for select
  to anon, authenticated
  using (true);

create policy "announcements_admin_insert"
  on public.announcements for insert
  to authenticated
  with check (public.is_admin());

create policy "announcements_admin_update"
  on public.announcements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "announcements_admin_delete"
  on public.announcements for delete
  to authenticated
  using (public.is_admin());

create policy "events_public_select"
  on public.events for select
  to anon, authenticated
  using (true);

create policy "events_admin_insert"
  on public.events for insert
  to authenticated
  with check (public.is_admin());

create policy "events_admin_update"
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  to authenticated
  using (public.is_admin());

create policy "site_settings_public_select"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_superadmin_update"
  on public.site_settings for update
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "audit_log_superadmin_select"
  on public.audit_log for select
  to authenticated
  using (public.is_superadmin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'donation',
  'donation',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "donation_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'donation');

create policy "donation_superadmin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'donation' and public.is_superadmin());

create policy "donation_superadmin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'donation' and public.is_superadmin())
  with check (bucket_id = 'donation' and public.is_superadmin());

create policy "donation_superadmin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'donation' and public.is_superadmin());
