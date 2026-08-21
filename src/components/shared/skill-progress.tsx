import { Progress } from "@/components/ui/progress";
import type { Skill } from "@/types";

export function SkillProgress({ skill }: { skill: Skill }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{skill.name}</span>
        <span className="text-xs text-muted-foreground">
          {skill.level} · {skill.percent}%
        </span>
      </div>
      <Progress value={skill.percent} className="h-2" />
    </div>
  );
}