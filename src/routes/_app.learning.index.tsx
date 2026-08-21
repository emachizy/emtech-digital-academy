import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectCard } from "@/components/shared/subject-card";
import { ErrorState, GridSkeleton } from "@/components/shared/states";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/learning/")({
  head: () => ({
    meta: [
      { title: "Learning — TechEdu" },
      { name: "description", content: "Your Frontend Development track, subject by subject." },
      { property: "og:title", content: "Learning — TechEdu" },
      { property: "og:description", content: "Your Frontend Development track, subject by subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["tracks"],
    queryFn: api.getTracks,
  });

  const track = data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning track"
        title="Frontend Development"
        description="From semantic markup to production React apps. Pick up wherever you left off."
      />

      {track ? (
        <div className="card-surface p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Track progress</span>
            <span className="text-muted-foreground">{track.progress}%</span>
          </div>
          <Progress value={track.progress} className="mt-3 h-2" />
        </div>
      ) : null}

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <GridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {track?.subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}
    </div>
  );
}
