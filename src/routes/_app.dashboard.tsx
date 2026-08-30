import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, Flame, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SubjectCard } from "@/components/shared/subject-card";
import { ErrorState, GridSkeleton, ListSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Emtech Digital Academy" },
      {
        name: "description",
        content:
          "Your personalised learning command centre: progress, streak, XP and what to do next.",
      },
      { property: "og:title", content: "Dashboard — Emtech Digital Academy" },
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
  const tracksQuery = useQuery({ queryKey: ["tracks"], queryFn: api.getTracks });
  const studentQuery = useQuery({ queryKey: ["student"], queryFn: api.getStudent });
  const track = tracksQuery.data?.[0];
  const student = studentQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Welcome back"
        title={student ? `Hi ${student.firstName}, ready to continue?` : "Welcome back"}
        description="You are on track this week. Keep the streak alive."
      />

      {studentQuery.isError ? (
        <ErrorState onRetry={() => studentQuery.refetch()} />
      ) : studentQuery.isPending || !student ? (
        <ListSkeleton />
      ) : (
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
      )}

      <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Continue learning
          </p>
          <p className="mt-1 truncate text-base font-semibold text-foreground">
            {student?.track ?? "Your track"}
          </p>
          <Progress value={track?.progress ?? 0} className="mt-3 h-2 max-w-sm" />
        </div>
        <Button asChild>
          {student?.continueLearning ? (
            <Link
              to="/learning/$subject/$topicId"
              params={{
                subject: student.continueLearning.subjectSlug,
                topicId: student.continueLearning.topicId,
              }}
            >
              Resume track
            </Link>
          ) : (
            <Link to="/learning">Resume track</Link>
          )}
        </Button>
      </div>

      {tracksQuery.isError ? (
        <ErrorState onRetry={() => tracksQuery.refetch()} />
      ) : tracksQuery.isPending ? (
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
