import type {
  ActivityItem,
  Announcement,
  ClassSession,
  NotificationItem,
  Skill,
  Student,
  WeeklyActivityPoint,
} from "@/types";

export const student: Student = {
  id: "stu_1",
  name: "Alex Johnson",
  firstName: "Alex",
  studentId: "TECH-2026-0042",
  email: "alex.johnson@techedu.io",
  avatar: "AJ",
  cohort: {
    id: "coh_1",
    name: "Frontend Development",
    code: "Cohort 2026-A",
    period: "January — June",
    instructor: "Sarah Johnson",
    students: 34,
  },
  track: "Frontend Developer",
  level: 7,
  levelTitle: "Frontend Explorer",
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 12,
  attendanceRate: 92,
  overallProgress: 68,
  topicsCompleted: 47,
  projectsCompleted: 6,
  skillsEarned: 14,
  github: null,
  bio: "Frontend student at TechEdu building interfaces that feel fast and friendly. Currently deep in JavaScript and React.",
  location: "Lagos, Nigeria",
};

export const weeklyActivity: WeeklyActivityPoint[] = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 2.9 },
  { day: "Sat", hours: 3.6 },
  { day: "Sun", hours: 1.2 },
];

export const upcomingClasses: ClassSession[] = [
  {
    id: "cls_1",
    title: "React Fundamentals",
    day: "Today",
    time: "2:00 PM",
    instructor: "Sarah Johnson",
    mode: "Live · Room B",
  },
  {
    id: "cls_2",
    title: "Async JavaScript Deep Dive",
    day: "Tomorrow",
    time: "10:00 AM",
    instructor: "Daniel Okafor",
    mode: "Online",
  },
  {
    id: "cls_3",
    title: "Git Workflows in Teams",
    day: "Thursday",
    time: "1:30 PM",
    instructor: "Maya Patel",
    mode: "Live · Room A",
  },
];

export const announcements: Announcement[] = [
  {
    id: "ann_1",
    kind: "project",
    title: "New Project Available",
    body: "Portfolio Landing Page is now assigned to Cohort 2026-A.",
    date: "2 hours ago",
  },
  {
    id: "ann_2",
    kind: "workshop",
    title: "Workshop",
    body: "Introduction to GitHub — Friday, 4:00 PM with Maya Patel.",
    date: "Yesterday",
  },
  {
    id: "ann_3",
    kind: "deadline",
    title: "Deadline",
    body: "JavaScript Calculator Project closes in 4 days.",
    date: "2 days ago",
  },
];

export const skills: Skill[] = [
  { id: "sk_html", name: "HTML", level: "Advanced", percent: 90 },
  { id: "sk_css", name: "CSS", level: "Intermediate", percent: 76 },
  { id: "sk_js", name: "JavaScript", level: "Intermediate", percent: 64 },
  { id: "sk_git", name: "Git & GitHub", level: "Intermediate", percent: 58 },
  { id: "sk_react", name: "React", level: "Beginner", percent: 38 },
  { id: "sk_ts", name: "TypeScript", level: "Beginner", percent: 22 },
];

export const activity: ActivityItem[] = [
  {
    id: "act_1",
    kind: "lesson",
    title: "Completed",
    detail: "CSS Flexbox",
    time: "2 hours ago",
  },
  {
    id: "act_2",
    kind: "project",
    title: "Submitted",
    detail: "Portfolio Website",
    time: "Yesterday",
  },
  { id: "act_3", kind: "badge", title: "Earned Badge", detail: "7 Day Streak", time: "3 days ago" },
  {
    id: "act_4",
    kind: "challenge",
    title: "Solved Challenge",
    detail: "Reverse a String",
    time: "4 days ago",
  },
  {
    id: "act_5",
    kind: "attendance",
    title: "Checked in",
    detail: "React Fundamentals class",
    time: "5 days ago",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n_1",
    kind: "feedback",
    title: "Mentor feedback ready",
    body: "Sarah reviewed your Portfolio Website submission.",
    time: "10m ago",
    read: false,
  },
  {
    id: "n_2",
    kind: "class",
    title: "Class starts in 1 hour",
    body: "React Fundamentals with Sarah Johnson at 2:00 PM.",
    time: "1h ago",
    read: false,
  },
  {
    id: "n_3",
    kind: "achievement",
    title: "Achievement unlocked",
    body: "You earned the JavaScript Explorer badge.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "n_4",
    kind: "deadline",
    title: "Deadline approaching",
    body: "JavaScript Calculator Project is due in 4 days.",
    time: "2d ago",
    read: true,
  },
  {
    id: "n_5",
    kind: "certificate",
    title: "Certificate available",
    body: "Download your HTML Fundamentals certificate.",
    time: "5d ago",
    read: true,
  },
];