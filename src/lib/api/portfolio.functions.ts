import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { authMiddleware } from "@/lib/auth/middleware.server";
import { createAdminSupabase } from "@/lib/supabase/admin.server";

export interface PortfolioProject {
  title: string;
  slug: string;
  summary: string;
  technologies: string[];
  repoUrl: string | null;
  liveUrl: string | null;
}

export interface PortfolioCertificate {
  title: string;
  issuer: string;
  issuedAt: string | null;
}

interface PortfolioContent {
  cohortName: string | null;
  trackName: string | null;
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
  achievementCount: number;
}

type SubmissionRow = {
  repo_url: string | null;
  live_url: string | null;
  project: {
    title: string;
    slug: string;
    summary: string | null;
    technologies: string[] | null;
  } | null;
};

/**
 * Shared between the owner's editor view and the public share page — both
 * need the same "what has this student actually earned" projection, just
 * fetched through a different client (request-scoped vs. service-role).
 */
async function loadPortfolioContent(
  supabase: ReturnType<typeof createAdminSupabase>,
  profileId: string,
): Promise<PortfolioContent> {
  const [
    { data: membership },
    { data: track },
    { data: submissions },
    { data: certRows },
    { count: achievementCount },
  ] = await Promise.all([
    supabase
      .from("cohort_members")
      .select("cohort:cohorts(name)")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase.from("tracks").select("name").limit(1).maybeSingle(),
    supabase
      .from("project_submissions")
      .select("repo_url, live_url, project:projects(title, slug, summary, technologies)")
      .eq("profile_id", profileId)
      .eq("status", "approved"),
    supabase
      .from("certificates")
      .select("title, issuer, issued_at")
      .eq("profile_id", profileId)
      .not("issued_at", "is", null),
    supabase
      .from("student_achievements")
      .select("achievement_id", { count: "exact", head: true })
      .eq("profile_id", profileId),
  ]);

  const cohortRow = membership?.cohort as unknown as { name: string } | null | undefined;

  return {
    cohortName: cohortRow?.name ?? null,
    trackName: track?.name ?? null,
    projects: ((submissions ?? []) as unknown as SubmissionRow[])
      .filter((s) => s.project)
      .map((s) => ({
        title: s.project!.title,
        slug: s.project!.slug,
        summary: s.project!.summary ?? "",
        technologies: s.project!.technologies ?? [],
        repoUrl: s.repo_url,
        liveUrl: s.live_url,
      })),
    certificates: (certRows ?? []).map((c) => ({
      title: c.title as string,
      issuer: c.issuer as string,
      issuedAt: (c.issued_at as string | null) ?? null,
    })),
    achievementCount: achievementCount ?? 0,
  };
}

export interface MyPortfolio extends PortfolioContent {
  headline: string | null;
  bio: string | null;
  isPublic: boolean;
  publicSlug: string | null;
  profile: {
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  };
}

export const getMyPortfolioFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MyPortfolio> => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, bio, github_url, linkedin_url")
      .eq("id", userId)
      .single();
    if (profileError) throw profileError;

    const { data: portfolio } = await supabase
      .from("portfolio_profiles")
      .select("headline, bio, is_public, public_slug")
      .eq("profile_id", userId)
      .maybeSingle();

    const content = await loadPortfolioContent(supabase, userId);

    return {
      headline: portfolio?.headline ?? null,
      bio: portfolio?.bio ?? null,
      isPublic: portfolio?.is_public ?? false,
      publicSlug: portfolio?.public_slug ?? null,
      profile: {
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        githubUrl: profile.github_url,
        linkedinUrl: profile.linkedin_url,
      },
      ...content,
    };
  });

const slugPattern = /^[a-z0-9-]{3,40}$/;

const updatePortfolioInput = z.object({
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  isPublic: z.boolean(),
  publicSlug: z
    .string()
    .regex(slugPattern, "Use 3-40 lowercase letters, numbers or hyphens")
    .optional(),
});

export const updateMyPortfolioFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updatePortfolioInput)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    if (data.isPublic && !data.publicSlug) {
      throw new ValidationError("Choose a public link before publishing your portfolio");
    }

    const { error } = await supabase.from("portfolio_profiles").upsert(
      {
        profile_id: userId,
        headline: data.headline || null,
        bio: data.bio || null,
        is_public: data.isPublic,
        public_slug: data.publicSlug || null,
      },
      { onConflict: "profile_id" },
    );
    if (error) {
      if (error.code === "23505") throw new ValidationError("That link is already taken");
      throw error;
    }

    return { ok: true };
  });

export interface PublicPortfolio extends PortfolioContent {
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
}

const slugInput = z.object({ slug: z.string().min(1) });

/**
 * No auth middleware — this is a genuinely public page. RLS's `is_public`
 * clause would work for an authenticated-but-unrelated caller, but there is
 * no session here at all, so the service-role client is used and the
 * `is_public`/slug filter below IS the authorization check.
 */
export const getPublicPortfolioFn = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(async ({ data }): Promise<PublicPortfolio> => {
    const admin = createAdminSupabase();

    const { data: portfolio, error } = await admin
      .from("portfolio_profiles")
      .select("profile_id, headline, bio")
      .eq("public_slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw error;
    if (!portfolio) throw new NotFoundError("Portfolio");

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, avatar_url, github_url, linkedin_url")
      .eq("id", portfolio.profile_id)
      .maybeSingle();
    if (!profile) throw new NotFoundError("Portfolio");

    const content = await loadPortfolioContent(admin, portfolio.profile_id);

    return {
      name: profile.full_name,
      avatarUrl: profile.avatar_url,
      headline: portfolio.headline,
      bio: portfolio.bio,
      githubUrl: profile.github_url,
      linkedinUrl: profile.linkedin_url,
      ...content,
    };
  });
