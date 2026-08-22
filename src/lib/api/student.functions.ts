import { createServerFn } from "@tanstack/react-start";
import { getSubjectFn, getTracksFn } from "./curriculum.functions";
import { authMiddleware } from "@/lib/auth/middleware.server";

// Presentation-only labels, not a progression system — brief section 39
// explicitly excludes building a gamification engine. xp/level/streak_days
// themselves are plain stored facts on profiles (see migration 0004); this
// just turns a level number into a friendlier label + a display target for
// "XP to next level," neither of which reads or writes any table.
const LEVEL_TITLES = [
  "Newcomer",
  "Explorer",
  "Builder",
  "Practitioner",
  "Specialist",
  "Advocate",
  "Frontend Explorer",
  "Frontend Builder",
  "Frontend Expert",
  "Frontend Master",
];
export function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(Math.max(level, 1), LEVEL_TITLES.length) - 1] ?? "Learner";
}
export function xpToNextLevel(level: number) {
  return level * 400 + 400;
}

export interface StudentProfile {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  cohort: { name: string; code: string; periodLabel: string; instructorName: string | null } | null;
  track: string | null;
  level: number;
  levelTitle: string;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  attendanceRate: number;
  overallProgress: number;
  topicsCompleted: number;
  projectsCompleted: number;
  skillsEarned: number;
  continueLearning: {
    subjectSlug: string;
    subjectName: string;
    topicId: string;
    topicTitle: string;
    progress: number;
  } | null;
}

export const getStudentProfileFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<StudentProfile> => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, bio, location, github_url, linkedin_url, xp, level, streak_days",
      )
      .eq("id", userId)
      .single();
    if (profileError) throw profileError;

    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser.user?.email ?? "";

    const { data: membership } = await supabase
      .from("cohort_members")
      .select("cohort:cohorts(name, code, period_label, instructor_profile_id)")
      .eq("profile_id", userId)
      .maybeSingle();
    const cohortRow = membership?.cohort as
      | { name: string; code: string; period_label: string; instructor_profile_id: string | null }
      | null
      | undefined;

    let instructorName: string | null = null;
    if (cohortRow?.instructor_profile_id) {
      const { data: instructor } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", cohortRow.instructor_profile_id)
        .maybeSingle();
      instructorName = instructor?.full_name ?? null;
    }

    const { data: track } = await supabase.from("tracks").select("name").limit(1).maybeSingle();

    const { count: projectsCompleted } = await supabase
      .from("project_submissions")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("status", "approved");

    const { data: attendanceRows } = await supabase
      .from("attendance_records")
      .select("status")
      .eq("profile_id", userId);
    const attendanceTotal = attendanceRows?.length ?? 0;
    const attendancePresent = (attendanceRows ?? []).filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const attendanceRate = attendanceTotal
      ? Math.round((attendancePresent / attendanceTotal) * 100)
      : 0;

    const tracks = await getTracksFn();
    const allSubjects = tracks.flatMap((t) => t.subjects);
    const totalTopics = allSubjects.reduce((n, s) => n + s.topicCount, 0);
    const totalCompleted = allSubjects.reduce((n, s) => n + s.completedTopics, 0);
    const overallProgress = totalTopics ? Math.round((totalCompleted / totalTopics) * 100) : 0;
    const skillsEarned = allSubjects.filter((s) => s.completedTopics > 0).length;

    const inProgressSubject = allSubjects.find((s) => s.progress < 100);
    let continueLearning: StudentProfile["continueLearning"] = null;
    if (inProgressSubject) {
      const { topics } = await getSubjectFn({ data: { slug: inProgressSubject.slug } });
      const current = topics.find((t) => t.status === "in-progress");
      if (current) {
        continueLearning = {
          subjectSlug: inProgressSubject.slug,
          subjectName: inProgressSubject.name,
          topicId: current.id,
          topicTitle: current.title,
          progress: inProgressSubject.progress,
        };
      }
    }

    return {
      id: profile.id,
      name: profile.full_name,
      firstName: profile.full_name.split(" ")[0] ?? profile.full_name,
      email,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      githubUrl: profile.github_url,
      linkedinUrl: profile.linkedin_url,
      cohort: cohortRow
        ? {
            name: cohortRow.name,
            code: cohortRow.code,
            periodLabel: cohortRow.period_label,
            instructorName,
          }
        : null,
      track: track?.name ?? null,
      level: profile.level,
      levelTitle: levelTitle(profile.level),
      xp: profile.xp,
      xpToNextLevel: xpToNextLevel(profile.level),
      streak: profile.streak_days,
      attendanceRate,
      overallProgress,
      topicsCompleted: totalCompleted,
      projectsCompleted: projectsCompleted ?? 0,
      skillsEarned,
      continueLearning,
    };
  });
