import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import {
  Award,
  Flame,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { achievements, certificates, leaderboards, xpRules } from "@/data/gamification";
import { student } from "@/data/student";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — TechEdu" },
      { name: "description", content: "Badges, XP, levels and certificates you have earned." },
      { property: "og:title", content: "Achievements — TechEdu" },
      { property: "og:description", content: "Badges, XP, levels and certificates you have earned." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type Filter = "all" | "earned" | "locked";

function BadgeIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Trophy;
  return <Cmp className={className} />;
}

function Page() {
  const [filter, setFilter] = useState<Filter>("all");

  const earned = achievements.filter((a) => a.earned);
  const levelPercent = Math.round((student.xp / student.xpToNextLevel) * 100);
  const completedCerts = certificates.filter((c) => c.completed);
  const visible = achievements.filter((a) =>
    filter === "all" ? true : filter === "earned" ? a.earned : !a.earned,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Badges, XP, levels and certificates you have earned."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total XP" value={student.xp.toLocaleString()} hint={`Level ${student.level} · ${student.levelTitle}`} icon={Zap} tone="primary" />
        <StatCard label="Badges earned" value={`${earned.length}/${achievements.length}`} hint="Keep going to unlock more" icon={Award} tone="electric" />
        <StatCard label="Current streak" value={`${student.streak} days`} hint="Learn daily to extend it" icon={Flame} tone="warning" />
        <StatCard label="Certificates" value={`${completedCerts.length}/${certificates.length}`} hint="Issued by TechEdu Academy" icon={Star} tone="success" />
      </div>

      <div className="card-surface flex flex-col gap-6 p-5 sm:flex-row sm:items-center">
        <ProgressRing value={levelPercent} size={96} label="Level progress" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Level {student.level} — {student.levelTitle}
            </h2>
            <Badge variant="secondary">{student.xpToNextLevel - student.xp} XP to level {student.level + 1}</Badge>
          </div>
          <Progress value={levelPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {student.xp.toLocaleString()} / {student.xpToNextLevel.toLocaleString()} XP
          </p>
        </div>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="xp">How XP works</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "earned", "locked"] as Filter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => (
              <motion.div
                key={a.id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className={cn(
                  "card-surface flex gap-3 p-4",
                  !a.earned && "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    a.earned ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {a.earned ? <BadgeIcon name={a.icon} className="size-5" /> : <Lock className="size-5" />}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {a.earned ? `Earned ${a.earnedAt}` : "Locked"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <div key={c.id} className="card-surface space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.issuer}</p>
                </div>
                <Badge variant={c.completed ? "default" : "secondary"}>
                  {c.completed ? "Issued" : "In progress"}
                </Badge>
              </div>
              <Progress value={c.progress} className="h-2" />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {c.completed ? `Issued ${c.issuedAt}` : `${c.progress}% complete`}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!c.completed}
                  onClick={() => toast.success(`Downloading “${c.title}” certificate`)}
                >
                  <Download className="size-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Tabs defaultValue="weekly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all-time">All time</TabsTrigger>
            </TabsList>
            {(Object.keys(leaderboards) as Array<keyof typeof leaderboards>).map((key) => (
              <TabsContent key={key} value={key} className="card-surface divide-y divide-border p-0">
                {leaderboards[key].map((e) => (
                  <div
                    key={e.rank}
                    className={cn(
                      "flex items-center gap-3 p-4",
                      e.isCurrentUser && "bg-primary-soft/60",
                    )}
                  >
                    <span className="w-6 text-sm font-semibold text-muted-foreground">#{e.rank}</span>
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {e.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {e.name}
                        {e.isCurrentUser ? <span className="ml-2 text-xs text-primary">You</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.projects} projects · {e.streak} day streak
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{e.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="xp" className="card-surface divide-y divide-border p-0">
          {xpRules.map((r) => (
            <div key={r.action} className="flex items-center justify-between gap-3 p-4">
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="size-4 text-primary" />
                {r.action}
              </span>
              <Badge variant="secondary">+{r.xp} XP</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
