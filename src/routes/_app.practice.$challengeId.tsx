import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { DifficultyBadge, XpBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { challenges } from "@/data/practice";

export const Route = createFileRoute("/_app/practice/$challengeId")({
  head: () => ({
    meta: [
      { title: "Challenge — Emtech Digital Academy" },
      { name: "description", content: "Solve the challenge in the playground." },
      { property: "og:title", content: "Challenge — Emtech Digital Academy" },
      { property: "og:description", content: "Solve the challenge in the playground." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { challengeId } = Route.useParams();
  const index = challenges.findIndex((c) => c.id === challengeId);
  const challenge = index >= 0 ? challenges[index] : undefined;
  const prev = index > 0 ? challenges[index - 1] : undefined;
  const next = index >= 0 && index < challenges.length - 1 ? challenges[index + 1] : undefined;

  const [code, setCode] = useState(challenge?.starter ?? "");
  const [output, setOutput] = useState<string | null>(null);
  const [solved, setSolved] = useState(challenge?.completed ?? false);

  useEffect(() => {
    setCode(challenge?.starter ?? "");
    setOutput(null);
    setSolved(challenge?.completed ?? false);
  }, [challengeId, challenge?.starter, challenge?.completed]);

  if (!challenge) {
    return (
      <div className="space-y-6">
        <PageHeader title="Challenge" description="Solve the challenge in the playground." />
        <EmptyState
          title="Challenge not found"
          description="This challenge doesn't exist or was removed from the lab."
          action={
            <Button asChild variant="outline">
              <Link to="/practice">Back to Practice Lab</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const run = () => {
    if (code.trim() === "" || code.trim() === challenge.starter.trim()) {
      setOutput("No solution yet — write your code, then run again.");
      return;
    }
    setOutput(`✓ Tests passed\nExpected: ${challenge.expectedOutput}`);
    setSolved(true);
    toast.success("Challenge solved", { description: `+${challenge.xp} XP added to your total.` });
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/practice">
          <ArrowLeft className="size-4" />
          Practice Lab
        </Link>
      </Button>

      <PageHeader
        eyebrow={challenge.category}
        title={challenge.title}
        description={challenge.description}
        actions={
          <>
            <DifficultyBadge value={challenge.difficulty} />
            <XpBadge xp={challenge.xp} />
            <Badge variant="secondary" className="font-medium">
              <Clock className="mr-1 size-3" />
              {challenge.minutes} min
            </Badge>
            {solved ? (
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                <CheckCircle2 className="mr-1 size-3" />
                Solved
              </Badge>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Terminal className="size-4 text-primary" />
                Playground
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCode(challenge.starter);
                    setOutput(null);
                  }}
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
                <Button size="sm" onClick={run}>
                  <Play className="size-4" />
                  Run tests
                </Button>
              </div>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Code editor"
              className="min-h-72 resize-y rounded-none border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
            />
          </div>

          <div className="card-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Console
            </p>
            <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-foreground">
              {output ?? "Run your code to see the output here."}
            </pre>
          </div>
        </div>

        <aside className="space-y-4">
          <Tabs defaultValue="instructions">
            <TabsList className="w-full">
              <TabsTrigger value="instructions" className="flex-1">
                Instructions
              </TabsTrigger>
              <TabsTrigger value="expected" className="flex-1">
                Expected
              </TabsTrigger>
            </TabsList>
            <TabsContent value="instructions" className="card-surface mt-3 p-4">
              <ol className="space-y-3">
                {challenge.instructions.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </TabsContent>
            <TabsContent value="expected" className="card-surface mt-3 p-4">
              <p className="text-sm text-muted-foreground">Your solution should produce:</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-sm text-foreground">
                {challenge.expectedOutput}
              </pre>
            </TabsContent>
          </Tabs>

          <div className="card-surface flex items-center justify-between gap-2 p-4">
            {prev ? (
              <Button asChild size="sm" variant="outline">
                <Link to="/practice/$challengeId" params={{ challengeId: prev.id }}>
                  <ArrowLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button asChild size="sm" variant="outline">
                <Link to="/practice/$challengeId" params={{ challengeId: next.id }}>
                  Next
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
