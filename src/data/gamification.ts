import type {
  Achievement,
  Certificate,
  LeaderboardEntry,
  PortfolioSection,
  XpRule,
} from "@/types";

export const achievements: Achievement[] = [
  {
    id: "ach_first",
    name: "First Lesson",
    description: "Completed your very first lesson.",
    icon: "Sparkles",
    earned: true,
    earnedAt: "Jan 14, 2026",
  },
  {
    id: "ach_html",
    name: "HTML Master",
    description: "Finished every topic in HTML.",
    icon: "FileCode2",
    earned: true,
    earnedAt: "Feb 3, 2026",
  },
  {
    id: "ach_css",
    name: "CSS Wizard",
    description: "Scored 90%+ on the CSS assessment.",
    icon: "Palette",
    earned: true,
    earnedAt: "Mar 11, 2026",
  },
  {
    id: "ach_js",
    name: "JavaScript Explorer",
    description: "Completed 6 JavaScript topics.",
    icon: "Braces",
    earned: true,
    earnedAt: "Aug 5, 2026",
  },
  {
    id: "ach_git",
    name: "Git Champion",
    description: "Opened your first pull request.",
    icon: "GitBranch",
    earned: true,
    earnedAt: "Jun 22, 2026",
  },
  {
    id: "ach_builder",
    name: "Project Builder",
    description: "Submitted 5 projects for review.",
    icon: "Hammer",
    earned: true,
    earnedAt: "Jul 19, 2026",
  },
  {
    id: "ach_react",
    name: "React Rookie",
    description: "Build your first React component.",
    icon: "Atom",
    earned: false,
  },
  {
    id: "ach_streak",
    name: "30-Day Streak",
    description: "Learn every day for 30 days.",
    icon: "Flame",
    earned: false,
  },
  {
    id: "ach_100",
    name: "100 Lessons",
    description: "Complete 100 lessons across the track.",
    icon: "Trophy",
    earned: false,
  },
];

export const xpRules: XpRule[] = [
  { action: "Complete a lesson", xp: 20 },
  { action: "Pass a quiz", xp: 30 },
  { action: "Solve a challenge", xp: 50 },
  { action: "Submit a project", xp: 200 },
  { action: "Perfect weekly attendance", xp: 100 },
];

export const certificates: Certificate[] = [
  {
    id: "cert_html",
    title: "HTML Fundamentals",
    issuer: "TechEdu Academy",
    progress: 100,
    completed: true,
    issuedAt: "Feb 5, 2026",
  },
  {
    id: "cert_css",
    title: "CSS & Responsive Design",
    issuer: "TechEdu Academy",
    progress: 84,
    completed: false,
  },
  {
    id: "cert_js",
    title: "JavaScript Fundamentals",
    issuer: "TechEdu Academy",
    progress: 65,
    completed: false,
  },
  {
    id: "cert_react",
    title: "React Essentials",
    issuer: "TechEdu Academy",
    progress: 22,
    completed: false,
  },
];

export const leaderboards: Record<"weekly" | "monthly" | "all-time", LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, name: "Priya Nair", avatar: "PN", xp: 640, projects: 2, streak: 21 },
    { rank: 2, name: "Tomiwa Bello", avatar: "TB", xp: 585, projects: 1, streak: 14 },
    { rank: 3, name: "Alex Johnson", avatar: "AJ", xp: 540, projects: 1, streak: 12, isCurrentUser: true },
    { rank: 4, name: "Lena Fischer", avatar: "LF", xp: 470, projects: 1, streak: 9 },
    { rank: 5, name: "Diego Alvarez", avatar: "DA", xp: 415, projects: 0, streak: 6 },
  ],
  monthly: [
    { rank: 1, name: "Tomiwa Bello", avatar: "TB", xp: 2310, projects: 4, streak: 14 },
    { rank: 2, name: "Alex Johnson", avatar: "AJ", xp: 2180, projects: 3, streak: 12, isCurrentUser: true },
    { rank: 3, name: "Priya Nair", avatar: "PN", xp: 2050, projects: 4, streak: 21 },
    { rank: 4, name: "Grace Mensah", avatar: "GM", xp: 1740, projects: 2, streak: 8 },
    { rank: 5, name: "Lena Fischer", avatar: "LF", xp: 1620, projects: 2, streak: 9 },
  ],
  "all-time": [
    { rank: 1, name: "Priya Nair", avatar: "PN", xp: 8920, projects: 11, streak: 21 },
    { rank: 2, name: "Tomiwa Bello", avatar: "TB", xp: 8410, projects: 10, streak: 14 },
    { rank: 3, name: "Grace Mensah", avatar: "GM", xp: 7550, projects: 9, streak: 8 },
    { rank: 4, name: "Alex Johnson", avatar: "AJ", xp: 7280, projects: 6, streak: 12, isCurrentUser: true },
    { rank: 5, name: "Diego Alvarez", avatar: "DA", xp: 6640, projects: 7, streak: 6 },
  ],
};

export const portfolioSections: PortfolioSection[] = [
  {
    id: "pf_about",
    title: "About",
    description: "Your intro, role and what you're aiming for.",
    status: "complete",
    itemCount: 1,
  },
  {
    id: "pf_skills",
    title: "Skills",
    description: "Auto-filled from your tracked skill levels.",
    status: "complete",
    itemCount: 6,
  },
  {
    id: "pf_projects",
    title: "Projects",
    description: "Reviewed academy projects you choose to feature.",
    status: "complete",
    itemCount: 3,
  },
  {
    id: "pf_certificates",
    title: "Certificates",
    description: "Certificates earned on your track.",
    status: "complete",
    itemCount: 1,
  },
  {
    id: "pf_achievements",
    title: "Achievements",
    description: "Badges that show consistency and range.",
    status: "complete",
    itemCount: 6,
  },
  {
    id: "pf_github",
    title: "GitHub",
    description: "Connect GitHub to show repositories and contributions.",
    status: "incomplete",
    itemCount: 0,
  },
  {
    id: "pf_education",
    title: "Education",
    description: "Academy cohort plus any prior education.",
    status: "complete",
    itemCount: 2,
  },
  {
    id: "pf_experience",
    title: "Experience",
    description: "Internships, freelance or volunteer work.",
    status: "incomplete",
    itemCount: 0,
  },
  {
    id: "pf_contact",
    title: "Contact",
    description: "How people can reach you.",
    status: "complete",
    itemCount: 3,
  },
];