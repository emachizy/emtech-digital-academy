import type { ActivityItem, Skill } from "@/types";

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
