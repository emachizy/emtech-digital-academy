import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

/**
 * Per-request Supabase client scoped to the caller's own session cookies.
 * Queries made with this client run AS the authenticated user, so RLS
 * (supabase/migrations/0003_rls_policies.sql) enforces row-level access —
 * this is the client server routes should use for anything the caller is
 * allowed to see/do as themselves (their own profile, their own progress,
 * their own submissions, or cross-user reads RLS already grants to their
 * role, e.g. a mentor's assigned students).
 *
 * A new client must be created per request (cookies are request-scoped);
 * never cache or share this across requests.
 */
export function createRequestSupabase() {
  const url = process.env["SUPABASE_URL"];
  const publishableKey = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishableKey) {
    throw new Error("SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set");
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
      },
    },
  });
}
