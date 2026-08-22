# Security review

A manual review of the full application (not a diff-based review — this is a
long-running single-branch project with no PR/remote to diff against),
conducted at the end of the backend migration (Phase 13). Covers
authentication, authorization, injection classes, secrets handling,
transport security, and dependency vulnerabilities.

## Findings fixed during this review

### 1. Stored XSS via `javascript:` URI in project submission links (fixed)

`submitProjectFn`'s `repoUrl`/`liveUrl` inputs were validated with
`z.string().url()` (`liveUrl` wasn't even required to be a URL — the
`.url()` call was missing entirely). Zod's `.url()` only checks that a
string is syntactically a URL (`new URL(value)` doesn't throw); it does
**not** restrict the scheme, so `javascript:alert(document.cookie)` passed
validation and was stored as-is.

These values are rendered as `<a href>` in three places: the mentor's
review dialog (`_app.mentor.tsx`), the student's own portfolio editor
(`_app.portfolio.tsx`), and the student's **public** portfolio page
(`p.$slug.tsx`) once the project is approved. A submission with a
`javascript:` "live site" link would execute script in whoever clicked
it — most severely the reviewing mentor, or any anonymous visitor to the
student's public portfolio.

**Fix:** `src/lib/api/projects.functions.ts` now has an `httpUrl` schema
that parses the string as a URL and asserts `protocol` is `http:` or
`https:`, used for both `repoUrl` (required) and `liveUrl` (optional).
Covered by tests in `projects.functions.test.ts`.

**Not yet exploitable, but has the same shape:** `profiles.github_url` /
`linkedin_url` are rendered as `<a href>` in the same three places plus the
profile page, but there is currently no user-facing form that writes them
(`_app.settings.tsx` is a placeholder — see `docs/ARCHITECTURE.md`). Apply
the same `httpUrl`-style validation the moment that form is built.

### 2. Five high-severity dependency vulnerabilities (fixed)

`bun audit` flagged `brace-expansion` (DoS via unbounded expansion, via
eslint's `minimatch`), `js-yaml` (quadratic CPU consumption, via
`@tanstack/start-plugin-core`'s `xmlbuilder2`), and `nanoid` (infinite loop
on `size: 0`, via vite's `postcss`) — five advisories across three packages,
all dev/build-time transitive dependencies, not reachable through the
deployed app's runtime surface. Fixed with `bun audit fix` (in-range patch
bumps). `bun audit` now reports zero vulnerabilities.

### 3. Missing `Strict-Transport-Security` header (fixed)

`src/start.ts`'s security-headers middleware set `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`, but not HSTS.
Added `Strict-Transport-Security: max-age=31536000; includeSubDomains`. A
no-op over plain HTTP (local dev); meaningful once deployed behind HTTPS.

## Reviewed and confirmed sound (no changes needed)

- **Authorization boundary.** Every server function that touches private
  data has `authMiddleware`/`requireRole()` in its middleware chain — route
  `beforeLoad` guards are UX-only and were never relied on as the real
  boundary (see `docs/ARCHITECTURE.md`). Verified by reading every
  `*.functions.ts` file's export list against its middleware.
- **Role escalation.** `handle_new_user` (migration 0002) hardcodes
  `role = 'student'` server-side regardless of client-supplied signup
  metadata; `prevent_role_self_escalation` (migration 0003) additionally
  blocks any direct table update from changing `role` unless the caller is
  an admin or the service-role key.
- **RLS coverage.** All 22 tables have RLS enabled; spot-checked the policy
  set in `0003_rls_policies.sql` against the tables' actual read/write needs.
  Two real gaps were found and fixed in earlier phases (migrations `0005`,
  `0006`) via live testing, not this review — see `docs/DATABASE.md`'s note
  on RLS failures being silent (no error on an update matching zero rows).
- **Injection.** No raw SQL string interpolation anywhere; every query goes
  through the Supabase query builder (parameterized). No `.rpc()` calls
  exist. Grepped for dynamic filter-string construction (PostgREST operator
  injection via a crafted filter value) — none found; every `.eq()`/`.in()`
  argument that comes from user input is either a Zod-validated UUID/enum,
  or matched narrowly enough (project/subject slugs looked up by exact
  equality) that PostgREST filter syntax can't be smuggled through it.
- **XSS (general).** React escapes all text content by default. Only one
  `dangerouslySetInnerHTML` exists in the codebase
  (`src/components/ui/chart.tsx`, shadcn boilerplate for injecting a
  `<style>` block from a chart color config) — the component is unused
  anywhere in the app, and even if used, its input is a developer-authored
  config object, not user/DB data.
- **CSRF.** `createCsrfMiddleware` is explicitly re-enabled in
  `src/start.ts` (TanStack Start disables its automatic CSRF protection the
  moment a custom `start.ts` exists — this file re-adds it), scoped to every
  server function call.
- **Open redirect.** The `redirect` search param on `/login` is sanitized
  (`sanitizeRedirect` — must start with `/`, must not start with `//`)
  before being passed to `navigate({ to })`. Even without that check, the
  consumer is TanStack Router's client-side `navigate()`, not
  `window.location`, so the practical exploitability of a bypass here is
  low — the sanitization is genuinely defense-in-depth, not the only thing
  standing between this and an external redirect.
- **User enumeration.** The forgot-password flow shows the identical
  message ("If that email has an account, a reset link is on its way.")
  whether or not the email is registered.
- **Secrets handling.** `.env` is gitignored and was never committed
  (checked full git history, not just current state). `.env.example`
  contains only empty placeholders. `SUPABASE_SERVICE_ROLE_KEY` is read only
  in `.server.ts`-suffixed files and `scripts/seed.ts`, never in
  client-reachable code — enforced at build time by TanStack Start's
  import-protection plugin for the `.server.ts` suffix.
- **Demo credentials.** The dev test-account panel on `/login` (and the
  password string itself) is wrapped in `import.meta.env.DEV` — confirmed
  absent from an actual production build's output (`grep`'d `.output/` for
  both the password string and the component's variable name; zero
  matches).
- **Error message leakage.** `src/start.ts`'s `functionErrorMiddleware` and
  `errorMiddleware` both let `AppError`/`redirect`/`notFound` through
  untouched (these carry safe, pre-written messages) and replace anything
  else with a generic message after logging the real error server-side —
  so a raw Postgres/Supabase error or stack trace never reaches the client.
  The static SSR fallback error page (`src/lib/error-page.ts`) has no
  dynamic content interpolated into it either.
- **Password reset flow.** Uses Supabase's own recovery-session mechanism
  (`reset-password.tsx`); no custom token handling to get wrong.

## Known gaps / accepted risk for this MVP

These are documented trade-offs, not oversights — revisit before a larger or
less-trusted user base:

- **No application-level rate limiting** on authenticated mutations
  (check-in, project submission, review submission, portfolio updates).
  Supabase Auth rate-limits its own endpoints; custom server functions have
  none. Reasonable for an internal academy tool where every caller is
  already authenticated; add edge/platform-level rate limiting before
  broader exposure.
- **No Content-Security-Policy header.** Deliberately not added this
  session — this app's dependency surface (Radix UI, Tailwind, TanStack
  Router's injected hydration/stream scripts, `sonner` toasts) makes a
  correct CSP nontrivial to get right, and doing so without a real browser
  available to verify nothing broke was judged too risky to ship blind. Add
  one with live verification in a follow-up.
- **Password strength.** Sign-up enforces only Supabase Auth's default
  minimum (6 characters), matching the platform default rather than a
  custom stronger policy. Fine for an internal MVP; consider raising it
  (via Supabase Auth settings, not app code) before wider rollout.
- **No admin UI to change a user's role.** RLS already restricts role
  changes to admins/service-role correctly; there's just no admin-workspace
  control to exercise that capability yet (new mentors/admins currently
  require direct DB access or `scripts/seed.ts`).
