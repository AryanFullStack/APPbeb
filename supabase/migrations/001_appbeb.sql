-- AppBeb v1 schema. Resume contents and uploaded documents are deliberately absent.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  source text not null,
  title text not null,
  company text,
  location text,
  category_id uuid references public.categories(id) on delete set null,
  employment_type text,
  work_mode text,
  description text not null,
  skills text[] not null default '{}',
  application_url text not null,
  published_at timestamptz not null,
  expires_at timestamptz,
  verified_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source, external_id)
);
create index if not exists jobs_active_published_idx on public.jobs(is_active, published_at desc);
create index if not exists jobs_location_idx on public.jobs(location);

create table if not exists public.career_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('page_view', 'job_search', 'job_detail_view', 'outbound_application_click')),
  path text,
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at desc);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.jobs enable row level security;
alter table public.career_guides enable row level security;
alter table public.seo_settings enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "public can read categories" on public.categories;
create policy "public can read categories" on public.categories for select using (true);
drop policy if exists "public can read active jobs" on public.jobs;
create policy "public can read active jobs" on public.jobs for select using (is_active = true and (expires_at is null or expires_at > now()));
drop policy if exists "public can read published guides" on public.career_guides;
create policy "public can read published guides" on public.career_guides for select using (status = 'published');
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage jobs" on public.jobs for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage guides" on public.career_guides for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage seo" on public.seo_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read analytics" on public.analytics_events for select using (public.is_admin());
create policy "users read own profile" on public.profiles for select using (id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.jobs, public.career_guides to anon, authenticated;
grant all on public.categories, public.jobs, public.career_guides, public.seo_settings to authenticated;
grant select on public.analytics_events to authenticated;
