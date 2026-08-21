import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getIcon, subjectTone } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = getIcon(subject.icon);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        to="/learning/$subject"
        params={{ subject: subject.slug }}
        className="card-surface group flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              subjectTone(subject.color),
            )}
          >
            <Icon className="size-5" />
          </span>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{subject.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{subject.description}</p>
        <div className="mt-auto space-y-2 pt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {subject.completedTopics}/{subject.topicCount} topics
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {subject.estimatedHours}h
            </span>
          </div>
          <Progress value={subject.progress} className="h-2" />
          <p className="text-xs font-medium text-foreground">{subject.progress}% complete</p>
        </div>
      </Link>
    </motion.div>
  );
}