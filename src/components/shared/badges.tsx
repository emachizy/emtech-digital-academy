import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Difficulty, TopicStatus } from "@/types";

const difficultyTone: Record<Difficulty, string> = {
  Easy: "border-success/30 bg-success/10 text-success",
  Medium: "border-warning/35 bg-warning/12 text-warning",
  Hard: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <Badge variant="outline" className={cn("font-medium", difficultyTone[value])}>
      {value}
    </Badge>
  );
}

const statusLabel: Record<TopicStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  locked: "Locked",
  "not-started": "Not Started",
};

const statusTone: Record<TopicStatus, string> = {
  completed: "border-success/30 bg-success/10 text-success",
  "in-progress": "border-primary/30 bg-primary-soft text-primary",
  locked: "border-border bg-muted text-muted-foreground",
  "not-started": "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ value }: { value: TopicStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusTone[value])}>
      {statusLabel[value]}
    </Badge>
  );
}

export function XpBadge({ xp }: { xp: number }) {
  return (
    <Badge variant="outline" className="border-electric/30 bg-electric/10 font-medium text-electric">
      +{xp} XP
    </Badge>
  );
}