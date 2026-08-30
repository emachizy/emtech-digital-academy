import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Braces, CheckCircle2, Clock, Flame, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { DifficultyBadge, XpBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { challengeCategories, challenges } from "@/data/practice";

export const Route = createFileRoute("/_app/practice/")({
  head: () => ({
    meta: [
      { title: "Practice Lab — Emtech Digital Academy" },
      { name: "description", content: "Daily challenges, quizzes and a code playground." },
      { property: "og:title", content: "Practice Lab — Emtech Digital Academy" },
      { property: "og:description", content: "Daily challenges, quizzes and a code playground." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return challenges.filter(
      (c) =>
        (category === "All" || c.category === category) &&
        (q === "" ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const completed = challenges.filter((c) => c.completed);
  const earnedXp = completed.reduce((sum, c) => sum + c.xp, 0);
  const completionRate = Math.round((completed.length / challenges.length) * 100);
  const daily = challenges.find((c) => !c.completed) ?? challenges[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice lab"
        title="Practice Lab"
        description="Daily challenges, quizzes and a code playground."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Challenges"
          value={`${challenges.length}`}
          hint="Available now"
          icon={Braces}
        />
        <StatCard
          label="Completed"
          value={`${completed.length}`}
          hint={`${completionRate}% of the lab`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="XP earned"
          value={`${earnedXp}`}
          hint="From practice"
          icon={Trophy}
          tone="electric"
        />
        <StatCard
          label="Practice streak"
          value="12 days"
          hint="Keep it alive"
          icon={Flame}
          tone="warning"
        />
      </div>

      {daily ? (
        <section className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Daily challenge
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{daily.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{daily.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge value={daily.difficulty} />
              <XpBadge xp={daily.xp} />
              <Badge variant="secondary" className="font-medium">
                <Clock className="mr-1 size-3" />
                {daily.minutes} min
              </Badge>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/practice/$challengeId" params={{ challengeId: daily.id }}>
              Start challenge
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      ) : null}

      <div className="card-surface space-y-2 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Lab progress</span>
          <span className="text-muted-foreground">
            {completed.length} / {challenges.length} solved
          </span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search challenges..."
          className="sm:max-w-xs"
          aria-label="Search challenges"
        />
        <div className="flex flex-wrap gap-2">
          {challengeCategories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching challenges"
          description="Try a different search term or pick another category."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <motion.article
              key={c.id}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="card-surface flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                {c.completed ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-success/30 bg-success/10 text-success"
                  >
                    Solved
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {c.category}
                </Badge>
                <DifficultyBadge value={c.difficulty} />
                <XpBadge xp={c.xp} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {c.minutes} min
                </span>
                <Button asChild size="sm" variant={c.completed ? "outline" : "default"}>
                  <Link to="/practice/$challengeId" params={{ challengeId: c.id }}>
                    {c.completed ? "Review" : "Solve"}
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
