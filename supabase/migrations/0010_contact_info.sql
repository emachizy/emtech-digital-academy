-- Site-wide contact info shown on the public /contact page, editable by an
-- admin. A true singleton: always exactly one row, addressed by a fixed id
-- rather than "the first row" so concurrent admin edits can't create a
-- second one.
create table contact_info (
  id uuid primary key,
  email text,
  phone text,
  hours text,
  address text,
  updated_at timestamptz not null default now()
);

create trigger contact_info_set_updated_at
  before update on contact_info
  for each row execute function set_updated_at();

alter table contact_info enable row level security;

-- Genuinely public content — readable by anyone, including a signed-out
-- visitor on the /contact page (a plain `using (true)` policy, unlike
-- portfolio_profiles' per-row is_public flag, since this is unconditionally
-- public marketing content, not something with a private/public toggle).
create policy contact_info_select on contact_info for select using (true);
create policy contact_info_write on contact_info for all using (is_admin()) with check (is_admin());

insert into contact_info (id, email, phone, hours, address) values (
  '00000000-0000-0000-0000-000000000001',
  'info@emtechdigitalacademy.com.ng',
  '+234 000 000 0000',
  'Monday – Friday: 9:00am – 6:00pm',
  'Lagos, Nigeria'
);
