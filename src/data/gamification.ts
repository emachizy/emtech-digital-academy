import type { LeaderboardEntry, XpRule } from "@/types";

export const xpRules: XpRule[] = [
  { action: "Complete a lesson", xp: 20 },
  { action: "Pass a quiz", xp: 30 },
  { action: "Solve a challenge", xp: 50 },
  { action: "Submit a project", xp: 200 },
  { action: "Perfect weekly attendance", xp: 100 },
];

export const leaderboards: Record<"weekly" | "monthly" | "all-time", LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, name: "Priya Nair", avatar: "PN", xp: 640, projects: 2, streak: 21 },
    { rank: 2, name: "Tomiwa Bello", avatar: "TB", xp: 585, projects: 1, streak: 14 },
    {
      rank: 3,
      name: "Alex Johnson",
      avatar: "AJ",
      xp: 540,
      projects: 1,
      streak: 12,
      isCurrentUser: true,
    },
    { rank: 4, name: "Lena Fischer", avatar: "LF", xp: 470, projects: 1, streak: 9 },
    { rank: 5, name: "Diego Alvarez", avatar: "DA", xp: 415, projects: 0, streak: 6 },
  ],
  monthly: [
    { rank: 1, name: "Tomiwa Bello", avatar: "TB", xp: 2310, projects: 4, streak: 14 },
    {
      rank: 2,
      name: "Alex Johnson",
      avatar: "AJ",
      xp: 2180,
      projects: 3,
      streak: 12,
      isCurrentUser: true,
    },
    { rank: 3, name: "Priya Nair", avatar: "PN", xp: 2050, projects: 4, streak: 21 },
    { rank: 4, name: "Grace Mensah", avatar: "GM", xp: 1740, projects: 2, streak: 8 },
    { rank: 5, name: "Lena Fischer", avatar: "LF", xp: 1620, projects: 2, streak: 9 },
  ],
  "all-time": [
    { rank: 1, name: "Priya Nair", avatar: "PN", xp: 8920, projects: 11, streak: 21 },
    { rank: 2, name: "Tomiwa Bello", avatar: "TB", xp: 8410, projects: 10, streak: 14 },
    { rank: 3, name: "Grace Mensah", avatar: "GM", xp: 7550, projects: 9, streak: 8 },
    {
      rank: 4,
      name: "Alex Johnson",
      avatar: "AJ",
      xp: 7280,
      projects: 6,
      streak: 12,
      isCurrentUser: true,
    },
    { rank: 5, name: "Diego Alvarez", avatar: "DA", xp: 6640, projects: 7, streak: 6 },
  ],
};
