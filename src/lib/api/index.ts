import { leaderboards } from "@/data/gamification";
import { challenges, getChallenge } from "@/data/practice";
import { activity, skills } from "@/data/student";
import { getAchievementsFn, getCertificatesFn } from "./achievements.functions";
import { assignMentorFn, getAdminOverviewFn, getCohortsFn, getMentorsFn } from "./admin.functions";
import { checkInFn, getAttendanceFn, getUpcomingSessionsFn } from "./attendance.functions";
import {
  getLessonFn,
  getSubjectFn,
  getTracksFn,
  markLessonCompleteFn,
} from "./curriculum.functions";
import { getMentorOverviewFn, getPendingSubmissionsFn, submitReviewFn } from "./mentor.functions";
import {
  getNotificationsFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "./notifications.functions";
import { getMyPortfolioFn, getPublicPortfolioFn, updateMyPortfolioFn } from "./portfolio.functions";
import { getProjectFn, getProjectsFn, submitProjectFn } from "./projects.functions";
import { getSearchIndexFn } from "./search.functions";
import { getStudentProfileFn } from "./student.functions";
import { NotFoundError, read } from "./client";

export const api = {
  // Real, database-backed (see src/lib/api/*.functions.ts) except
  // getSubjects, getChallenge(s), getSkills, getActivity and getLeaderboard,
  // which still read from src/data/* mocks — practice challenges, the skills
  // radar and the leaderboard are out of scope for this MVP (brief section
  // 39 excludes the gamification/leaderboard engine).
  getStudent: () => getStudentProfileFn(),
  getDashboard: () => getStudentProfileFn(),
  getTracks: () => getTracksFn(),
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
  getNotifications: () => getNotificationsFn(),
  markNotificationRead: (id: string) => markNotificationReadFn({ data: { id } }),
  markAllNotificationsRead: () => markAllNotificationsReadFn(),
  getAchievements: () => getAchievementsFn(),
  getCertificates: () => getCertificatesFn(),
  getLeaderboard: (range: "weekly" | "monthly" | "all-time") => read(leaderboards[range]),
  getPortfolio: () => getMyPortfolioFn(),
  updatePortfolio: (params: {
    headline?: string;
    bio?: string;
    isPublic: boolean;
    publicSlug?: string;
  }) => updateMyPortfolioFn({ data: params }),
  getPublicPortfolio: (slug: string) => getPublicPortfolioFn({ data: { slug } }),
  getSearchIndex: () => getSearchIndexFn(),
  mentor: {
    getOverview: () => getMentorOverviewFn(),
    getPendingSubmissions: () => getPendingSubmissionsFn(),
    submitReview: (params: {
      submissionId: string;
      score: number;
      comment?: string;
      categories: { name: string; score: number }[];
      decision: "approved" | "changes_requested" | "rejected";
    }) => submitReviewFn({ data: params }),
  },
  admin: {
    getOverview: () => getAdminOverviewFn(),
    getCohorts: () => getCohortsFn(),
    getMentors: () => getMentorsFn(),
    assignMentor: (params: { cohortId: string; mentorProfileId: string | null }) =>
      assignMentorFn({ data: params }),
  },
};

export { NotFoundError };
