import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img src="/logo-icon.png" alt="Emtech Digital Academy" className="size-9 shrink-0" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-foreground">
            Emtech Digital Academy
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Tech Academy OS
          </span>
        </span>
      )}
    </span>
  );
}
