import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-soft text-primary",
  electric: "bg-electric/12 text-electric",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export type StatTone = keyof typeof tones;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="card-surface p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
    </motion.div>
  );
}