# Deployment

## Prerequisites

- A [Supabase](https://supabase.com) project.
- [Bun](https://bun.sh) installed locally for running scripts (`db:seed`) and as the package manager.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where it's used | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser (`src/lib/supabase/browser.ts`) | Public — Vite inlines `VITE_`-prefixed vars into the client bundle. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Public (anon key). Safe to expose; RLS is what actually restricts access. |
| `SUPABASE_URL` | Server only (`request.server.ts`, `admin.server.ts`) | Same URL as above, read server-side — never prefix with `VITE_`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`admin.server.ts`, `scripts/seed.ts`) | **Never** expose this to the browser or commit it. Bypasses RLS entirely. |
| `DATABASE_URL` | Migrations only, run via `psql`/your own tooling — not read by the app itself | Supabase's **pooled** connection string (port 6543) works for most cases. Supabase's *direct* connection (port 5432) is IPv6-only; if your network/host is IPv4-only, use the pooler connection instead (`aws-<region>.pooler.supabase.com:6543`) — this project hit exactly that during setup. |
| `CORS_ORIGIN` | Not currently read by any app code | Leftover from an earlier architecture decision (see `docs/ARCHITECTURE.md`); safe to leave unset or remove from `.env.example` in a later cleanup. |

Get `SUPABASE_URL`/`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project's API settings. Get `DATABASE_URL` from the project's connection-string settings (choose "Connection pooling" if you hit the IPv4 issue above).

## 2. Apply database migrations

Run every file in `supabase/migrations/` **in order** against a fresh database:

```bash
for f in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

(Or run them one at a time / via the Supabase SQL editor if you'd rather review each one — they're numbered and safe to run sequentially.) See `docs/DATABASE.md` for what each migration does.

## 3. Seed dev data (optional, dev/staging only)

```bash
bun install
bun run db:seed
```

Creates three demo accounts (`admin@techedu.local`, `mentor@techedu.local`,
`student@techedu.local`, password `TechEdu!2026`), a cohort, tracks/subjects/
topics/lessons, projects, achievements, and related seed content. **Never run
this against a real production database** — it deletes and recreates users by
email, and the demo password is public (it's printed on the sign-in page in
dev builds only — see `src/routes/login.tsx`'s `import.meta.env.DEV` guard).

`db:seed` only resets the seeded auth users; it doesn't clear domain tables
(cohorts, tracks, projects, …). Re-running it against an already-seeded
database will fail on unique constraints (cohort code, slugs). To re-seed
from scratch, drop and re-migrate the database first.

## 4. Local development

```bash
bun install
bun run dev       # http://localhost:8080
```

## 5. Verify before deploying

```bash
bunx tsc --noEmit -p tsconfig.json   # typecheck
bun run lint                          # ESLint, 0 errors expected
bun run test                          # Vitest — business-logic unit tests
bun run build                         # production build
```

TypeScript passing does **not** prove Supabase queries or RLS policies are
correct — see `docs/DATABASE.md`'s note on the lack of generated DB types.
Any change touching a `*.functions.ts` file should be exercised against a
real (dev/staging) Supabase project, not just type-checked, before shipping.

## 6. Build & deploy

`bun run build` produces a Cloudflare Workers build by default (Nitro's
default preset for this project — see `.output/server/wrangler.json`,
generated at build time, not committed):

```bash
bun run build
npx nitro deploy --prebuilt
# or: npx wrangler deploy   (from .output/server, using the generated wrangler.json)
```

To target a different platform (Node, Vercel, etc.), configure Nitro's
`preset` — see the TanStack Start / Nitro deployment docs. `vite.config.ts`
in this project wraps `@lovable.dev/vite-tanstack-config`, which already
supplies the TanStack Start + Nitro + Cloudflare wiring; don't add those
plugins manually (see the comment at the top of `vite.config.ts`).

Set the four server-side env vars (`SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`) as secrets on whatever platform you deploy to —
never bake `SUPABASE_SERVICE_ROLE_KEY` into a client-visible build artifact.

## Before opening this to real users

See `docs/SECURITY.md` in full, but at minimum:

- Rotate/remove the seeded demo accounts and their known password.
- Confirm the deployed environment terminates HTTPS (the app sends
  `Strict-Transport-Security`, but that's only meaningful if TLS is actually
  in front of it).
- Consider platform/edge-level rate limiting — there's none at the
  application layer beyond what Supabase Auth enforces on its own endpoints.
