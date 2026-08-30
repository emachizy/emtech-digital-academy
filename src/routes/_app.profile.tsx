import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  CalendarCheck,
  FolderKanban,
  Github,
  Linkedin,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { api } from "@/lib/api";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Emtech Digital Academy" },
      { name: "description", content: "Your academy profile, skills and recent activity." },
      { property: "og:title", content: "Profile — Emtech Digital Academy" },
      { property: "og:description", content: "Your academy profile, skills and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const {
    data: student,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["student"],
    queryFn: api.getStudent,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your academy profile, skills and recent activity." />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isPending || !student ? (
        <ListSkeleton />
      ) : (
        <>
          <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <Avatar className="size-16 border border-border">
              <AvatarFallback className="bg-primary-soft text-lg font-semibold text-primary">
                {initials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-lg font-semibold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground">
                {student.track ?? "No track assigned"}
                {student.cohort ? ` · ${student.cohort.name} (${student.cohort.code})` : ""}
              </p>
              {student.bio ? (
                <p className="max-w-2xl text-sm text-muted-foreground">{student.bio}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                {student.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {student.location}
                  </span>
                ) : null}
                {student.githubUrl ? (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Github className="size-3.5" /> GitHub
                  </a>
                ) : null}
                {student.linkedinUrl ? (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Linkedin className="size-3.5" /> LinkedIn
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Overall progress"
              value={`${student.overallProgress}%`}
              icon={BookOpen}
              hint={`${student.topicsCompleted} lessons completed`}
            />
            <StatCard
              label="Attendance"
              value={`${student.attendanceRate}%`}
              icon={CalendarCheck}
              hint={student.cohort ? student.cohort.name : "No cohort yet"}
            />
            <StatCard
              label="Projects approved"
              value={String(student.projectsCompleted)}
              icon={FolderKanban}
            />
            <StatCard
              label="Subjects started"
              value={String(student.skillsEarned)}
              icon={Award}
              hint={`Level ${student.level} · ${student.levelTitle}`}
            />
          </div>

          {student.cohort?.instructorName ? (
            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold text-foreground">Cohort</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.cohort.name} ({student.cohort.code}) · {student.cohort.periodLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                Instructor: {student.cohort.instructorName}
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
