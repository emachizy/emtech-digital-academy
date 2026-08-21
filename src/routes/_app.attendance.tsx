import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { attendanceHistory, attendanceSummary, getMonthAttendance } from "@/data/attendance";
import { upcomingClasses } from "@/data/student";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — TechEdu" },
      {
        name: "description",
        content: "Track your class attendance and check in to today's session.",
      },
      { property: "og:title", content: "Attendance — TechEdu" },
      {
        property: "og:description",
        content: "Track your class attendance and check in to today's session.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [filter, setFilter] = useState<"all" | "present" | "late" | "absent">("all");

  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthMap = useMemo(() => getMonthAttendance(year, month), [year, month]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

  const filtered = attendanceHistory.filter((r) => filter === "all" || r.status === filter);
  const nextClass = upcomingClasses[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendance"
        title="Attendance"
        description="Track your class attendance and check in to today's session."
        actions={
          <Button
            disabled={checkedIn}
            onClick={() => {
              setCheckedIn(true);
              toast.success("Checked in", { description: nextClass?.title ?? "Today's session" });
            }}
          >
            <CalendarCheck className="size-4" />
            {checkedIn ? "Checked in" : "Check in to today's class"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${attendanceSummary.rate}%`}
          hint="This cohort"
          icon={CalendarCheck}
        />
        <StatCard
          label="Attended"
          value={`${attendanceSummary.attended}`}
          hint="Classes"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Late"
          value={`${attendanceSummary.late}`}
          hint="Arrivals"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Missed"
          value={`${attendanceSummary.missed}`}
          hint="Classes"
          icon={XCircle}
          tone="destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous month"
                onClick={() => setMonthOffset((v) => v - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next month"
                disabled={monthOffset >= 0}
                onClick={() => setMonthOffset((v) => v + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = monthMap[day] ?? "none";
              const isToday = monthOffset === 0 && day === today.getDate();
              return (
                <div
                  key={day}
                  title={`${day}: ${status}`}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-sm font-medium",
                    dayTone[status],
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {(["present", "late", "absent", "none"] as AttendanceStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-2">
                <span className={cn("size-3 rounded-sm", dayTone[s])} />
                {legendLabel[s]}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="card-surface flex items-center gap-4 p-5">
            <ProgressRing value={attendanceSummary.rate} size={84} label="Attendance" />
            <div>
              <p className="text-sm font-semibold text-foreground">Great consistency</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay above 85% to remain eligible for cohort certification.
              </p>
            </div>
          </div>

          <div className="card-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Upcoming classes</h2>
            <ul className="mt-4 space-y-3">
              {upcomingClasses.slice(0, 4).map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.day} · {c.time} · {c.instructor}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {c.mode}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="card-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Attendance history</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", "present", "late", "absent"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {filtered.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{r.className}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.date} · {r.time} · {r.instructor}
                </p>
              </div>
              <Badge variant="outline" className={cn("capitalize", statusTone[r.status])}>
                {r.status}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const dayTone: Record<AttendanceStatus, string> = {
  present: "bg-success/15 text-success",
  late: "bg-warning/20 text-warning",
  absent: "bg-destructive/15 text-destructive",
  none: "bg-muted text-muted-foreground",
};

const legendLabel: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  none: "No class",
};

const statusTone: Record<Exclude<AttendanceStatus, "none">, string> = {
  present: "border-success/30 bg-success/10 text-success",
  late: "border-warning/35 bg-warning/12 text-warning",
  absent: "border-destructive/30 bg-destructive/10 text-destructive",
};
