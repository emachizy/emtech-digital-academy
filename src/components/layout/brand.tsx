import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-foreground">TechEdu</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Tech Academy OS
          </span>
        </span>
      )}
    </span>
  );
}