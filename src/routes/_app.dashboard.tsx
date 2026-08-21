import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, Flame, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SubjectCard } from "@/components/shared/subject-card";
import { ErrorState, GridSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { student } from "@/data/student";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TechEdu" },
      {
        name: "description",
        content:
          "Your personalised learning command centre: progress, streak, XP and what to do next.",
      },
      { property: "og:title", content: "Dashboard — TechEdu" },
      {
        property: "og:description",
        content:
          "Your personalised learning command centre: progress, streak, XP and what to do next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["tracks"],
    queryFn: api.getTracks,
  });
  const track = data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Welcome back"
        title={`Hi ${student.name.split(" ")[0]}, ready to continue?`}
        description="You are on track this week. Keep the streak alive."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current level"
          value={`Level ${student.level}`}
          icon={Trophy}
          hint={`${student.xp} XP total`}
        />
        <StatCard
          label="Day streak"
          value={`${student.streak} days`}
          icon={Flame}
          hint="Personal best"
        />
        <StatCard
          label="Attendance"
          value={`${student.attendanceRate}%`}
          icon={CalendarCheck}
          hint="This cohort"
        />
        <StatCard
          label="Topics done"
          value={String(student.topicsCompleted)}
          icon={BookOpen}
          hint="Across all subjects"
        />
      </div>

      <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Continue learning
          </p>
          <p className="mt-1 truncate text-base font-semibold text-foreground">{student.track}</p>
          <Progress value={track?.progress ?? 0} className="mt-3 h-2 max-w-sm" />
        </div>
        <Button asChild>
          <Link to="/learning">Resume track</Link>
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <GridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {track?.subjects.slice(0, 6).map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}
    </div>
  );
}
