import { createServerFn } from "@tanstack/react-start";
import { createRequestSupabase } from "@/lib/supabase/request.server";
import type { Role } from "@/types";
import type { AuthUser } from "./types";

/**
 * Resolves the caller's identity from their session cookie for the CURRENT
 * request. Used by the root route's beforeLoad to populate router context
 * (drives route guards + display), and returns null rather than throwing
 * when signed out — this is a "who is signed in, if anyone" check, not a
 * protected endpoint. Server functions that return actual private data must
 * use authMiddleware/requireRole instead (see middleware.server.ts) — this
 * function does not protect anything by itself.
 */
export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser | null> => {
    const supabase = createRequestSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", user.id)
      .single();
    if (!profile) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      role: profile.role as Role,
      fullName: profile.full_name as string,
      avatarUrl: profile.avatar_url as string | null,
    };
  },
);
