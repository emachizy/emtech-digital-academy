import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Atom,
  Award,
  Braces,
  CalendarCheck,
  FileCode2,
  FlaskConical,
  FolderKanban,
  GitBranch,
  Globe,
  Palette,
  Plug,
  Rocket,
  Type,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emtech Digital Academy — Tech Academy Operating System" },
      {
        name: "description",
        content:
          "Emtech Digital Academy is the operating system for modern tech academies: tracks, lessons, attendance, practice labs, projects and portfolios in one place.",
      },
      {
        property: "og:title",
        content: "Emtech Digital Academy — Tech Academy Operating System",
      },
      {
        property: "og:description",
        content:
          "Emtech Digital Academy is the operating system for modern tech academies: tracks, lessons, attendance, practice labs, projects and portfolios in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const toneClasses: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  electric: "bg-electric/12 text-electric",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
};

const subjects: { name: string; icon: LucideIcon; color: string; description: string }[] = [
  {
    name: "HTML",
    icon: FileCode2,
    color: "electric",
    description: "Structure, semantics and accessible markup.",
  },
  {
    name: "CSS",
    icon: Palette,
    color: "primary",
    description: "Layout, responsive design and modern styling.",
  },
  {
    name: "JavaScript",
    icon: Braces,
    color: "warning",
    description: "The language of the web, from syntax to async.",
  },
  {
    name: "Git & GitHub",
    icon: GitBranch,
    color: "success",
    description: "Version control and collaborating with a team.",
  },
  {
    name: "React",
    icon: Atom,
    color: "electric",
    description: "Components, state and building real interfaces.",
  },
  {
    name: "APIs",
    icon: Plug,
    color: "primary",
    description: "Fetching, REST conventions and error handling.",
  },
  {
    name: "TypeScript",
    icon: Type,
    color: "electric",
    description: "Types, generics and safer JavaScript.",
  },
  {
    name: "Testing",
    icon: FlaskConical,
    color: "success",
    description: "Unit, integration and confidence in your code.",
  },
  {
    name: "Deployment",
    icon: Rocket,
    color: "warning",
    description: "Shipping to production and CI basics.",
  },
];

const benefits: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FolderKanban,
    title: "Structured curriculum",
    description: "Tracks broken into subjects, topics and lessons you complete in order.",
  },
  {
    icon: Users,
    title: "Real mentor feedback",
    description: "Every project you submit is scored and reviewed by an assigned mentor.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance that counts",
    description: "Check in to live sessions and track your attendance rate automatically.",
  },
  {
    icon: Rocket,
    title: "Real projects",
    description: "Ship real GitHub repos and live sites, not disposable toy exercises.",
  },
  {
    icon: Award,
    title: "Certificates & achievements",
    description: "Earn certificates and badges as you clear real milestones.",
  },
  {
    icon: Globe,
    title: "A public portfolio",
    description: "Publish a shareable page that shows off your approved work.",
  },
];

const stats = [
  { value: "9", label: "Subjects" },
  { value: "80+", label: "Lessons" },
  { value: "6", label: "Real projects" },
  { value: "1:1", label: "Mentor reviews" },
];

function Landing() {
  const [announcementOpen, setAnnouncementOpen] = useState(true);

  return (
    <main className="min-h-screen bg-background">
      {announcementOpen ? (
        <div className="flex items-center justify-center gap-3 bg-foreground px-4 py-2 text-center text-xs font-medium text-background">
          <span>Emtech Digital Academy — Learn. Innovate. Transform.</span>
          <button
            type="button"
            onClick={() => setAnnouncementOpen(false)}
            aria-label="Dismiss announcement"
            className="rounded p-0.5 hover:bg-background/10"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <SiteHeader />

      <section className="flex flex-col items-center px-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <img src="/logo-icon.png" alt="" className="size-3.5" /> Tech Academy Operating System
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Everything your academy runs on, in one platform
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Learning tracks, attendance, practice labs, real projects, mentor feedback and a portfolio
          that proves what you can build.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard">
              Enter the platform <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/p/$slug" params={{ slug: "alex-johnson" }}>
              See a live portfolio
            </Link>
          </Button>
        </div>

        <dl className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</dd>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section id="why-us" className="border-t border-border bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why learn with Emtech Digital Academy?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Built so a cohort has everything it needs in one place — not scattered across five
              tools.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="card-surface p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <benefit.icon className="size-4.5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tracks" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What you'll learn
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The Frontend Development track — nine subjects, eighty lessons, real projects along
              the way.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div key={subject.name} className="card-surface p-5">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    toneClasses[subject.color],
                  )}
                >
                  <subject.icon className="size-4.5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{subject.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{subject.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-6 mb-20 flex flex-col items-center rounded-2xl px-6 py-16 text-center sm:mx-auto sm:max-w-5xl"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
          Ready to start your tech journey?
        </h2>
        <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
          Join a cohort, follow the track and build a portfolio that proves what you can do.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <Link to="/dashboard">
            Enter the platform <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <SiteFooter />
    </main>
  );
}
