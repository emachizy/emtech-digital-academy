export type Role = "student" | "mentor" | "admin";

export type Permission =
  | "learning:view"
  | "attendance:checkin"
  | "projects:submit"
  | "projects:review"
  | "students:manage"
  | "platform:manage";

export type TopicStatus = "completed" | "in-progress" | "locked" | "not-started";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type AttendanceStatus = "present" | "absent" | "late" | "none";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Track {
  id: string;
  name: string;
  description: string;
  progress: number;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  topicCount: number;
  completedTopics: number;
  estimatedHours: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  summary: string;
  status: TopicStatus;
  duration: string;
  difficulty: Difficulty;
  progress: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  subjectName: string;
  durationMinutes: number;
  videoLabel: string;
  intro: string;
  sections: { heading: string; body: string; code?: string }[];
  resources: { label: string; type: string }[];
  exercise: { prompt: string; starter: string };
  quiz: { question: string; options: string[]; answerIndex: number }[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  instructor: string;
  time: string;
  status: Exclude<AttendanceStatus, "none">;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  xp: number;
  minutes: number;
  description: string;
  instructions: string[];
  starter: string;
  expectedOutput: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: Difficulty;
  skills: string[];
  deadline: string;
  progress: number;
  xp: number;
  status: "not-started" | "in-progress" | "submitted" | "reviewed";
  overview: string;
  requirements: string[];
  instructions: string[];
  objectives: string[];
  technologies: string[];
  resources: { label: string; type: string }[];
  submissionRequirements: string[];
  rubric: { criterion: string; weight: number; description: string }[];
  feedback?: ProjectFeedback;
}

export interface ProjectFeedback {
  mentor: string;
  score: number;
  reviewedAt: string;
  categories: { name: string; score: number }[];
  comment: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  percent: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  progress: number;
  completed: boolean;
  issuedAt?: string;
}

export interface ActivityItem {
  id: string;
  kind: "lesson" | "project" | "badge" | "attendance" | "challenge";
  title: string;
  detail: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  kind: "lesson" | "class" | "deadline" | "feedback" | "achievement" | "certificate" | "message";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  projects: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface XpRule {
  action: string;
  xp: number;
}

export interface SearchItem {
  id: string;
  label: string;
  group: "Subjects" | "Topics" | "Projects" | "Challenges" | "Resources" | "Pages";
  to: string;
  params?: Record<string, string>;
}
