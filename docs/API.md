# API

There is no separate REST/GraphQL API — every "endpoint" is a TanStack Start
server function (`createServerFn`, in `src/lib/api/*.functions.ts`), called
from the frontend through the single `api` object exported by
`src/lib/api/index.ts`. Routes and components never import a
`*.functions.ts` file directly; they call `api.xxx(...)`.

Every function below runs its own authorization check via middleware (see
`docs/ARCHITECTURE.md`) — a route guard is not what protects these.
"Auth" in the tables means `authMiddleware` (any signed-in user); a specific
role means `requireRole("that role")`; "none" means callable without a
session.

## Authentication

Not server functions — the frontend calls Supabase Auth directly from the
browser (`src/lib/supabase/browser.ts`, anon/publishable key) in
`src/routes/login.tsx` and `reset-password.tsx`:

| Action                  | Call                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sign in                 | `supabaseBrowser.auth.signInWithPassword({ email, password })`                                                                                                                                         |
| Sign up                 | `supabaseBrowser.auth.signUp({ email, password, options: { data: { full_name } } })` — role is always `student`, hardcoded server-side by the `handle_new_user` trigger regardless of what's sent here |
| Request password reset  | `supabaseBrowser.auth.resetPasswordForEmail(email, { redirectTo })` — always shows the same "if that email has an account…" message, whether or not it does                                            |
| Complete password reset | on `reset-password.tsx`, via the recovery-flow session Supabase establishes from the emailed link                                                                                                      |
| Sign out                | `supabaseBrowser.auth.signOut()` (in `src/lib/session.tsx`)                                                                                                                                            |
| Change password         | `supabaseBrowser.auth.updateUser({ password })` (`_app.settings.tsx`) — Supabase itself rejects a new password equal to the old one; that error surfaces via the same toast as any other failure       |

`getCurrentUser` (`src/lib/auth/session.functions.ts`, no auth required to
call) resolves "who is signed in, if anyone" from the session cookie; it's
used once per request by `src/routes/__root.tsx`'s `beforeLoad` to populate
router context for route guards and the topbar. It is **not** itself a
protection boundary — it returns `null` rather than throwing when signed out.

## Student

| `api.` call                       | Auth        | File                      | Notes                                                                                                                                                                                                                                       |
| --------------------------------- | ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getStudent()` / `getDashboard()` | auth        | `student.functions.ts`    | Same function under two names (dashboard and profile pages want the same shape). Computes level title/XP-to-next-level (presentation only, not a progression system), attendance rate, overall progress, and a "continue learning" pointer. |
| `getTracks()`                     | auth        | `curriculum.functions.ts` | Tracks → subjects, with per-subject progress computed from `lesson_progress`.                                                                                                                                                               |
| `getSubject(slug)`                | auth        | `curriculum.functions.ts` | One subject's topics, each with a derived status (`completed`/`in-progress`/`locked`/`not-started`) — see `deriveStatus`.                                                                                                                   |
| `getLesson(subjectSlug, topicId)` | auth        | `curriculum.functions.ts` | `topicId` is a lesson slug.                                                                                                                                                                                                                 |
| `markLessonComplete(lessonId)`    | auth        | `curriculum.functions.ts` | Upserts `lesson_progress`.                                                                                                                                                                                                                  |
| `getSkills()` / `getActivity()`   | none (mock) | `src/data/student.ts`     | Out of scope for this MVP — see `docs/ARCHITECTURE.md`.                                                                                                                                                                                     |

## Attendance

| `api.` call                  | Auth | File                      | Notes                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ---- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getAttendance(year, month)` | auth | `attendance.functions.ts` | History + a month calendar view + a summary rate.                                                                                                                                                                                                                                                                 |
| `getUpcomingClasses()`       | auth | `attendance.functions.ts` | Next 5 sessions for the caller's cohort.                                                                                                                                                                                                                                                                          |
| `checkIn()`                  | auth | `attendance.functions.ts` | Takes no input — the "active" session is derived entirely server-side from the current time + the caller's cohort, never from a client-supplied session id. Writes via the service-role client (see `docs/ARCHITECTURE.md`). Throws `NO_ACTIVE_SESSION` (400) or `ALREADY_CHECKED_IN` (409) as named `AppError`s. |

## Practice

| `api.` call                            | Auth        | File                   | Notes                      |
| -------------------------------------- | ----------- | ---------------------- | -------------------------- |
| `getChallenges()` / `getChallenge(id)` | none (mock) | `src/data/practice.ts` | Out of scope for this MVP. |

## Projects

| `api.` call                                          | Auth | File                    | Notes                                                                                                                                                                                                                                                   |
| ---------------------------------------------------- | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getProjects()`                                      | auth | `projects.functions.ts` | Published projects, each with the caller's own submission status mapped onto a 4-state `Project.status`.                                                                                                                                                |
| `getProject(slug)`                                   | auth | `projects.functions.ts` | One project + the caller's submission + latest review feedback, if any.                                                                                                                                                                                 |
| `submitProject({ slug, repoUrl, liveUrl?, notes? })` | auth | `projects.functions.ts` | Upserts `project_submissions` (`onConflict: project_id,profile_id`), so resubmitting the same project overwrites rather than duplicates. `repoUrl`/`liveUrl` are validated to be http(s) URLs specifically (`httpUrl` schema) — see `docs/SECURITY.md`. |

## Achievements & certificates

| `api.` call             | Auth        | File                        | Notes                                                          |
| ----------------------- | ----------- | --------------------------- | -------------------------------------------------------------- |
| `getAchievements()`     | auth        | `achievements.functions.ts` | Full catalog, each flagged `earned`/`earnedAt` for the caller. |
| `getCertificates()`     | auth        | `achievements.functions.ts` | All certificates for the caller, `completed: !!issued_at`.     |
| `getLeaderboard(range)` | none (mock) | `src/data/gamification.ts`  | Out of scope for this MVP.                                     |

## Notifications

| `api.` call                  | Auth | File                         | Notes                                     |
| ---------------------------- | ---- | ---------------------------- | ----------------------------------------- |
| `getNotifications()`         | auth | `notifications.functions.ts` | Caller's own, newest first, capped at 30. |
| `markNotificationRead(id)`   | auth | `notifications.functions.ts` |                                           |
| `markAllNotificationsRead()` | auth | `notifications.functions.ts` |                                           |

## Portfolio

| `api.` call                                                   | Auth     | File                     | Notes                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getPortfolio()`                                              | auth     | `portfolio.functions.ts` | Own editable fields (headline/bio/publish state) + real earned content (approved projects, issued certificates, achievement count, cohort/track).                                                                                                                           |
| `updatePortfolio({ headline?, bio?, isPublic, publicSlug? })` | auth     | `portfolio.functions.ts` | Upserts `portfolio_profiles`. Rejects `isPublic: true` without a `publicSlug` (`ValidationError`). A duplicate `publicSlug` (unique constraint, Postgres code `23505`) is mapped to a friendly `ValidationError` ("That link is already taken") rather than a raw DB error. |
| `getPublicPortfolio(slug)`                                    | **none** | `portfolio.functions.ts` | The one function with no auth middleware at all — see `docs/ARCHITECTURE.md`'s note on `getPublicPortfolioFn`'s service-role usage. Throws `NotFoundError` if the slug doesn't exist or isn't published.                                                                    |

## Search

| `api.` call        | Auth | File                  | Notes                                                                                                                                                                                |
| ------------------ | ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getSearchIndex()` | auth | `search.functions.ts` | Backs the ⌘K command palette. Real subjects/topics (max 4 topics per subject)/published projects; challenges are added client-side from the practice mock (see `global-search.tsx`). |

## Settings

| `api.` call                                                                      | Auth | File                    | Notes                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getProfileSettings()`                                                           | auth | `settings.functions.ts` | Own editable profile fields (full name, bio, location, GitHub/LinkedIn URLs) plus email (from the auth user, not `profiles`).                                                                                |
| `updateProfileSettings({ fullName, bio?, location?, githubUrl?, linkedinUrl? })` | auth | `settings.functions.ts` | Updates `profiles`. `githubUrl`/`linkedinUrl` use the same `httpUrl` validator as project submission links — see `docs/SECURITY.md`. Password changes are not a server function; see "Authentication" above. |

## Mentor (`requireRole("mentor")`)

| `api.mentor.` call                                                      | File                  | Notes                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getOverview()`                                                         | `mentor.functions.ts` | The mentor's assigned cohort + per-student progress/attendance/approved-project counts, batched to avoid N+1.                                                                                                                                                                                                                           |
| `getPendingSubmissions()`                                               | `mentor.functions.ts` | Submissions in `submitted`/`under_review` from students in the mentor's cohort.                                                                                                                                                                                                                                                         |
| `submitReview({ submissionId, score, comment?, categories, decision })` | `mentor.functions.ts` | Inserts `project_reviews`, updates the submission's `status` to `decision`, and notifies the student. The `.select()` immediately before the insert IS the authorization check — RLS (`submissions_select`) already restricts it to the mentor's own assigned students, so a non-null result proves the mentor is allowed to review it. |

## Admin (`requireRole("admin")`)

| `api.admin.` call                             | File                 | Notes                                                                                                                                                                                                         |
| --------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getOverview()`                               | `admin.functions.ts` | Platform-wide counts/rates via batched count queries (students, mentors, cohorts, pending reviews, avg attendance, avg progress).                                                                             |
| `getCohorts()`                                | `admin.functions.ts` | Every cohort with instructor, assigned mentor, and student count.                                                                                                                                             |
| `getMentors()`                                | `admin.functions.ts` | Every mentor with their assigned cohort, student count, and pending-review count.                                                                                                                             |
| `assignMentor({ cohortId, mentorProfileId })` | `admin.functions.ts` | Sets or clears (`mentorProfileId: null`) a cohort's mentor. Treats assignment as one-mentor-per-cohort by replacing any existing `mentor_assignments` row, even though the schema itself allows many-to-many. |

There is currently no `api.admin.assignRole(...)` — see "Known limitations" in `docs/ARCHITECTURE.md`.
