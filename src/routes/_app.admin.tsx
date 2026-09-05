import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CalendarCheck,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { CohortSummary, MentorSummary } from "@/lib/api/admin.functions";
import type { ContactInfo } from "@/lib/api/contact.functions";
import { roleHome } from "@/lib/permissions";
import { initials } from "@/lib/utils";

const UNASSIGNED = "unassigned";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: ({ context }) => {
    if (context.auth.role !== "admin") {
      throw redirect({ to: roleHome[context.auth.role] });
    }
  },
  head: () => ({
    meta: [
      { title: "Administration — Emtech Digital Academy" },
      { name: "description", content: "Cohorts, mentors and platform-wide analytics." },
      { property: "og:title", content: "Administration — Emtech Digital Academy" },
      { property: "og:description", content: "Cohorts, mentors and platform-wide analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: api.admin.getOverview,
  });
  const cohortsQuery = useQuery({
    queryKey: ["admin-cohorts"],
    queryFn: api.admin.getCohorts,
  });
  const mentorsQuery = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: api.admin.getMentors,
  });
  const contactQuery = useQuery({
    queryKey: ["contact-info"],
    queryFn: api.getContactInfo,
  });
  const [assigning, setAssigning] = useState<CohortSummary | null>(null);

  const isPending =
    overviewQuery.isPending ||
    cohortsQuery.isPending ||
    mentorsQuery.isPending ||
    contactQuery.isPending;
  const isError =
    overviewQuery.isError || cohortsQuery.isError || mentorsQuery.isError || contactQuery.isError;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Administration" description="Cohorts, mentors and platform analytics." />
        <ErrorState
          onRetry={() => {
            void overviewQuery.refetch();
            void cohortsQuery.refetch();
            void mentorsQuery.refetch();
            void contactQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Administration" description="Cohorts, mentors and platform analytics." />
        <ListSkeleton />
      </div>
    );
  }

  const overview = overviewQuery.data;
  const cohorts = cohortsQuery.data;
  const mentors = mentorsQuery.data;
  const contact = contactQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Administration" description="Cohorts, mentors and platform analytics." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Students" value={String(overview.totalStudents)} icon={GraduationCap} />
        <StatCard label="Mentors" value={String(overview.totalMentors)} icon={UserCog} />
        <StatCard label="Cohorts" value={String(overview.totalCohorts)} icon={Users} />
        <StatCard
          label="Pending reviews"
          value={String(overview.pendingSubmissions)}
          icon={FolderKanban}
          tone={overview.pendingSubmissions ? "warning" : "primary"}
        />
        <StatCard
          label="Avg. attendance"
          value={`${overview.avgAttendanceRate}%`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Avg. progress"
          value={`${overview.avgProgress}%`}
          icon={TrendingUp}
          tone="electric"
        />
      </div>

      <section className="card-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Cohorts</h2>
        {cohorts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No cohorts yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {cohorts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.name} <span className="text-muted-foreground">· {c.code}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.periodLabel} · {c.studentCount} students
                    {c.instructorName ? ` · Instructor: ${c.instructorName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {c.mentorName ? (
                    <Badge variant="secondary">{c.mentorName}</Badge>
                  ) : (
                    <Badge variant="outline">Unassigned</Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setAssigning(c)}>
                    Assign mentor
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Mentors</h2>
        {mentors.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No mentors yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {mentors.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9 border border-border">
                    <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.cohortName ?? "No cohort assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>{m.studentCount} students</span>
                  <span>{m.pendingReviews} pending reviews</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {contact ? (
        <ContactInfoForm
          contact={contact}
          onSaved={() => void queryClient.invalidateQueries({ queryKey: ["contact-info"] })}
        />
      ) : null}

      <AssignMentorDialog
        cohort={assigning}
        mentors={mentors}
        onClose={() => setAssigning(null)}
        onSuccess={() => {
          setAssigning(null);
          void queryClient.invalidateQueries({ queryKey: ["admin-cohorts"] });
          void queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
        }}
      />
    </div>
  );
}

function ContactInfoForm({ contact, onSaved }: { contact: ContactInfo; onSaved: () => void }) {
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [hours, setHours] = useState(contact.hours ?? "");
  const [address, setAddress] = useState(contact.address ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      await api.admin.updateContactInfo({
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(hours ? { hours } : {}),
        ...(address ? { address } : {}),
      });
      toast.success("Contact page updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-surface space-y-4 p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Contact page</h2>
        <p className="text-sm text-muted-foreground">
          What appears on the public /contact page — email, phone, hours and address.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-info-email">Email</Label>
          <Input
            id="contact-info-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-info-phone">Phone number</Label>
          <Input id="contact-info-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-info-hours">Hours of operation</Label>
        <Textarea
          id="contact-info-hours"
          rows={2}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder={"Monday – Friday: 9:00am – 6:00pm"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-info-address">Address</Label>
        <Textarea
          id="contact-info-address"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </section>
  );
}

function AssignMentorDialog({
  cohort,
  mentors,
  onClose,
  onSuccess,
}: {
  cohort: CohortSummary | null;
  mentors: MentorSummary[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState(UNASSIGNED);
  const [saving, setSaving] = useState(false);

  if (!cohort) return null;
  const value = selected === UNASSIGNED && cohort.mentorId ? cohort.mentorId : selected;

  async function handleSubmit() {
    setSaving(true);
    try {
      await api.admin.assignMentor({
        cohortId: cohort!.id,
        mentorProfileId: value === UNASSIGNED ? null : value,
      });
      toast.success("Mentor assignment updated", { description: cohort!.name });
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't update assignment. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          setSelected(UNASSIGNED);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign mentor</DialogTitle>
          <DialogDescription>{cohort.name}</DialogDescription>
        </DialogHeader>

        <Select value={value} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {mentors.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
