import {
  Atom,
  Braces,
  FileCode2,
  FlaskConical,
  Flame,
  GitBranch,
  Hammer,
  Palette,
  Plug,
  Rocket,
  Sparkles,
  Trophy,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Atom,
  Braces,
  FileCode2,
  FlaskConical,
  Flame,
  GitBranch,
  Hammer,
  Palette,
  Plug,
  Rocket,
  Sparkles,
  Trophy,
  Type,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles;
}

const tones = {
  primary: "bg-primary-soft text-primary",
  electric: "bg-electric/12 text-electric",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
};

export function subjectTone(color: string) {
  return tones[color as keyof typeof tones] ?? tones.primary;
}