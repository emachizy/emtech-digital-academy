import type { LinkProps } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Braces,
  CalendarCheck,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  User,
  UserSquare2,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: NonNullable<LinkProps["to"]>;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Learning", to: "/learning", icon: BookOpen },
      { label: "Attendance", to: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "Practice", to: "/practice", icon: Braces },
      { label: "Projects", to: "/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Career",
    items: [
      { label: "Portfolio", to: "/portfolio", icon: UserSquare2 },
      { label: "Achievements", to: "/achievements", icon: Award },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", to: "/profile", icon: User },
      { label: "Settings", to: "/settings", icon: Settings },
      { label: "Help", to: "/help", icon: HelpCircle },
    ],
  },
];

export const mobileNav: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "Learn", to: "/learning", icon: BookOpen },
  { label: "Attend", to: "/attendance", icon: CalendarCheck },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Profile", to: "/profile", icon: User },
];