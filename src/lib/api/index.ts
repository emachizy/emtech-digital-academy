import { attendanceHistory, attendanceSummary, getMonthAttendance } from "@/data/attendance";
import { allSubjects } from "@/data/curriculum";
import {
  achievements,
  certificates,
  leaderboards,
  portfolioSections,
  xpRules,
} from "@/data/gamification";
import { challenges, getChallenge } from "@/data/practice";
import { getProject, projects } from "@/data/projects";
import { activity, announcements, notifications, skills, upcomingClasses } from "@/data/student";
import {
  getLessonFn,
  getSubjectFn,
  getTracksFn,
  markLessonCompleteFn,
} from "./curriculum.functions";
import { getStudentProfileFn } from "./student.functions";
import { NotFoundError, read, write } from "./client";

export const api = {
  // Real, database-backed (see src/lib/api/*.functions.ts). Everything
  // below getStudent/getLesson still reads from src/data/* mocks — wired up
  // as their own domains (attendance, practice, projects, achievements,
  // notifications) land in later phases.
  getStudent: () => getStudentProfileFn(),
  getDashboard: () => getStudentProfileFn(),
  getTracks: () => getTracksFn(),
  getSubjects: () => read(allSubjects),
  getSubject: (slug: string) => getSubjectFn({ data: { slug } }),
  getLesson: (slug: string, topicId: string) =>
    getLessonFn({ data: { subjectSlug: slug, topicId } }),
  markLessonComplete: (lessonId: string) => markLessonCompleteFn({ data: { lessonId } }),
  getAttendance: (year: number, month: number) =>
    read(() => ({
      summary: attendanceSummary,
      history: attendanceHistory,
      month: getMonthAttendance(year, month),
    })),
  checkIn: (method: string) => write({ method, at: new Date().toISOString() }),
  getChallenges: () => read(challenges),
  getChallenge: (id: string) =>
    read(() => {
      const challenge = getChallenge(id);
      if (!challenge) throw new NotFoundError("Challenge");
      return challenge;
    }),
  getProjects: () => read(projects),
  getProject: (slug: string) =>
    read(() => {
      const project = getProject(slug);
      if (!project) throw new NotFoundError("Project");
      return project;
    }),
  submitProject: (payload: Record<string, unknown>) => write(payload),
  getSkills: () => read(skills),
  getActivity: () => read(activity),
  getNotifications: () => read(notifications),
  getAchievements: () => read({ achievements, xpRules }),
  getCertificates: () => read(certificates),
  getLeaderboard: (range: "weekly" | "monthly" | "all-time") => read(leaderboards[range]),
  getPortfolio: () => read(portfolioSections),
};

export { NotFoundError };
