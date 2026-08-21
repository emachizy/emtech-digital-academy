import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS entirely — this is the same
 * trust level as a raw database superuser connection.
 *
 * Only use this for operations that are legitimately cross-user and where
 * the calling server route has ALREADY verified the caller's role itself
 * (e.g. an admin endpoint that first confirms the caller's own profile has
 * role='admin' via createRequestSupabase(), then uses this client to change
 * someone else's role or manage curriculum) — or for validated system
 * actions a user cannot be trusted to perform directly (e.g. writing an
 * attendance record only after the check-in route has validated the
 * session window, cohort membership and de-duplication in code).
 *
 * Never import this from client-reachable code — the `.server.ts` suffix
 * makes TanStack Start's import-protection plugin fail the build if that
 * ever happens, but treat that as a backstop, not a substitute for keeping
 * this out of shared modules.
 */
export function createAdminSupabase() {
  const url = process.env["SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
