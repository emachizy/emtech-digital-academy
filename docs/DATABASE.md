# Database

Postgres via Supabase. Schema and policies live in `supabase/migrations/`, applied in order:

| Migration | Purpose |
|---|---|
| `0001_init_schema.sql` | Full schema: identity/roles, curriculum, attendance, practice, projects, achievements/certificates, notifications/announcements, portfolio. |
| `0002_auth_trigger.sql` | Auto-creates a `profiles` row on Supabase Auth user creation, hardcoding `role = 'student'` regardless of client-supplied signup metadata. |
| `0003_rls_policies.sql` | Enables RLS on every table and defines all policies + the `is_admin()`/`is_mentor()`/`mentor_cohort_ids()`/`is_assigned_student()` helper functions and the role-escalation-prevention trigger. |
| `0004_profile_stats.sql` | Adds `xp`, `level`, `streak_days` columns to `profiles`. |
| `0005_cohort_instructor_visibility.sql` | Adds `profiles_select_cohort_instructor` — closes a gap where a student couldn't read the name of their own cohort's instructor. |
| `0006_mentor_submission_review_update.sql` | Adds the assigned-mentor case to `submissions_update` — closes a gap where a mentor's review inserted correctly but never actually transitioned the submission's status. |

Apply them in order against a fresh database with `psql "$DATABASE_URL" -f supabase/migrations/000N_*.sql` (or via the Supabase SQL editor / CLI). `scripts/seed.ts` (`bun run db:seed`) populates dev-only content afterward — see `docs/DEPLOYMENT.md`.

## Schema

### Identity & roles
- **`profiles`** — one row per `auth.users` row (same `id`, FK on delete cascade). `role` is `student | mentor | admin`, checked at the DB level. `xp`/`level`/`streak_days`/`bio`/`location`/`github_url`/`linkedin_url` live here.
- **`cohorts`** — a cohort/class (`code`, `period_label`, `instructor_profile_id`).
- **`cohort_members`** — join table, one student profile per cohort (a student is never in more than one cohort in the current UI, though the schema doesn't enforce that).
- **`mentor_assignments`** — join table, mentor profile ↔ cohort. Schema allows many-to-many; the admin UI (`admin.functions.ts`'s `assignMentorFn`) treats it as one-mentor-per-cohort by replacing any existing row rather than adding to it.

### Curriculum
- **`tracks`** → **`subjects`** → **`topics`** → **`lessons`** (strict hierarchy, each with `order_index`). A "topic" in the frontend's UI is represented by its first associated lesson (see `deriveStatus`/`getSubjectFn` in `curriculum.functions.ts`) — topics with multiple lessons aren't a case the UI handles today.
- **`lesson_progress`** — one row per (profile, lesson), `status: not_started | in_progress | completed`. This is the *only* source of truth for a student's progress; percentages/completion counts are always computed from it at query time, never stored redundantly.

### Attendance
- **`class_sessions`** — belongs to a cohort, has a time window (`starts_at`/`ends_at`).
- **`attendance_records`** — one row per (session, profile). No INSERT policy for regular users — see `checkInFn` in `attendance.functions.ts`.

### Practice (schema exists, not yet wired to real functions)
- **`practice_challenges`**, **`challenge_attempts`** — RLS is in place, but no `*.functions.ts` reads/writes these yet; the frontend still uses `src/data/practice.ts` mocks (see `docs/ARCHITECTURE.md`'s known limitations).

### Projects
- **`projects`** — content is JSONB-heavy (`requirements`, `objectives`, `instructions`, `technologies`, `resources`, `submission_requirements`, `rubric`) rather than normalized into more tables, since none of it needs to be queried/filtered independently.
- **`project_submissions`** — one row per (project, profile) — a student re-submitting the same project upserts this row rather than creating a new one. `status` is the granular lifecycle (`draft → submitted/under_review → approved/rejected`, or `changes_requested` looping back); the frontend's simpler 4-state `Project.status` is derived from this, not stored.
- **`project_reviews`** — append-only history of mentor reviews against a submission; a submission can have more than one review over its lifecycle (e.g. changes requested, then approved on resubmission).

### Achievements & certificates
- **`achievements`** (catalog) + **`student_achievements`** (earned, join table).
- **`certificates`** — `progress`/`issued_at` per profile; `issued_at is not null` is what "actually earned" means (used to filter the portfolio's certificate list, deliberately excluding in-progress ones).

### Notifications & announcements
- **`notifications`** — per-profile, `read` boolean.
- **`announcements`** — schema exists (audience targeting: `all`/`cohort`/`mentors`/`user`) but, like `practice_challenges`, has no wiring function yet.

### Portfolio
- **`portfolio_profiles`** — one row per profile (`profile_id` is the primary key, not a surrogate one), `headline`/`bio` (distinct from `profiles.bio` — a portfolio-specific override), `is_public`, `public_slug` (globally unique). See `portfolio.functions.ts`.

## Row Level Security model

Every table has RLS enabled. The general pattern, with variations noted per table above and in `0003_rls_policies.sql` directly:

- **Admins** (`is_admin()`) can read and write everything.
- **A user can always read/write their own rows** (`profile_id = auth.uid()` or equivalent).
- **A mentor can read (never write, except reviews/submission status) an assigned student's rows** (`is_mentor() and is_assigned_student(profile_id)`), where "assigned" means the student is in a cohort the mentor is in `mentor_assignments` for.
- **Public/catalog data** (`tracks`, `subjects`, `topics`, `achievements`) is readable by any authenticated user, writable only by admins.
- A few tables have **no INSERT policy for regular users at all** — `attendance_records` — because the business rule for "is this insert valid" (session window, cohort membership, de-duplication) can't be expressed as a row-ownership check. Those go through a service-role client after the server function validates in code (see `checkInFn`).

The four helper functions (`is_admin`, `is_mentor`, `mentor_cohort_ids`, `is_assigned_student`) are `SECURITY DEFINER` so they can read `profiles`/`mentor_assignments`/`cohort_members` without recursing into those tables' own RLS policies.

### A footgun worth knowing about: RLS failures are silent

An `UPDATE` that RLS filters down to zero matching rows returns success with
no error — not a thrown exception, not a non-2xx status. This bit us twice
while building this app (notifications mark-read investigated a false alarm
of this shape; a mentor's review genuinely didn't transition the submission
status because of it — fixed in migration `0006`). **Always verify a write
actually changed something** you can independently check (row count,
`updated_at`, or a follow-up read) when writing or reviewing a new mutation
against RLS-protected tables — a green "no error" response is not proof the
row was touched.

## PostgREST embed ambiguity

When a table has more than one relationship path to another table — direct
FK plus one or more many-to-many joins through other tables — a
`.select("thing:other_table(...)")` embed throws `PGRST201` ("more than one
relationship was found") unless the FK is named explicitly:
`.select("thing:other_table!fk_constraint_name(...)")`. This bit
`getCohortsFn` in `admin.functions.ts` (`cohorts` has a direct FK to
`profiles` via `instructor_profile_id`, plus indirect paths through
`cohort_members` and `mentor_assignments`) — fixed with
`profiles!cohorts_instructor_profile_id_fkey`. Worth checking for this
specifically any time a new embed is added on a table with more than one
relationship to the same target table; there is no TypeScript generated-types
layer in this project to catch it at compile time (see below).

## No generated database types

Supabase's typed client (`supabase gen types typescript`) was never wired
up. Every `.select()` result is effectively `any`/loosely typed and cast
manually (`as unknown as SomeRow[]`) at each call site — this is why the
"live-verify against the real project" discipline (curl/psql checks against
ground truth) matters more here than in a typed setup: a passing
`tsc --noEmit` does not prove a query's shape or an RLS policy is correct.
