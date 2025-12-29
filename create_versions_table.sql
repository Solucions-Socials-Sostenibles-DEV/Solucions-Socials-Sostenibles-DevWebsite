-- Create table for app versions
create table if not exists public.app_versions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  app_name text not null,
  version text not null,
  file_url text not null
);

-- Enable RLS
alter table public.app_versions enable row level security;

-- Policies
-- 1. Everyone can view versions (to download)
create policy "Enable read access for all users"
on public.app_versions for select
using (true);

-- 2. Only Admins can insert (Authenticated)
create policy "Enable insert for authenticated users only"
on public.app_versions for insert
to authenticated
with check (true);

-- STORAGE POLICIES (If you execute this in SQL Editor)
-- Note: Buckets often need to be created in the UI, but policies can be set here if the bucket 'app-releases' exists.
-- Assuming bucket 'app-releases' is created:

-- Allow public read
-- (You usually set this via Bucket "Public" setting in UI)

-- Allow authenticated upload
-- create policy "Allow authenticated uploads"
-- on storage.objects for insert
-- to authenticated
-- with check (bucket_id = 'app-releases');
