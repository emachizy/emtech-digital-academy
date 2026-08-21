-- Row Level Security.
--
-- Defense-in-depth: the TanStack Start server routes are the primary
-- authorization boundary (they re-check the caller's role from their own
-- session before doing anything privileged), but every table also enforces
-- RLS so a leaked anon/publishable key, or a bug in a server route that uses
-- a user-scoped client instead of the service-role client, cannot expose or
-- mutate rows the caller shouldn't touch.
--
-- Helper functions run as SECURITY DEFINER so they can read `profiles`
-- without recursing into the RLS policies defined on `profiles` itself.

create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable set search_path = public;

create or replace function public.is_mentor()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor');
$$ language sql security definer stable set search_path = public;

create or replace function public.mentor_cohort_ids()
returns setof uuid as $$
  select cohort_id from public.mentor_assignments where mentor_profile_id = auth.uid();
$$ language sql security definer stable set search_path = public;

-- True if `target_profile` is a student in a cohort the calling mentor is assigned to.
create or replace function public.is_assigned_student(target_profile uuid)
returns boolean as $$
  select exists (
    select 1 from public.cohort_members cm
    where cm.profile_id = target_profile
      and cm.cohort_id in (select public.mentor_cohort_ids())
  );
$$ language sql security definer stable set search_path = public;

-- A profile's own role may only change when the caller is an admin, or when
-- the update is performed by our server route using the service-role key
-- (auth.role() = 'service_role', which has no meaningful auth.uid()/session
-- and must be trusted at the application layer instead). Client-side
-- attempts to self-promote via a direct table update are rejected here even
-- if a route accidentally used a user-scoped client.
create or replace function public.prevent_role_self_escalation()
returns trigger as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only admins may change a profile role';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function public.prevent_role_self_escalation();

alter table profiles enable row level security;
alter table cohorts enable row level security;
alter table cohort_members enable row level security;
alter table mentor_assignments enable row level security;
alter table tracks enable row level security;
alter table subjects enable row level security;
alter table topics enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table class_sessions enable row level security;
alter table attendance_records enable row level security;
alter table practice_challenges enable row level security;
alter table challenge_attempts enable row level security;
alter table projects enable row level security;
alter table project_submissions enable row level security;
alter table project_reviews enable row level security;
alter table achievements enable row level security;
alter table student_achievements enable row level security;
alter table certificates enable row level security;
alter table notifications enable row level security;
alter table announcements enable row level security;
alter table portfolio_profiles enable row level security;

-- profiles ------------------------------------------------------------
create policy profiles_select on profiles for select using (
  id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(id))
);
create policy profiles_update on profiles for update using (
  id = auth.uid() or is_admin()
);
create policy profiles_insert on profiles for insert with check (is_admin());
create policy profiles_delete on profiles for delete using (is_admin());

-- cohorts ---------------------------------------------------------------
create policy cohorts_select on cohorts for select using (auth.uid() is not null);
create policy cohorts_write on cohorts for all using (is_admin()) with check (is_admin());

-- cohort_members ----------------------------------------------------------
create policy cohort_members_select on cohort_members for select using (
  profile_id = auth.uid() or is_admin() or cohort_id in (select mentor_cohort_ids())
);
create policy cohort_members_write on cohort_members for all using (is_admin()) with check (is_admin());

-- mentor_assignments --------------------------------------------------------
create policy mentor_assignments_select on mentor_assignments for select using (
  mentor_profile_id = auth.uid() or is_admin()
);
create policy mentor_assignments_write on mentor_assignments for all using (is_admin()) with check (is_admin());

-- tracks / subjects / topics (public curriculum metadata) -------------------
create policy tracks_select on tracks for select using (auth.uid() is not null);
create policy tracks_write on tracks for all using (is_admin()) with check (is_admin());

create policy subjects_select on subjects for select using (auth.uid() is not null);
create policy subjects_write on subjects for all using (is_admin()) with check (is_admin());

create policy topics_select on topics for select using (auth.uid() is not null);
create policy topics_write on topics for all using (is_admin()) with check (is_admin());

-- lessons ---------------------------------------------------------------
create policy lessons_select on lessons for select using (
  published or is_admin() or is_mentor()
);
create policy lessons_write on lessons for all using (is_admin()) with check (is_admin());

-- lesson_progress ---------------------------------------------------------
create policy lesson_progress_select on lesson_progress for select using (
  profile_id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(profile_id))
);
create policy lesson_progress_upsert on lesson_progress for insert with check (
  profile_id = auth.uid() or is_admin()
);
create policy lesson_progress_update on lesson_progress for update using (
  profile_id = auth.uid() or is_admin()
);
create policy lesson_progress_delete on lesson_progress for delete using (is_admin());

-- class_sessions ----------------------------------------------------------
create policy class_sessions_select on class_sessions for select using (
  is_admin()
  or cohort_id in (select mentor_cohort_ids())
  or cohort_id in (select cohort_id from cohort_members where profile_id = auth.uid())
);
create policy class_sessions_write on class_sessions for all using (
  is_admin() or cohort_id in (select mentor_cohort_ids())
) with check (
  is_admin() or cohort_id in (select mentor_cohort_ids())
);

-- attendance_records --------------------------------------------------------
-- No insert policy for plain authenticated users: check-in requires
-- validating session window + cohort membership + duplicate prevention,
-- which is business logic that lives in the check-in server route. That
-- route uses the service-role client (bypasses RLS) after validating.
create policy attendance_select on attendance_records for select using (
  profile_id = auth.uid()
  or is_admin()
  or class_session_id in (
    select id from class_sessions where cohort_id in (select mentor_cohort_ids())
  )
);
create policy attendance_write on attendance_records for update using (
  is_admin() or class_session_id in (
    select id from class_sessions where cohort_id in (select mentor_cohort_ids())
  )
);
create policy attendance_delete on attendance_records for delete using (is_admin());

-- practice_challenges -------------------------------------------------------
create policy challenges_select on practice_challenges for select using (
  published or is_admin()
);
create policy challenges_write on practice_challenges for all using (is_admin()) with check (is_admin());

-- challenge_attempts --------------------------------------------------------
create policy challenge_attempts_select on challenge_attempts for select using (
  profile_id = auth.uid() or is_admin()
);
create policy challenge_attempts_upsert on challenge_attempts for insert with check (
  profile_id = auth.uid() or is_admin()
);
create policy challenge_attempts_update on challenge_attempts for update using (
  profile_id = auth.uid() or is_admin()
);
create policy challenge_attempts_delete on challenge_attempts for delete using (is_admin());

-- projects ----------------------------------------------------------------
create policy projects_select on projects for select using (
  published or is_admin() or is_mentor()
);
create policy projects_write on projects for all using (is_admin()) with check (is_admin());

-- project_submissions -------------------------------------------------------
create policy submissions_select on project_submissions for select using (
  profile_id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(profile_id))
);
create policy submissions_insert on project_submissions for insert with check (
  profile_id = auth.uid() or is_admin()
);
create policy submissions_update on project_submissions for update using (
  profile_id = auth.uid() or is_admin()
);
create policy submissions_delete on project_submissions for delete using (is_admin());

-- project_reviews -----------------------------------------------------------
create policy reviews_select on project_reviews for select using (
  is_admin()
  or reviewer_profile_id = auth.uid()
  or submission_id in (select id from project_submissions where profile_id = auth.uid())
  or submission_id in (
    select id from project_submissions where is_assigned_student(profile_id)
  )
);
create policy reviews_insert on project_reviews for insert with check (
  is_admin()
  or (is_mentor() and submission_id in (
    select id from project_submissions where is_assigned_student(profile_id)
  ))
);
create policy reviews_update on project_reviews for update using (
  is_admin() or reviewer_profile_id = auth.uid()
);
create policy reviews_delete on project_reviews for delete using (is_admin());

-- achievements / student_achievements / certificates -------------------------
create policy achievements_select on achievements for select using (auth.uid() is not null);
create policy achievements_write on achievements for all using (is_admin()) with check (is_admin());

create policy student_achievements_select on student_achievements for select using (
  profile_id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(profile_id))
);
create policy student_achievements_write on student_achievements for all using (is_admin()) with check (is_admin());

create policy certificates_select on certificates for select using (
  profile_id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(profile_id))
);
create policy certificates_write on certificates for all using (is_admin()) with check (is_admin());

-- notifications -------------------------------------------------------------
create policy notifications_select on notifications for select using (
  profile_id = auth.uid() or is_admin()
);
create policy notifications_insert on notifications for insert with check (
  is_admin() or is_mentor()
);
create policy notifications_update on notifications for update using (
  profile_id = auth.uid() or is_admin()
);
create policy notifications_delete on notifications for delete using (
  profile_id = auth.uid() or is_admin()
);

-- announcements ---------------------------------------------------------
create policy announcements_select on announcements for select using (
  is_admin()
  or audience = 'all'
  or (audience = 'mentors' and is_mentor())
  or (audience = 'user' and target_profile_id = auth.uid())
  or (audience = 'cohort' and cohort_id in (
    select cohort_id from cohort_members where profile_id = auth.uid()
  ))
);
create policy announcements_write on announcements for all using (
  is_admin() or is_mentor()
) with check (
  is_admin() or is_mentor()
);

-- portfolio_profiles ----------------------------------------------------
create policy portfolio_select on portfolio_profiles for select using (
  is_public or profile_id = auth.uid() or is_admin()
);
create policy portfolio_upsert on portfolio_profiles for insert with check (
  profile_id = auth.uid() or is_admin()
);
create policy portfolio_update on portfolio_profiles for update using (
  profile_id = auth.uid() or is_admin()
);
create policy portfolio_delete on portfolio_profiles for delete using (is_admin());
