import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { httpUrl } from "@/lib/api/validators";
import { authMiddleware } from "@/lib/auth/middleware.server";
import { sendEmail, siteUrl } from "@/lib/email/brevo.server";
import { senders } from "@/lib/email/senders";
import { submissionReceivedEmail } from "@/lib/email/templates";
import type { Project, ProjectFeedback } from "@/types";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Maps the DB's granular submission lifecycle onto the frontend's 4-state Project.status. */
export function deriveStatus(submissionStatus: string | undefined): Project["status"] {
  switch (submissionStatus) {
    case "draft":
    case "changes_requested":
      return "in-progress";
    case "submitted":
    case "under_review":
      return "submitted";
    case "approved":
    case "rejected":
      return "reviewed";
    default:
      return "not-started";
  }
}

// No stored progress column for projects (avoids duplicated data) — a
// coarse, honest signal derived from status rather than a fabricated
// precise percentage.
export const PROGRESS_BY_STATUS: Record<Project["status"], number> = {
  "not-started": 0,
  "in-progress": 50,
  submitted: 75,
  reviewed: 100,
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  overview: string | null;
  difficulty: string;
  deadline: string | null;
  xp: number;
  requirements: string[] | null;
  objectives: string[] | null;
  instructions: string[] | null;
  technologies: string[] | null;
  resources: { label: string; type: string }[] | null;
  submission_requirements: string[] | null;
  rubric: { criterion: string; weight: number; description: string }[] | null;
};

const PROJECT_COLUMNS =
  "id, title, slug, summary, overview, difficulty, deadline, xp, requirements, objectives, instructions, technologies, resources, submission_requirements, rubric";

function mapProject(row: ProjectRow, submissionStatus: string | undefined): Project {
  const status = deriveStatus(submissionStatus);
  // The mock's `skills` and `technologies` were two distinct hand-authored
  // lists; the schema only stores one tech-stack array, so both fields
  // point at it here rather than adding a column for a rarely-different list.
  const technologies = row.technologies ?? [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    difficulty: row.difficulty as Project["difficulty"],
    skills: technologies,
    deadline: row.deadline ? formatDate(row.deadline) : "TBA",
    progress: PROGRESS_BY_STATUS[status],
    xp: row.xp,
    status,
    overview: row.overview ?? "",
    requirements: row.requirements ?? [],
    instructions: row.instructions ?? [],
    objectives: row.objectives ?? [],
    technologies,
    resources: row.resources ?? [],
    submissionRequirements: row.submission_requirements ?? [],
    rubric: row.rubric ?? [],
  };
}

export const getProjectsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Project[]> => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("published", true);
    if (error) throw error;

    const { data: submissions, error: submissionsError } = await supabase
      .from("project_submissions")
      .select("project_id, status")
      .eq("profile_id", userId);
    if (submissionsError) throw submissionsError;
    const statusByProject = new Map(
      (submissions ?? []).map((s) => [s.project_id as string, s.status as string]),
    );

    return ((rows ?? []) as unknown as ProjectRow[]).map((row) =>
      mapProject(row, statusByProject.get(row.id)),
    );
  });

const slugInput = z.object({ slug: z.string().min(1) });

export interface ProjectDetail {
  project: Project;
  submission: { repoUrl: string | null; liveUrl: string | null; notes: string | null } | null;
}

export const getProjectFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(slugInput)
  .handler(async ({ context, data }): Promise<ProjectDetail> => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw notFound();
    const projectRow = row as unknown as ProjectRow;

    const { data: submissionRow } = await supabase
      .from("project_submissions")
      .select("id, status, repo_url, live_url, notes")
      .eq("project_id", projectRow.id)
      .eq("profile_id", userId)
      .maybeSingle();

    const project = mapProject(projectRow, submissionRow?.status);

    if (submissionRow) {
      const { data: review } = await supabase
        .from("project_reviews")
        .select("score, comment, categories, created_at, reviewer_profile_id")
        .eq("submission_id", submissionRow.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (review) {
        const { data: reviewer } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", review.reviewer_profile_id)
          .maybeSingle();

        const feedback: ProjectFeedback = {
          mentor: reviewer?.full_name ?? "Mentor",
          score: review.score ?? 0,
          reviewedAt: new Date(review.created_at as string).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          categories: (review.categories ?? []) as { name: string; score: number }[],
          comment: review.comment ?? "",
        };
        project.feedback = feedback;
      }
    }

    return {
      project,
      submission: submissionRow
        ? {
            repoUrl: submissionRow.repo_url,
            liveUrl: submissionRow.live_url,
            notes: submissionRow.notes,
          }
        : null,
    };
  });

const submitInput = z.object({
  slug: z.string().min(1),
  repoUrl: httpUrl,
  liveUrl: httpUrl.optional(),
  notes: z.string().max(4000).optional(),
});

export const submitProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(submitInput)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw notFound();

    const { error } = await supabase.from("project_submissions").upsert(
      {
        project_id: project.id,
        profile_id: userId,
        repo_url: data.repoUrl,
        live_url: data.liveUrl || null,
        notes: data.notes || null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "project_id,profile_id" },
    );
    if (error) throw error;

    try {
      const [{ data: profile }, { data: authUser }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.auth.getUser(),
      ]);
      const email = authUser.user?.email;
      if (email) {
        const content = submissionReceivedEmail({
          studentName: profile?.full_name ?? "there",
          projectTitle: project.title,
          projectUrl: siteUrl(`/projects/${data.slug}`),
        });
        await sendEmail({ to: { email }, sender: senders.noReply, ...content });
      }
    } catch (emailError) {
      console.error("submissionReceivedEmail failed", emailError);
    }

    return { status: "submitted" as const };
  });
