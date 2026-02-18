-- Create table for managing employee clock-in codes
create table if not exists public.fichajes_codigos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  codigo text not null,
  empleado_id text not null,
  descripcion text,
  activo boolean default true,
  created_by uuid references auth.users(id),
  
  constraint fichajes_codigos_codigo_key unique (codigo)
);

-- Recommended indexes
create index if not exists fichajes_codigos_codigo_idx on public.fichajes_codigos (codigo);
create index if not exists fichajes_codigos_empleado_id_idx on public.fichajes_codigos (empleado_id);

-- Enable RLS (Recommended for security, though specific policies depend on requirements)
alter table public.fichajes_codigos enable row level security;

-- Policy to allow authenticated users to read (needed for admin view & potentially clock-in check)
create policy "Enable read access for authenticated users"
on public.fichajes_codigos
for select
to authenticated
using (true);

-- Policy to allow authenticated users (or specific roles) to insert/update/delete
-- Adjust this based on your role system. For now, allowing authenticated users as per instructions "visible para todos los roles pero que requiera de login"
create policy "Enable insert for authenticated users"
on public.fichajes_codigos
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users"
on public.fichajes_codigos
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users"
on public.fichajes_codigos
for delete
to authenticated
using (true);
