import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, FileText, Github, Link2, Target, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { DifficultyBadge, XpBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { ProjectDetail } from "@/lib/api/projects.functions";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export const Route = createFileRoute("/_app/projects/$slug")({
  loader: ({ params }): Promise<ProjectDetail> => api.getProject(params.slug),
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.project.title} — Project — TechEdu`
      : "Project — TechEdu";
    const description = loaderData
      ? loaderData.project.summary
      : "Requirements, submission and mentor feedback.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: ProjectNotFound,
  component: Page,
});

function ProjectNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Project not found" description="This project isn't part of your track." />
      <EmptyState
        title="Nothing here"
        description="The project you're looking for doesn't exist or was unassigned."
        action={
          <Button asChild variant="outline">
            <Link to="/projects">Back to projects</Link>
          </Button>
        }
      />
    </div>
  );
}

function Page() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const { project, submission } = Route.useLoaderData();
  const [repo, setRepo] = useState(submission?.repoUrl ?? "");
  const [live, setLive] = useState(submission?.liveUrl ?? "");
  const [notes, setNotes] = useState(submission?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const status = project.status;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.submitProject({
        slug,
        repoUrl: repo,
        ...(live ? { liveUrl: live } : {}),
        ...(notes ? { notes } : {}),
      });
      toast.success("Project submitted", {
        description: "Your mentor will review it within 48 hours.",
      });
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/projects">
          <ArrowLeft className="size-4" />
          All projects
        </Link>
      </Button>

      <PageHeader
        eyebrow="Project"
        title={project.title}
        description={project.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge value={project.difficulty} />
            <XpBadge xp={project.xp} />
            <Badge variant="outline" className={cn(statusTone[status])}>
              {statusLabel[status]}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="card-surface p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progress</span>
              <span className="text-muted-foreground">
                {project.progress}% · due {project.deadline}
              </span>
            </div>
            <Progress value={project.progress} className="mt-3 h-2" />
          </section>

          <Tabs defaultValue="brief" className="card-surface p-5">
            <TabsList>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="submit">Submit</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="brief" className="mt-5 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">Overview</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {project.overview}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Learning objectives</h3>
                <ul className="mt-2 space-y-2">
                  {project.objectives.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
                <ul className="mt-2 space-y-2">
                  {project.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Instructions</h3>
                <ol className="mt-2 space-y-2">
                  {project.instructions.map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="submit" className="mt-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Submission requirements</h2>
                <ul className="mt-2 space-y-2">
                  {project.submissionRequirements.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="repo">GitHub repository URL</Label>
                  <div className="relative">
                    <Github className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="repo"
                      required
                      type="url"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="https://github.com/you/project"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="live">Live site URL</Label>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="live"
                      type="url"
                      value={live}
                      onChange={(e) => setLive(e.target.value)}
                      placeholder="https://your-project.app"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Description of your approach</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you build, what was hard, and what would you improve?"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    <Upload className="size-4" />
                    {saving ? "Submitting…" : submission ? "Resubmit project" : "Submit project"}
                  </Button>
                  {status === "submitted" ? (
                    <span className="text-sm text-success">
                      Submitted — awaiting mentor review.
                    </span>
                  ) : null}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="feedback" className="mt-5">
              {project.feedback ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Reviewed by {project.feedback.mentor}
                      </p>
                      <p className="text-xs text-muted-foreground">{project.feedback.reviewedAt}</p>
                    </div>
                    <span className="text-2xl font-semibold text-foreground">
                      {project.feedback.score}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {project.feedback.categories.map((c) => (
                      <div key={c.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{c.name}</span>
                          <span className="font-medium text-foreground">{c.score}</span>
                        </div>
                        <Progress value={c.score} className="h-2" />
                      </div>
                    ))}
                  </div>

                  <blockquote className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {project.feedback.comment}
                  </blockquote>
                </div>
              ) : (
                <EmptyState
                  title="No feedback yet"
                  description="Submit your project and your mentor's review will appear here."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <section className="card-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Grading rubric</h2>
            <ul className="mt-4 space-y-3">
              {project.rubric.map((r) => (
                <li key={r.criterion} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{r.criterion}</p>
                    <Badge variant="secondary">{r.weight}%</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Technologies</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Resources</h2>
            <ul className="mt-3 space-y-2">
              {project.resources.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <span className="text-sm text-foreground">{r.label}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {r.type}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

const statusLabel: Record<Project["status"], string> = {
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
