import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError, ForbiddenError } from "@/lib/api/errors";
import { authMiddleware } from "@/lib/auth/middleware.server";
import { createAdminSupabase } from "@/lib/supabase/admin.server";
import type { AttendanceRecord, AttendanceStatus } from "@/types";

const MINUTE = 60_000;

async function instructorNameMap(supabase: ReturnType<typeof createAdminSupabase>, ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, string>();
  const { data } = await supabase.from("profiles").select("id, full_name").in("id", unique);
  return new Map((data ?? []).map((p) => [p.id as string, p.full_name as string]));
}

export function formatDay(date: Date) {
  const today = new Date();
  const diffDays = Math.round(
    (new Date(date.toDateString()).getTime() - new Date(today.toDateString()).getTime()) /
      (24 * 60 * MINUTE),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

const yearMonthInput = z.object({ year: z.number().int(), month: z.number().int().min(0).max(11) });

export const getAttendanceFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(yearMonthInput)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("attendance_records")
      .select(
        "id, status, checked_in_at, class_session:class_sessions(title, starts_at, instructor_profile_id)",
      )
      .eq("profile_id", userId)
      .order("checked_in_at", { ascending: false });
    if (error) throw error;

    type Row = {
      id: string;
      status: string;
      checked_in_at: string;
      class_session: {
        title: string;
        starts_at: string;
        instructor_profile_id: string | null;
      } | null;
    };
    const attended = (rows ?? []) as unknown as Row[];

    const names = await instructorNameMap(
      supabase,
      attended
        .map((r) => r.class_session?.instructor_profile_id)
        .filter((id): id is string => !!id),
    );

    const history: AttendanceRecord[] = attended
      .filter((r) => r.class_session)
      .map((r) => {
        const start = new Date(r.class_session!.starts_at);
        return {
          id: r.id,
          date: start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          className: r.class_session!.title,
          instructor: names.get(r.class_session!.instructor_profile_id ?? "") ?? "TBA",
          time: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          status: r.status as Exclude<AttendanceStatus, "none">,
        };
      });

    const attendedCount = history.filter((h) => h.status === "present").length;
    const lateCount = history.filter((h) => h.status === "late").length;
    const missedCount = history.filter((h) => h.status === "absent").length;
    const total = history.length;
    const rate = total ? Math.round(((attendedCount + lateCount) / total) * 100) : 0;

    const monthStart = new Date(data.year, data.month, 1);
    const monthEnd = new Date(data.year, data.month + 1, 1);
    const month: Record<number, AttendanceStatus> = {};
    for (const r of attended) {
      if (!r.class_session) continue;
      const start = new Date(r.class_session.starts_at);
      if (start >= monthStart && start < monthEnd) {
        month[start.getDate()] = r.status as AttendanceStatus;
      }
    }

    return {
      summary: { rate, attended: attendedCount, late: lateCount, missed: missedCount },
      history,
      month,
    };
  });

export const getUpcomingSessionsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: membership } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!membership) return [];

    const { data: sessions, error } = await supabase
      .from("class_sessions")
      .select("id, title, starts_at, mode, instructor_profile_id")
      .eq("cohort_id", membership.cohort_id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(5);
    if (error) throw error;

    const names = await instructorNameMap(
      supabase,
      (sessions ?? []).map((s) => s.instructor_profile_id).filter((id): id is string => !!id),
    );

    return (sessions ?? []).map((s) => {
      const start = new Date(s.starts_at);
      return {
        id: s.id,
        title: s.title,
        day: formatDay(start),
        time: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        instructor: names.get(s.instructor_profile_id ?? "") ?? "TBA",
        mode: s.mode,
      };
    });
  });

/**
 * Finds the caller's cohort's currently-open session and checks them in.
 * Takes no input — which class is "active" is derived entirely server-side
 * from the session window, never from a client-supplied session id, so a
 * student can't claim attendance for an arbitrary session by guessing its
 * id. Writes via the service-role client: attendance_records intentionally
 * has no INSERT policy for regular users (see migration 0003) because the
 * validation here — window, cohort membership, de-duplication — has to
 * happen in code, not at the RLS layer.
 */
export const checkInFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: membership } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!membership) throw new ForbiddenError("You're not assigned to a cohort yet");

    const now = new Date();
    const { data: sessions, error } = await supabase
      .from("class_sessions")
      .select("id, title, starts_at, ends_at")
      .eq("cohort_id", membership.cohort_id)
      .gte("starts_at", new Date(now.getTime() - 4 * 60 * MINUTE).toISOString())
      .lte("starts_at", new Date(now.getTime() + 15 * MINUTE).toISOString());
    if (error) throw error;

    const active = (sessions ?? []).find((s) => {
      const start = new Date(s.starts_at);
      const end = new Date(s.ends_at);
      return (
        now >= new Date(start.getTime() - 15 * MINUTE) &&
        now <= new Date(end.getTime() + 15 * MINUTE)
      );
    });
    if (!active) {
      throw new AppError("NO_ACTIVE_SESSION", "There's no class open for check-in right now", 400);
    }

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("class_session_id", active.id)
      .eq("profile_id", userId)
      .maybeSingle();
    if (existing) {
      throw new AppError("ALREADY_CHECKED_IN", "You've already checked in to this class", 409);
    }

    const lateThreshold = new Date(new Date(active.starts_at).getTime() + 10 * MINUTE);
    const status: "present" | "late" = now > lateThreshold ? "late" : "present";

    const admin = createAdminSupabase();
    const { error: insertError } = await admin.from("attendance_records").insert({
      class_session_id: active.id,
      profile_id: userId,
      status,
      method: "manual",
      checked_in_at: now.toISOString(),
    });
    if (insertError) throw insertError;

    return { status, title: active.title };
  });
