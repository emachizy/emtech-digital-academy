import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { DifficultyBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Difficulty, Lesson } from "@/types";

interface LessonLoaderData {
  lesson: Lesson;
  subjectName: string;
  difficulty: Difficulty;
  position: number;
  total: number;
  prev: string | null;
  next: string | null;
  completed: boolean;
}

export const Route = createFileRoute("/_app/learning/$subject/$topicId")({
  loader: async ({ params }): Promise<LessonLoaderData> => {
    const { lesson, topics, subject } = await api.getLesson(params.subject, params.topicId);
    const index = topics.findIndex((t) => t.id === params.topicId);
    return {
      lesson,
      subjectName: subject.name,
      difficulty: topics[index]?.difficulty ?? "Easy",
      position: index + 1,
      total: topics.length,
      prev: topics[index - 1]?.id ?? null,
      next: topics[index + 1]?.id ?? null,
      completed: topics[index]?.status === "completed",
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Lesson unavailable — Emtech Digital Academy" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.lesson.title} — ${loaderData.subjectName} — Emtech Digital Academy`;
    const description = loaderData.lesson.intro;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: LessonNotFound,
  component: Page,
});

function LessonNotFound() {
  return (
    <EmptyState
      title="Lesson not found"
      description="This lesson doesn't exist or has moved."
      action={
        <Button asChild variant="outline">
          <Link to="/learning">Back to learning</Link>
        </Button>
      }
    />
  );
}

function Page() {
  const { subject } = Route.useParams();
  const router = useRouter();
  const { lesson, subjectName, difficulty, position, total, prev, next, completed } =
    Route.useLoaderData() as LessonLoaderData;
  const [justCompleted, setJustCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [code, setCode] = useState(lesson.exercise.starter);

  const isComplete = completed || justCompleted;

  async function handleMarkComplete() {
    setSaving(true);
    try {
      await api.markLessonComplete(lesson.id);
      setJustCompleted(true);
      toast.success("Lesson marked complete", { description: lesson.title });
      await router.invalidate();
    } catch {
      toast.error("Couldn't save your progress. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const score = lesson.quiz.reduce((n, q, i) => n + (answers[i] === q.answerIndex ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/learning" className="hover:text-foreground">
          Learning
        </Link>
        <span>/</span>
        <Link to="/learning/$subject" params={{ subject }} className="hover:text-foreground">
          {subjectName}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary-soft text-primary">
              Lesson {position} of {total}
            </Badge>
            <DifficultyBadge value={difficulty} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {lesson.durationMinutes} min
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{lesson.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{lesson.intro}</p>
        </div>
        <Button
          variant={isComplete ? "outline" : "default"}
          disabled={isComplete || saving}
          onClick={handleMarkComplete}
        >
          <CheckCircle2 className="size-4" />
          {isComplete ? "Completed" : saving ? "Saving…" : "Mark as complete"}
        </Button>
      </div>

      <Progress value={isComplete ? 100 : Math.round((position / total) * 100)} className="h-2" />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="card-surface overflow-hidden">
            <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary/15 via-background to-electric/15">
              <button
                type="button"
                onClick={() => toast("Video playback is a prototype placeholder")}
                className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
                aria-label="Play lesson video"
              >
                <Play className="size-6" />
              </button>
              <span className="absolute bottom-3 left-4 text-xs font-medium text-muted-foreground">
                {lesson.videoLabel}
              </span>
            </div>
          </div>

          <Tabs defaultValue="notes">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="exercise">Exercise</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="card-surface mt-4 space-y-6 p-5">
              {lesson.sections.map((section) => (
                <article key={section.heading} className="space-y-2">
                  <h2 className="text-base font-semibold text-foreground">{section.heading}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  {section.code ? (
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-xs leading-relaxed text-foreground">
                      <code>{section.code}</code>
                    </pre>
                  ) : null}
                </article>
              ))}
            </TabsContent>

            <TabsContent value="exercise" className="card-surface mt-4 space-y-4 p-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Practice</h2>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.exercise.prompt}</p>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="min-h-56 font-mono text-xs"
                aria-label="Exercise code editor"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Nice work — solution saved")}>
                  Run &amp; save
                </Button>
                <Button variant="outline" onClick={() => setCode(lesson.exercise.starter)}>
                  <RotateCcw className="size-4" /> Reset
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="card-surface mt-4 space-y-6 p-5">
              {lesson.quiz.map((q, qi) => (
                <fieldset key={q.question} className="space-y-3">
                  <legend className="text-sm font-semibold text-foreground">
                    {qi + 1}. {q.question}
                  </legend>
                  <div className="space-y-2">
                    {q.options.map((option, oi) => {
                      const selected = answers[qi] === oi;
                      const correct = submitted && oi === q.answerIndex;
                      const wrong = submitted && selected && oi !== q.answerIndex;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={cn(
                            "w-full rounded-lg border border-border px-4 py-2.5 text-left text-sm transition-colors",
                            selected && !submitted && "border-primary bg-primary-soft text-primary",
                            correct && "border-success/40 bg-success/10 text-success",
                            wrong && "border-destructive/40 bg-destructive/10 text-destructive",
                            !submitted && "hover:bg-accent",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <Separator />
              {submitted ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    You scored {score} / {lesson.quiz.length}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setAnswers({});
                    }}
                  >
                    <RotateCcw className="size-4" /> Retake
                  </Button>
                </div>
              ) : (
                <Button
                  disabled={Object.keys(answers).length < lesson.quiz.length}
                  onClick={() => setSubmitted(true)}
                >
                  Submit answers
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <div className="card-surface p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <BookOpen className="size-4 text-primary" /> Resources
            </h2>
            <ul className="mt-4 space-y-2">
              {lesson.resources.map((r) => (
                <li key={r.label}>
                  <button
                    type="button"
                    onClick={() => toast(`${r.label} — prototype resource`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      {r.type === "Download" ? (
                        <Download className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {r.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">{r.type}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface space-y-3 p-5">
            <h2 className="text-base font-semibold text-foreground">Continue</h2>
            <div className="flex gap-2">
              {prev ? (
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/learning/$subject/$topicId" params={{ subject, topicId: prev }}>
                    <ArrowLeft className="size-4" /> Previous
                  </Link>
                </Button>
              ) : null}
              {next ? (
                <Button asChild className="flex-1">
                  <Link to="/learning/$subject/$topicId" params={{ subject, topicId: next }}>
                    Next <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/learning/$subject" params={{ subject }}>
                    Back to subject
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
