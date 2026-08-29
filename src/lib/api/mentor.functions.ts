import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireRole } from "@/lib/auth/middleware.server";
import { sendEmail, siteUrl } from "@/lib/email/brevo.server";
import { senders } from "@/lib/email/senders";
import { feedbackReadyEmail } from "@/lib/email/templates";
import { createAdminSupabase } from "@/lib/supabase/admin.server";

export interface MentorStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  overallProgress: number;
  attendanceRate: number;
  projectsCompleted: number;
}

export interface MentorOverview {
  cohort: { id: string; name: string; code: string; periodLabel: string } | null;
  students: MentorStudent[];
}

/**
 * Every query here uses the mentor's own request-scoped client, never the
 * service-role one — RLS (migration 0003) already scopes cohort_members,
 * profiles, lesson_progress, attendance_records and project_submissions
 * reads to a mentor's assigned cohort, so there is nothing left for
 * service-role bypass to do here that RLS doesn't already grant correctly.
 */
export const getMentorOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireRole("mentor")])
  .handler(async ({ context }): Promise<MentorOverview> => {
    const { supabase, userId } = context;

    const { data: assignments, error: assignError } = await supabase
      .from("mentor_assignments")
      .select("cohort:cohorts(id, name, code, period_label)")
      .eq("mentor_profile_id", userId);
    if (assignError) throw assignError;

    const cohortRow = (assignments ?? [])[0]?.cohort as unknown as
      { id: string; name: string; code: string; period_label: string } | undefined;
    if (!cohortRow) return { cohort: null, students: [] };

    const { data: members, error: membersError } = await supabase
      .from("cohort_members")
      .select("profile_id, profile:profiles(id, full_name, avatar_url)")
      .eq("cohort_id", cohortRow.id);
    if (membersError) throw membersError;

    const studentRows = (members ?? []) as unknown as {
      profile_id: string;
      profile: { id: string; full_name: string; avatar_url: string | null };
    }[];
    const studentIds = studentRows.map((m) => m.profile_id);
    const safeIds = studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"];

    const { count: totalLessons } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true });

    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("profile_id, status")
      .in("profile_id", safeIds)
      .eq("status", "completed");

    const { data: attendanceRows } = await supabase
      .from("attendance_records")
      .select("profile_id, status")
      .in("profile_id", safeIds);

    const { data: approvedRows } = await supabase
      .from("project_submissions")
      .select("profile_id")
      .in("profile_id", safeIds)
      .eq("status", "approved");

    const completedByStudent = new Map<string, number>();
    for (const r of progressRows ?? []) {
      const id = r.profile_id as string;
      completedByStudent.set(id, (completedByStudent.get(id) ?? 0) + 1);
    }

    const attendanceByStudent = new Map<string, { total: number; present: number }>();
    for (const r of attendanceRows ?? []) {
      const id = r.profile_id as string;
      const bucket = attendanceByStudent.get(id) ?? { total: 0, present: 0 };
      bucket.total += 1;
      if (r.status === "present" || r.status === "late") bucket.present += 1;
      attendanceByStudent.set(id, bucket);
    }

    const approvedByStudent = new Map<string, number>();
    for (const r of approvedRows ?? []) {
      const id = r.profile_id as string;
      approvedByStudent.set(id, (approvedByStudent.get(id) ?? 0) + 1);
    }

    const students: MentorStudent[] = studentRows
      .map((m) => {
        const completed = completedByStudent.get(m.profile_id) ?? 0;
        const attendance = attendanceByStudent.get(m.profile_id);
        return {
          id: m.profile_id,
          name: m.profile?.full_name ?? "Student",
          avatarUrl: m.profile?.avatar_url ?? null,
          overallProgress: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
          attendanceRate: attendance?.total
            ? Math.round((attendance.present / attendance.total) * 100)
            : 0,
          projectsCompleted: approvedByStudent.get(m.profile_id) ?? 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      cohort: {
        id: cohortRow.id,
        name: cohortRow.name,
        code: cohortRow.code,
        periodLabel: cohortRow.period_label,
      },
      students,
    };
  });

export interface PendingSubmission {
  id: string;
  studentName: string;
  projectTitle: string;
  projectSlug: string;
  repoUrl: string | null;
  liveUrl: string | null;
  notes: string | null;
  submittedAt: string | null;
  rubric: { criterion: string; weight: number; description: string }[];
}

export const getPendingSubmissionsFn = createServerFn({ method: "GET" })
  .middleware([requireRole("mentor")])
  .handler(async ({ context }): Promise<PendingSubmission[]> => {
    const { supabase, userId } = context;

    const { data: assignments } = await supabase
      .from("mentor_assignments")
      .select("cohort_id")
      .eq("mentor_profile_id", userId);
    const cohortIds = (assignments ?? []).map((a) => a.cohort_id as string);
    if (!cohortIds.length) return [];

    const { data: members } = await supabase
      .from("cohort_members")
      .select("profile_id")
      .in("cohort_id", cohortIds);
    const studentIds = (members ?? []).map((m) => m.profile_id as string);
    if (!studentIds.length) return [];

    const { data: submissions, error } = await supabase
      .from("project_submissions")
      .select(
        "id, repo_url, live_url, notes, submitted_at, profile_id, project:projects(title, slug, rubric)",
      )
      .in("profile_id", studentIds)
      .in("status", ["submitted", "under_review"])
      .order("submitted_at");
    if (error) throw error;

    const { data: students } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds);
    const nameMap = new Map((students ?? []).map((s) => [s.id as string, s.full_name as string]));

    type Row = {
      id: string;
      repo_url: string | null;
      live_url: string | null;
      notes: string | null;
      submitted_at: string | null;
      profile_id: string;
      project: { title: string; slug: string; rubric: PendingSubmission["rubric"] } | null;
    };

    return ((submissions ?? []) as unknown as Row[]).map((s) => ({
      id: s.id,
      studentName: nameMap.get(s.profile_id) ?? "Student",
      projectTitle: s.project?.title ?? "Project",
      projectSlug: s.project?.slug ?? "",
      repoUrl: s.repo_url,
      liveUrl: s.live_url,
      notes: s.notes,
      submittedAt: s.submitted_at,
      rubric: s.project?.rubric ?? [],
    }));
  });

const reviewInput = z.object({
  submissionId: z.string().uuid(),
  score: z.number().min(0).max(100),
  comment: z.string().max(4000).optional(),
  categories: z.array(z.object({ name: z.string(), score: z.number().min(0).max(100) })),
  decision: z.enum(["approved", "changes_requested", "rejected"]),
});

export const submitReviewFn = createServerFn({ method: "POST" })
  .middleware([requireRole("mentor")])
  .validator(reviewInput)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // RLS (submissions_select) already restricts this to submissions from
    // students in one of this mentor's assigned cohorts — a non-null result
    // here IS the authorization check, not just a lookup.
    const { data: submission, error: subError } = await supabase
      .from("project_submissions")
      .select("id, profile_id, project:projects(title, slug)")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (subError) throw subError;
    if (!submission) throw notFound();

    const { error: insertError } = await supabase.from("project_reviews").insert({
      submission_id: data.submissionId,
      reviewer_profile_id: userId,
      score: data.score,
      comment: data.comment || null,
      categories: data.categories,
      status: data.decision,
    });
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from("project_submissions")
      .update({ status: data.decision })
      .eq("id", data.submissionId);
    if (updateError) throw updateError;

    const project = submission.project as unknown as { title: string; slug: string } | null;
    const projectTitle = project?.title ?? "your project";
    await supabase.from("notifications").insert({
      profile_id: submission.profile_id,
      kind: "feedback",
      title: "Mentor feedback ready",
      body: `Your ${projectTitle} submission has been reviewed.`,
      read: false,
    });

    try {
      const [{ data: mentorProfile }, { data: studentProfile }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.from("profiles").select("full_name").eq("id", submission.profile_id).single(),
      ]);
      // The mentor's own session can't read another user's auth.users email
      // (no RLS path for it) — this is the one place in this function that
      // needs the service-role client, purely to look up an email address.
      const admin = createAdminSupabase();
      const { data: studentAuth } = await admin.auth.admin.getUserById(submission.profile_id);
      const email = studentAuth.user?.email;
      if (email && project) {
        const content = feedbackReadyEmail({
          studentName: studentProfile?.full_name ?? "there",
          projectTitle: project.title,
          mentorName: mentorProfile?.full_name ?? "Your mentor",
          decision: data.decision,
          score: data.score,
          ...(data.comment ? { comment: data.comment } : {}),
          projectUrl: siteUrl(`/projects/${project.slug}`),
        });
        await sendEmail({ to: { email }, sender: senders.noReply, ...content });
      }
    } catch (emailError) {
      console.error("feedbackReadyEmail failed", emailError);
    }

    return { ok: true };
  });
