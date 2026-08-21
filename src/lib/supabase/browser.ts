import { createBrowserClient } from "@supabase/ssr";

const url = import.meta.env["VITE_SUPABASE_URL"];
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

if (!url || !publishableKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set");
}

/**
 * Browser-only Supabase client. Used exclusively for auth (sign in/out,
 * session state) — table data is read through our own server routes, never
 * queried directly from the client, so RLS is defense-in-depth rather than
 * the primary access path.
 */
export const supabaseBrowser = createBrowserClient(url, publishableKey);
