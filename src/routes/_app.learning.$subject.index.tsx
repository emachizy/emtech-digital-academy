import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Lock } from "lucide-react";
import { DifficultyBadge, StatusBadge } from "@/components/shared/badges";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressRing } from "@/components/shared/progress-ring";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/learning/$subject/")({
  head: () => ({
    meta: [
      { title: "Subject — Emtech Digital Academy" },
      { name: "description", content: "Work through the curriculum topic by topic." },
      { property: "og:title", content: "Subject — Emtech Digital Academy" },
      { property: "og:description", content: "Work through the curriculum topic by topic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useParams();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["subject", subject],
    queryFn: () => api.getSubject(subject),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subject"
        title={data?.subject.name ?? "Loading…"}
        description={data?.subject.description ?? ""}
        actions={
          data ? <ProgressRing value={data.subject.progress} label="Subject progress" /> : null
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <ListSkeleton />
      ) : (
        <ol className="space-y-3">
          {data.topics.map((topic, index) => {
            const locked = topic.status === "locked";
            const inner = (
              <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                    {locked ? <Lock className="size-3.5" /> : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{topic.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{topic.summary}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {topic.duration}
                  </span>
                  <DifficultyBadge value={topic.difficulty} />
                  <StatusBadge value={topic.status} />
                </div>
              </div>
            );

            return (
              <li key={topic.id}>
                {locked ? (
                  <div className="cursor-not-allowed opacity-60">{inner}</div>
                ) : (
                  <Link
                    to="/learning/$subject/$topicId"
                    params={{ subject, topicId: topic.id }}
                    className="block transition-transform hover:-translate-y-0.5"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
