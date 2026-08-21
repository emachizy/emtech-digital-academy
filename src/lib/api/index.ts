import { attendanceHistory, attendanceSummary, getMonthAttendance } from "@/data/attendance";
import { allSubjects, getLesson, getSubject, getTopics, tracks } from "@/data/curriculum";
import {
  achievements,
  certificates,
  leaderboards,
  portfolioSections,
  xpRules,
} from "@/data/gamification";
import { challenges, getChallenge } from "@/data/practice";
import { getProject, projects } from "@/data/projects";
import {
  activity,
  announcements,
  notifications,
  skills,
  student,
  upcomingClasses,
  weeklyActivity,
} from "@/data/student";
import { NotFoundError, read, write } from "./client";

export const api = {
  getStudent: () => read(student),
  getDashboard: () =>
    read(() => ({
      student,
      weeklyActivity,
      upcomingClasses,
      announcements,
      continueLearning: {
        subject: "JavaScript",
        subjectSlug: "javascript",
        topicId: "javascript-7",
        topic: "DOM Manipulation",
        progress: 65,
        minutesRemaining: 18,
      },
    })),
  getTracks: () => read(tracks),
  getSubjects: () => read(allSubjects),
  getSubject: (slug: string) =>
    read(() => {
      const subject = getSubject(slug);
      if (!subject) throw new NotFoundError("Subject");
      return { subject, topics: getTopics(slug) };
    }),
  getLesson: (slug: string, topicId: string) =>
    read(() => {
      const lesson = getLesson(slug, topicId);
      if (!lesson) throw new NotFoundError("Lesson");
      return { lesson, topics: getTopics(slug), subject: getSubject(slug)! };
    }),
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
