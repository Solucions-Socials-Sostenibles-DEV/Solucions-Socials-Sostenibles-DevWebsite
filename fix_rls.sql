-- Enable SELECT access for authenticated users (Admins)
create policy "Allow authenticated users to view messages"
on public.contact_messages
for select
to authenticated
using (true);
