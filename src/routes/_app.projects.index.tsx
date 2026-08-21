import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Clock, FolderKanban, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { DifficultyBadge, XpBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export const Route = createFileRoute("/_app/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — TechEdu" },
      { name: "description", content: "Build, submit and get mentor feedback on real projects." },
      { property: "og:title", content: "Projects — TechEdu" },
      {
        property: "og:description",
        content: "Build, submit and get mentor feedback on real projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Project["status"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (filter === "all" || p.status === filter) &&
        (q === "" ||
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q))),
    );
  }, [query, filter]);

  const reviewed = projects.filter((p) => p.status === "reviewed");
  const inProgress = projects.filter((p) => p.status === "in-progress");
  const earnedXp = reviewed.reduce((sum, p) => sum + p.xp, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project center"
        title="Projects"
        description="Build, submit and get mentor feedback on real projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned"
          value={`${projects.length}`}
          hint="Track projects"
          icon={FolderKanban}
        />
        <StatCard
          label="In progress"
          value={`${inProgress.length}`}
          hint="Keep shipping"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Reviewed"
          value={`${reviewed.length}`}
          hint="Mentor graded"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="XP earned"
          value={`${earnedXp}`}
          hint="From projects"
          icon={Trophy}
          tone="electric"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects or skills..."
          className="sm:max-w-xs"
          aria-label="Search projects"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "not-started", "in-progress", "submitted", "reviewed"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {statusLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching projects"
          description="Try a different search term or clear the status filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <motion.article
              key={p.id}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="card-surface flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{p.title}</h2>
                <Badge variant="outline" className={cn("shrink-0", statusTone[p.status])}>
                  {statusLabel[p.status]}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DifficultyBadge value={p.difficulty} />
                <XpBadge xp={p.xp} />
                {p.skills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="font-medium">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium text-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Due {p.deadline}</span>
                <Button
                  asChild
                  size="sm"
                  variant={p.status === "not-started" ? "outline" : "default"}
                >
                  <Link to="/projects/$slug" params={{ slug: p.slug }}>
                    {p.status === "reviewed"
                      ? "View feedback"
                      : p.status === "not-started"
                        ? "Start"
                        : "Continue"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

const statusLabel: Record<"all" | Project["status"], string> = {
  all: "All",
  "not-started": "Not started",
  "in-progress": "In progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

const statusTone: Record<Project["status"], string> = {
  "not-started": "border-border bg-muted text-muted-foreground",
  "in-progress": "border-primary/30 bg-primary-soft text-primary",
  submitted: "border-warning/35 bg-warning/12 text-warning",
  reviewed: "border-success/30 bg-success/10 text-success",
};
