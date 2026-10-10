-- Migration 002: Job Verification, Classification & Technical SEO Improvements
-- Adds backward-compatible listing_type classification and indexation controls.

do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'jobs' and column_name = 'listing_type'
  ) then
    alter table public.jobs 
    add column listing_type text not null default 'awaiting_verification' 
    check (listing_type in ('verified_vacancy', 'career_portal_resource', 'awaiting_verification', 'expired_or_closed', 'rejected_or_invalid'));
  end if;
end $$;

-- Create index for quick filtering by listing type and active status
create index if not exists jobs_listing_type_idx on public.jobs(listing_type, is_active, published_at desc);

-- Classify known direct employer verified vacancies
update public.jobs
set listing_type = 'verified_vacancy'
where verified_at is not null 
  and is_active = true 
  and (expires_at is null or expires_at > now())
  and external_id not like 'intl-%'
  and external_id not like 'eu-%'
  and source not ilike '%lead%';

-- Classify known external career portal and directory leads
update public.jobs
set listing_type = 'career_portal_resource'
where (external_id like 'intl-%' or external_id like 'eu-%' or source ilike '%lead%' or title ilike '%opportunities%')
  and listing_type != 'expired_or_closed';

-- Classify expired jobs
update public.jobs
set listing_type = 'expired_or_closed', is_active = false
where expires_at is not null and expires_at <= now();
