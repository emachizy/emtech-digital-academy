import { createMiddleware } from "@tanstack/react-start";
import { createRequestSupabase } from "@/lib/supabase/request.server";
import type { Role } from "@/types";

/**
 * Attach to every createServerFn that reads or writes private data. A route
 * `beforeLoad` redirect only protects the page's UI — the server function it
 * calls is a directly-reachable RPC endpoint regardless of which route (if
 * any) renders the caller. This is the actual data-access boundary.
 *
 * Resolves the caller from their session cookie (never from client-supplied
 * data) and hands the handler a request-scoped, RLS-respecting Supabase
 * client plus the caller's own id/role.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const supabase = createRequestSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) throw new Error("Unauthorized");

  return next({ context: { userId: user.id, role: profile.role as Role, supabase } });
});

/** Layers a role check on top of authMiddleware. Use for admin/mentor-only endpoints. */
export function requireRole(role: Role | Role[]) {
  const allowed = Array.isArray(role) ? role : [role];
  return createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      if (!allowed.includes(context.role)) throw new Error("Forbidden");
      return next();
    });
}
