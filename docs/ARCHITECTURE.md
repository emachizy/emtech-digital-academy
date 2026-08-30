# Architecture

Emtech Digital Academy is a TanStack Start application (React 19 + TanStack Router/Query,
server-rendered, deployed as a single Cloudflare Worker by default) backed by
Supabase (Postgres + Auth). It started as a Lovable-generated frontend
prototype running entirely on mock data in `src/data/*`; that prototype's
UI/UX was preserved throughout, and its data layer was replaced underneath it
one domain at a time (Phases 1–12 in the git history) with real
authentication, a normalized Postgres schema, and Row Level Security.

## Stack

| Layer                 | Choice                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| Framework             | TanStack Start (Vite-based, SSR, file-based routing via TanStack Router) |
| Data fetching / cache | TanStack Query                                                           |
| Database              | Postgres via Supabase                                                    |
| Auth                  | Supabase Auth, cookie-based sessions via `@supabase/ssr`                 |
| Styling               | Tailwind CSS v4 + shadcn/ui (Radix primitives)                           |
| Validation            | Zod, on every server function that accepts input                         |
| Runtime               | Bun (package manager + `db:seed` script runner)                          |
| Deploy target         | Cloudflare Workers (Nitro's default preset for this project)             |
| Tests                 | Vitest                                                                   |

## Two different "auth gates" — do not confuse them

This is the single most important thing to understand before touching auth
or authorization code in this app.

1. **Route `beforeLoad` guards** (e.g. `src/routes/_app.tsx`, `_app.admin.tsx`,
   `_app.mentor.tsx`) redirect an unauthenticated or wrong-role user away from
   a page. This is **UX only**. It prevents a page from rendering; it does
   **not** prevent the underlying data from being fetched.
2. **Server function middleware** (`authMiddleware` / `requireRole()` in
   `src/lib/auth/middleware.server.ts`) is the **real** authorization
   boundary. Every `createServerFn` is a directly-reachable RPC endpoint
   regardless of which route (if any) calls it — a route guard around the
   _page_ does nothing to protect the _server function_ if it were called
   from somewhere else. Every server function that reads or writes private
   data has `authMiddleware` or `requireRole(role)` in its `.middleware([])`
   array. If you add a new server function, it needs one of these.

Row Level Security (below) is a third, independent layer underneath both of
these — defense-in-depth, not a substitute for either.

## Authorization layers, in order

1. **Route guard** (`beforeLoad`) — UX redirect only, see above.
2. **`authMiddleware`** — resolves the caller from their session cookie
   (never from client-supplied data), attaches `{ userId, role, supabase }`
   to the server function's context. Throws `UnauthorizedError` if there is
   no session.
3. **`requireRole(role | role[])`** — layers a role check on top of
   `authMiddleware`. Throws `ForbiddenError` if the caller's role doesn't
   match.
4. **Row Level Security** — every table has RLS enabled
   (`supabase/migrations/0003_rls_policies.sql`). Server functions mostly use
   a **request-scoped client** (`context.supabase`, created per-request from
   the caller's cookies via `createRequestSupabase()`), so the query is
   subject to Postgres RLS as that specific user — a bug that skipped step 2
   or 3 would still be blocked at the database. See `docs/DATABASE.md` for
   the policy model.

A **service-role client** (`createAdminSupabase()`,
`src/lib/supabase/admin.server.ts`) bypasses RLS entirely. It is used
sparingly, only where the authorization decision genuinely cannot be
expressed as "does this row belong to this authenticated user" — e.g.
`checkInFn` (attendance has no INSERT policy for regular users because
validating the class session window + cohort membership + de-duplication is
business logic, not a row-ownership check) and `getPublicPortfolioFn` (there
is no session at all for an anonymous visitor; the `is_public`/slug filter
in the query _is_ the authorization check).

## Error handling

Server functions throw, they don't return `{ success, data }` envelopes —
TanStack Query already tracks success/error/loading state, so a wrapper
would just duplicate it. `src/lib/api/errors.ts` defines an `AppError` base
class and four subclasses (`UnauthorizedError`, `ForbiddenError`,
`ValidationError`, `NotFoundError`), each carrying a stable `code`, an HTTP
`status`, and a message that is always safe to show a user.

`src/start.ts` installs two middlewares that both rely on
`isAppError()`: anything that's an `AppError` (or a router `redirect()` /
`notFound()`) passes through untouched; anything else is logged server-side
and replaced with a generic "Something went wrong" message, so a raw
Postgres/Supabase error string or stack trace never reaches the client.

## Request flow for a typical page

1. Route's `beforeLoad` checks `context.auth` (populated once per request in
   `src/routes/__root.tsx` via `getCurrentUser()`) and redirects if the role
   doesn't match.
2. Component calls `useQuery({ queryFn: api.xxx })`.
3. `api.xxx` (`src/lib/api/index.ts`) calls a `createServerFn` from
   `src/lib/api/*.functions.ts`.
4. The server function's middleware chain resolves the caller and checks
   their role.
5. The handler queries Supabase with the request-scoped (RLS-respecting)
   client, shapes the result into the frontend's existing types, and
   returns it directly (no envelope).

## Folder structure

```
src/
  routes/                  File-based routes (TanStack Router). "_app.*" routes
                           share the authenticated app shell (src/routes/_app.tsx);
                           "p.$slug.tsx", "index.tsx", "login.tsx" are standalone.
  lib/
    api/
      *.functions.ts       Server functions, one file per domain, real DB access.
      index.ts             The `api` object every route/component calls — the
                           single seam between UI and data. A handful of entries
                           (getSubject plural is gone; getChallenge(s), getSkills,
                           getActivity, getLeaderboard) still read src/data/*
                           mocks — see "Known limitations" below.
      errors.ts            AppError taxonomy.
      client.ts            `read()` helper + NotFoundError re-export for the
                           still-mocked endpoints above.
    auth/
      middleware.server.ts authMiddleware / requireRole().
      session.functions.ts getCurrentUser() — used by __root.tsx's beforeLoad.
      types.ts             AuthUser.
    supabase/
      request.server.ts    Per-request, cookie-scoped, RLS-respecting client.
      admin.server.ts       Service-role client. Sparingly used — see above.
      browser.ts            Client-side Supabase client (anon key), used only
                            by src/routes/login.tsx and reset-password.tsx for
                            direct signInWithPassword/signUp/resetPassword calls.
    permissions.ts          Role → permission map, roleHome (post-login landing
                           route per role).
  data/                     Remaining intentionally-mocked domains: practice
                           challenges, the skills radar, the leaderboard/XP
                           rules (see "Known limitations").
  types/                    Shared frontend types.
supabase/migrations/        Schema, RLS policies, seed-adjacent fixes, in order.
scripts/seed.ts             Dev-only seed data — never run against production.
```

## Known limitations / intentionally out of scope

These were explicit exclusions in the original conversion brief, or gaps
that exist because the corresponding UI was never built — not oversights:

- **Practice challenges, the skills radar, and the leaderboard/XP system**
  remain backed by `src/data/practice.ts` and the trimmed
  `src/data/gamification.ts`/`src/data/student.ts` mocks. Building a real
  code-execution sandbox, a gamification engine, and a leaderboard were
  explicitly flagged as out of scope for this MVP.
- **No admin UI to promote a user to mentor/admin.** The RLS trigger
  (`prevent_role_self_escalation`, migration 0003) correctly restricts role
  changes to admins-via-service-role, and `scripts/seed.ts` creates the
  three seeded accounts at those roles directly, but there's no
  `assignRoleFn`/admin-workspace control for it yet. Phase 10 (admin
  workspace) only shipped cohort/mentor-assignment management.
- **AI tutor, real-time chat, payments** — explicitly Phase-2 in the
  original brief; not present.
- **No application-level rate limiting** on authenticated mutations
  (check-in, project submission, reviews). Supabase Auth rate-limits its own
  endpoints (sign-in/sign-up/password-reset) at the platform level; custom
  server functions have no additional throttling. Reasonable for an
  internal academy tool behind auth; worth adding at the edge/platform level
  before opening this to a larger, less-trusted user base.
