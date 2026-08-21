-- Simple stored gamification facts (NOT an XP-awarding engine — section 39
-- of the product brief explicitly excludes building that yet). These are
-- just columns a future admin/awarding feature can update; nothing here
-- computes or increments them automatically.
alter table profiles
  add column xp integer not null default 0,
  add column level integer not null default 1,
  add column streak_days integer not null default 0;

-- Broaden the existing role-escalation guard to also cover these columns:
-- a student should not be able to grant themselves XP/levels any more than
-- they should be able to grant themselves a role, via a direct table write.
create or replace function public.prevent_role_self_escalation()
returns trigger as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if (new.role <> old.role or new.xp <> old.xp or new.level <> old.level or new.streak_days <> old.streak_days)
     and not public.is_admin() then
    raise exception 'Only admins may change role, xp, level or streak_days';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
