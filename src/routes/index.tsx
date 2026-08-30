import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
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
      </div>
    </main>
  );
}
