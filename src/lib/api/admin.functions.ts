import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireRole } from "@/lib/auth/middleware.server";

export interface AdminOverview {
  totalStudents: number;
  totalMentors: number;
  totalCohorts: number;
  pendingSubmissions: number;
  avgAttendanceRate: number;
  avgProgress: number;
}

/**
 * Every query here uses the admin's own request-scoped client — RLS already
 * grants is_admin() unrestricted select access to every table (migration
 * 0003), so there is nothing a service-role client would add.
 */
export const getAdminOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireRole("admin")])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { supabase } = context;

    const [
      { count: totalStudents },
      { count: totalMentors },
      { count: totalCohorts },
      { count: pendingSubmissions },
      { count: totalLessons },
      { count: completedLessons },
      { count: totalAttendance },
      { count: presentAttendance },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "mentor"),
      supabase.from("cohorts").select("id", { count: "exact", head: true }),
      supabase
        .from("project_submissions")
        .select("id", { count: "exact", head: true })
        .in("status", ["submitted", "under_review"]),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase.from("attendance_records").select("id", { count: "exact", head: true }),
      supabase
        .from("attendance_records")
        .select("id", { count: "exact", head: true })
        .in("status", ["present", "late"]),
    ]);

    const students = totalStudents ?? 0;
    const lessons = totalLessons ?? 0;
    const avgProgress =
      students && lessons ? Math.round(((completedLessons ?? 0) / (lessons * students)) * 100) : 0;
    const avgAttendanceRate = totalAttendance
      ? Math.round(((presentAttendance ?? 0) / totalAttendance) * 100)
      : 0;

    return {
      totalStudents: students,
      totalMentors: totalMentors ?? 0,
      totalCohorts: totalCohorts ?? 0,
      pendingSubmissions: pendingSubmissions ?? 0,
      avgAttendanceRate,
      avgProgress,
    };
  });

export interface CohortSummary {
  id: string;
  name: string;
  code: string;
  periodLabel: string;
  instructorName: string | null;
  mentorId: string | null;
  mentorName: string | null;
  studentCount: number;
}

export const getCohortsFn = createServerFn({ method: "GET" })
  .middleware([requireRole("admin")])
  .handler(async ({ context }): Promise<CohortSummary[]> => {
    const { supabase } = context;

    // cohorts has three relationships to profiles (the direct instructor FK,
    // plus cohort_members and mentor_assignments many-to-many paths), so the
    // embed must name the FK explicitly or PostgREST rejects it as ambiguous.
    const { data: cohorts, error } = await supabase
      .from("cohorts")
      .select(
        "id, name, code, period_label, instructor:profiles!cohorts_instructor_profile_id_fkey(full_name)",
      )
      .order("name");
    if (error) throw error;

    type CohortRow = {
      id: string;
      name: string;
      code: string;
      period_label: string;
      instructor: { full_name: string } | null;
    };
    const rows = (cohorts ?? []) as unknown as CohortRow[];
    const cohortIds = rows.map((c) => c.id);
    const safeIds = cohortIds.length ? cohortIds : ["00000000-0000-0000-0000-000000000000"];

    const { data: members } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .in("cohort_id", safeIds);
    const studentCountByCohort = new Map<string, number>();
    for (const m of members ?? []) {
      const id = m.cohort_id as string;
      studentCountByCohort.set(id, (studentCountByCohort.get(id) ?? 0) + 1);
    }

    const { data: assignments } = await supabase
      .from("mentor_assignments")
      .select("cohort_id, mentor_profile_id, mentor:profiles(full_name)")
      .in("cohort_id", safeIds);
    type AssignmentRow = {
      cohort_id: string;
      mentor_profile_id: string;
      mentor: { full_name: string } | null;
    };
    const mentorByCohort = new Map<string, { id: string; name: string }>();
    for (const a of (assignments ?? []) as unknown as AssignmentRow[]) {
      if (!mentorByCohort.has(a.cohort_id)) {
        mentorByCohort.set(a.cohort_id, {
          id: a.mentor_profile_id,
          name: a.mentor?.full_name ?? "Mentor",
        });
      }
    }

    return rows.map((c) => {
      const mentor = mentorByCohort.get(c.id);
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        periodLabel: c.period_label,
        instructorName: c.instructor?.full_name ?? null,
        mentorId: mentor?.id ?? null,
        mentorName: mentor?.name ?? null,
        studentCount: studentCountByCohort.get(c.id) ?? 0,
      };
    });
  });

export interface MentorSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  cohortId: string | null;
  cohortName: string | null;
  studentCount: number;
  pendingReviews: number;
}

export const getMentorsFn = createServerFn({ method: "GET" })
  .middleware([requireRole("admin")])
  .handler(async ({ context }): Promise<MentorSummary[]> => {
    const { supabase } = context;

    const { data: mentors, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("role", "mentor")
      .order("full_name");
    if (error) throw error;

    const mentorIds = (mentors ?? []).map((m) => m.id as string);
    const safeMentorIds = mentorIds.length ? mentorIds : ["00000000-0000-0000-0000-000000000000"];

    const { data: assignments } = await supabase
      .from("mentor_assignments")
      .select("mentor_profile_id, cohort:cohorts(id, name)")
      .in("mentor_profile_id", safeMentorIds);
    type AssignmentRow = {
      mentor_profile_id: string;
      cohort: { id: string; name: string } | null;
    };
    const cohortByMentor = new Map<string, { id: string; name: string }>();
    for (const a of (assignments ?? []) as unknown as AssignmentRow[]) {
      if (a.cohort && !cohortByMentor.has(a.mentor_profile_id)) {
        cohortByMentor.set(a.mentor_profile_id, a.cohort);
      }
    }

    const cohortIds = [...new Set([...cohortByMentor.values()].map((c) => c.id))];
    const safeCohortIds = cohortIds.length ? cohortIds : ["00000000-0000-0000-0000-000000000000"];

    const { data: members } = await supabase
      .from("cohort_members")
      .select("cohort_id, profile_id")
      .in("cohort_id", safeCohortIds);
    const studentCountByCohort = new Map<string, number>();
    const studentIdsByCohort = new Map<string, string[]>();
    for (const m of members ?? []) {
      const cohortId = m.cohort_id as string;
      const profileId = m.profile_id as string;
      studentCountByCohort.set(cohortId, (studentCountByCohort.get(cohortId) ?? 0) + 1);
      const list = studentIdsByCohort.get(cohortId) ?? [];
      list.push(profileId);
      studentIdsByCohort.set(cohortId, list);
    }

    const allStudentIds = [...studentIdsByCohort.values()].flat();
    const cohortByStudent = new Map<string, string>();
    for (const [cohortId, ids] of studentIdsByCohort) {
      for (const id of ids) cohortByStudent.set(id, cohortId);
    }

    const pendingByCohort = new Map<string, number>();
    if (allStudentIds.length) {
      const { data: pending } = await supabase
        .from("project_submissions")
        .select("profile_id")
        .in("profile_id", allStudentIds)
        .in("status", ["submitted", "under_review"]);
      for (const p of pending ?? []) {
        const cohortId = cohortByStudent.get(p.profile_id as string);
        if (cohortId) pendingByCohort.set(cohortId, (pendingByCohort.get(cohortId) ?? 0) + 1);
      }
    }

    return (mentors ?? []).map((m) => {
      const cohort = cohortByMentor.get(m.id as string) ?? null;
      return {
        id: m.id as string,
        name: m.full_name as string,
        avatarUrl: (m.avatar_url as string | null) ?? null,
        cohortId: cohort?.id ?? null,
        cohortName: cohort?.name ?? null,
        studentCount: cohort ? (studentCountByCohort.get(cohort.id) ?? 0) : 0,
        pendingReviews: cohort ? (pendingByCohort.get(cohort.id) ?? 0) : 0,
      };
    });
  });

const assignMentorInput = z.object({
  cohortId: z.string().uuid(),
  mentorProfileId: z.string().uuid().nullable(),
});

/**
 * Treats mentor assignment as one-mentor-per-cohort even though the schema
 * allows many-to-many — the admin UI only ever needs to set or clear a
 * single mentor per cohort, so this replaces any existing assignment rather
 * than layering on top of them.
 */
export const assignMentorFn = createServerFn({ method: "POST" })
  .middleware([requireRole("admin")])
  .validator(assignMentorInput)
  .handler(async ({ context, data }) => {
    const { supabase } = context;

    const { error: deleteError } = await supabase
      .from("mentor_assignments")
      .delete()
      .eq("cohort_id", data.cohortId);
    if (deleteError) throw deleteError;

    if (data.mentorProfileId) {
      const { error: insertError } = await supabase.from("mentor_assignments").insert({
        mentor_profile_id: data.mentorProfileId,
        cohort_id: data.cohortId,
      });
      if (insertError) throw insertError;
    }

    return { ok: true };
  });
