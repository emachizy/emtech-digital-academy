import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware.server";
import type { Achievement, Certificate } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const getAchievementsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Achievement[]> => {
    const { supabase, userId } = context;

    const { data: all, error } = await supabase
      .from("achievements")
      .select("id, name, description, icon");
    if (error) throw error;

    const { data: earnedRows, error: earnedError } = await supabase
      .from("student_achievements")
      .select("achievement_id, earned_at")
      .eq("profile_id", userId);
    if (earnedError) throw earnedError;
    const earnedMap = new Map(
      (earnedRows ?? []).map((r) => [r.achievement_id as string, r.earned_at as string]),
    );

    return (all ?? []).map((a) => {
      const earnedAt = earnedMap.get(a.id as string);
      return {
        id: a.id as string,
        name: a.name as string,
        description: (a.description as string | null) ?? "",
        icon: a.icon as string,
        earned: !!earnedAt,
        ...(earnedAt ? { earnedAt: formatDate(earnedAt) } : {}),
      };
    });
  });

export const getCertificatesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Certificate[]> => {
    const { data, error } = await context.supabase
      .from("certificates")
      .select("id, title, issuer, progress, issued_at")
      .eq("profile_id", context.userId);
    if (error) throw error;

    return (data ?? []).map((c) => ({
      id: c.id as string,
      title: c.title as string,
      issuer: c.issuer as string,
      progress: c.progress as number,
      completed: !!c.issued_at,
      ...(c.issued_at ? { issuedAt: formatDate(c.issued_at as string) } : {}),
    }));
  });
