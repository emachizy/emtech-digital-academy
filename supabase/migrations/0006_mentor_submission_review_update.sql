-- A mentor could already INSERT a project_reviews row for an assigned
-- student's submission (submissions_select + reviews_insert both already
-- allowed for is_mentor() + is_assigned_student()), but submissions_update
-- only allowed the submission's owner or an admin to update the
-- project_submissions row itself — so a mentor's review never actually
-- transitioned the submission's status (approved/changes_requested/
-- rejected). The write silently affected 0 rows (no RLS error), so the
-- review recorded successfully while the submission stayed "submitted".
-- Found via live testing in Phase 9; fixing the policy, not the app code.
drop policy submissions_update on project_submissions;
create policy submissions_update on project_submissions for update using (
  profile_id = auth.uid() or is_admin() or (is_mentor() and is_assigned_student(profile_id))
);
