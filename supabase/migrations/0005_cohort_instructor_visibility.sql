-- A student needs to see the name of their own cohort's instructor (shown
-- on the profile page) — the existing profiles_select policy only covers
-- self, admins, and a mentor's own assigned students, so this read was
-- silently filtered to zero rows. Narrowly scoped: only the exact profile
-- acting as instructor_profile_id for a cohort the caller belongs to.
create policy profiles_select_cohort_instructor on profiles for select using (
  id in (
    select c.instructor_profile_id
    from cohorts c
    join cohort_members cm on cm.cohort_id = c.id
    where cm.profile_id = auth.uid() and c.instructor_profile_id is not null
  )
);
