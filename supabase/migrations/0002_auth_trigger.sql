-- Auto-create a profile row whenever a Supabase Auth user is created.
--
-- SECURITY: role is always hardcoded to 'student' here, regardless of any
-- metadata the client sent at sign-up time. raw_user_meta_data is
-- client-controlled, so trusting a "role" field from it would let anyone
-- self-promote to admin/mentor. Promoting a user to mentor/admin is a
-- separate, admin-only, service-role operation performed after the row
-- exists (see scripts/seed.ts and the future admin "manage mentors" API).
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
