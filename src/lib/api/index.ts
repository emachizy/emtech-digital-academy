import { allSubjects } from "@/data/curriculum";
import {
  achievements,
  certificates,
  leaderboards,
  portfolioSections,
  xpRules,
} from "@/data/gamification";
import { challenges, getChallenge } from "@/data/practice";
import { activity, announcements, notifications, skills } from "@/data/student";
import { checkInFn, getAttendanceFn, getUpcomingSessionsFn } from "./attendance.functions";
import {
  getLessonFn,
  getSubjectFn,
  getTracksFn,
  markLessonCompleteFn,
} from "./curriculum.functions";
import { getProjectFn, getProjectsFn, submitProjectFn } from "./projects.functions";
import { getStudentProfileFn } from "./student.functions";
import { NotFoundError, read } from "./client";

export const api = {
  // Real, database-backed (see src/lib/api/*.functions.ts). Everything
  // below getPortfolio still reads from src/data/* mocks — wired up as
  // their own domains (practice, projects, achievements, notifications)
  // land in later phases.
  getStudent: () => getStudentProfileFn(),
  getDashboard: () => getStudentProfileFn(),
  getTracks: () => getTracksFn(),
  getSubjects: () => read(allSubjects),
  getSubject: (slug: string) => getSubjectFn({ data: { slug } }),
  getLesson: (slug: string, topicId: string) =>
    getLessonFn({ data: { subjectSlug: slug, topicId } }),
  markLessonComplete: (lessonId: string) => markLessonCompleteFn({ data: { lessonId } }),
  getAttendance: (year: number, month: number) => getAttendanceFn({ data: { year, month } }),
  getUpcomingClasses: () => getUpcomingSessionsFn(),
  checkIn: () => checkInFn(),
  getChallenges: () => read(challenges),
  getChallenge: (id: string) =>
    read(() => {
      const challenge = getChallenge(id);
      if (!challenge) throw new NotFoundError("Challenge");
      return challenge;
    }),
  getProjects: () => getProjectsFn(),
  getProject: (slug: string) => getProjectFn({ data: { slug } }),
  submitProject: (params: { slug: string; repoUrl: string; liveUrl?: string; notes?: string }) =>
    submitProjectFn({ data: params }),
  getSkills: () => read(skills),
  getActivity: () => read(activity),
  getNotifications: () => read(notifications),
  getAchievements: () => read({ achievements, xpRules }),
  getCertificates: () => read(certificates),
  getLeaderboard: (range: "weekly" | "monthly" | "all-time") => read(leaderboards[range]),
  getPortfolio: () => read(portfolioSections),
};

export { NotFoundError };
