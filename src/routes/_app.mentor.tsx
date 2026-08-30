import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarCheck, ExternalLink, FolderKanban, Github, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { PendingSubmission } from "@/lib/api/mentor.functions";
import { roleHome } from "@/lib/permissions";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/_app/mentor")({
  beforeLoad: ({ context }) => {
    if (context.auth.role !== "mentor") {
      throw redirect({ to: roleHome[context.auth.role] });
    }
  },
  head: () => ({
    meta: [
      { title: "Mentor Workspace — Emtech Digital Academy" },
      { name: "description", content: "Your assigned cohort, students and pending reviews." },
      { property: "og:title", content: "Mentor Workspace — Emtech Digital Academy" },
      {
        property: "og:description",
        content: "Your assigned cohort, students and pending reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const overviewQuery = useQuery({
    queryKey: ["mentor-overview"],
    queryFn: api.mentor.getOverview,
  });
  const submissionsQuery = useQuery({
    queryKey: ["mentor-pending-submissions"],
    queryFn: api.mentor.getPendingSubmissions,
  });
  const [reviewing, setReviewing] = useState<PendingSubmission | null>(null);

  const isPending = overviewQuery.isPending || submissionsQuery.isPending;
  const isError = overviewQuery.isError || submissionsQuery.isError;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mentor Workspace" description="Your assigned cohort and students." />
        <ErrorState
          onRetry={() => {
            void overviewQuery.refetch();
            void submissionsQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mentor Workspace" description="Your assigned cohort and students." />
        <ListSkeleton />
      </div>
    );
  }

  const { cohort, students } = overviewQuery.data;
  const submissions = submissionsQuery.data;

  if (!cohort) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mentor Workspace" description="You are not assigned to a cohort yet." />
      </div>
    );
  }

  const avgAttendance = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)
    : 0;
  const avgProgress = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={cohort.code}
        title="Mentor Workspace"
        description={`${cohort.name} · ${cohort.periodLabel}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={String(students.length)} icon={Users} />
        <StatCard
          label="Pending reviews"
          value={String(submissions.length)}
          icon={FolderKanban}
          tone={submissions.length ? "warning" : "primary"}
        />
        <StatCard label="Avg. attendance" value={`${avgAttendance}%`} icon={CalendarCheck} />
        <StatCard label="Avg. progress" value={`${avgProgress}%`} icon={Users} tone="electric" />
      </div>

      <section className="card-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Students</h2>
        <ul className="mt-4 divide-y divide-border">
          {students.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9 border border-border">
                  <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
                    {initials(s.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{s.overallProgress}% progress</span>
                <span>{s.attendanceRate}% attendance</span>
                <span>{s.projectsCompleted} projects approved</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Pending reviews</h2>
        {submissions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nothing waiting on you right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.projectTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.studentName}
                    {s.submittedAt
                      ? ` · Submitted ${new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : ""}
                  </p>
                </div>
                <Button size="sm" onClick={() => setReviewing(s)}>
                  Review
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReviewDialog
        submission={reviewing}
        onClose={() => setReviewing(null)}
        onSuccess={() => {
          setReviewing(null);
          void queryClient.invalidateQueries({ queryKey: ["mentor-pending-submissions"] });
          void queryClient.invalidateQueries({ queryKey: ["mentor-overview"] });
        }}
      />
    </div>
  );
}

type Decision = "approved" | "changes_requested" | "rejected";

function ReviewDialog({
  submission,
  onClose,
  onSuccess,
}: {
  submission: PendingSubmission | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [score, setScore] = useState(80);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<Decision>("approved");
  const [saving, setSaving] = useState(false);

  if (!submission) return null;

  async function handleSubmit() {
    setSaving(true);
    try {
      const categories = submission!.rubric.map((r) => ({ name: r.criterion, score }));
      await api.mentor.submitReview({
        submissionId: submission!.id,
        score,
        decision,
        categories,
        ...(comment ? { comment } : {}),
      });
      toast.success("Review submitted", { description: submission!.studentName });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit review. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{submission.projectTitle}</DialogTitle>
          <DialogDescription>{submission.studentName}&rsquo;s submission</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            {submission.repoUrl ? (
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Github className="size-4" /> Repository
              </a>
            ) : null}
            {submission.liveUrl ? (
              <a
                href={submission.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <ExternalLink className="size-4" /> Live site
              </a>
            ) : null}
          </div>
          {submission.notes ? (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              {submission.notes}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="review-score">Score</Label>
            <Input
              id="review-score"
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-decision">Decision</Label>
            <Select value={decision} onValueChange={(v) => setDecision(v as Decision)}>
              <SelectTrigger id="review-decision">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="changes_requested">Request changes</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Feedback</Label>
            <Textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did they do well? What should they improve?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Submitting…" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
