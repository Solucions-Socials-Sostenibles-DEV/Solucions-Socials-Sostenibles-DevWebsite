-- Enable RLS Read access for Anonymous Users on fichajes_codigos
-- This allows anyone to check if a code is valid (required for login-less clock-in)
create policy "Enable read access for anon users"
on public.fichajes_codigos
for select
to anon
using (true);

-- Enable RLS Insert access for Anonymous Users on fichajes
-- This allows creating clock-in entries without being logged in
create policy "Enable insert for anon users"
on public.fichajes
for insert
to anon
with check (true);

-- Enable RLS Read access for Anonymous Users on fichajes
-- This allows checking status (if clocked in) and getting ID for clock-out
-- Ideally, this should be restricted, but for initial implementation we allow public read
create policy "Enable read access for anon users"
on public.fichajes
for select
to anon
using (true);

-- Enable RLS Update access for Anonymous Users on fichajes
-- This allows clocking out
create policy "Enable update for anon users"
on public.fichajes
for update
to anon
using (true)
with check (true);

-- Enable RLS Insert access for Anonymous Users on fichajes_pausas
create policy "Enable insert for anon users"
on public.fichajes_pausas
for insert
to anon
with check (true);

-- Enable RLS Read access for Anonymous Users on fichajes_pausas
create policy "Enable read access for anon users"
on public.fichajes_pausas
for select
to anon
using (true);

-- Enable RLS Update access for Anonymous Users on fichajes_pausas
create policy "Enable update for anon users"
on public.fichajes_pausas
for update
to anon
using (true)
with check (true);