import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, ExternalLink, GraduationCap, Github, Linkedin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Portfolio — Emtech Digital Academy" },
      { name: "description", content: `Public developer portfolio — ${params.slug}` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const query = useQuery({
    queryKey: ["public-portfolio", slug],
    queryFn: () => api.getPublicPortfolio(slug),
    retry: false,
  });

  if (query.isPending) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>
      </main>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">Portfolio not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This portfolio doesn't exist or hasn't been published yet.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/">Go home</Link>
        </Button>
      </main>
    );
  }

  const p = query.data;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16 border border-border">
          <AvatarFallback className="bg-primary-soft text-lg font-semibold text-primary">
            {initials(p.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">{p.name}</h1>
          {p.headline ? <p className="text-sm text-muted-foreground">{p.headline}</p> : null}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {p.githubUrl ? (
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Github className="size-3.5" /> GitHub
              </a>
            ) : null}
            {p.linkedinUrl ? (
              <a
                href={p.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Linkedin className="size-3.5" /> LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {p.bio ? <p className="mt-6 max-w-2xl text-sm text-muted-foreground">{p.bio}</p> : null}

      {p.trackName || p.cohortName ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="size-4 shrink-0 text-primary" />
          {[p.trackName, p.cohortName].filter(Boolean).join(" · ")}
        </div>
      ) : null}

      {p.projects.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Projects
          </h2>
          <ul className="mt-4 space-y-4">
            {p.projects.map((proj) => (
              <li key={proj.slug} className="card-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{proj.title}</p>
                  <div className="flex items-center gap-3 text-xs text-primary">
                    {proj.repoUrl ? (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <Github className="size-3.5" /> Repository
                      </a>
                    ) : null}
                    {proj.liveUrl ? (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="size-3.5" /> Live site
                      </a>
                    ) : null}
                  </div>
                </div>
                {proj.summary ? (
                  <p className="mt-1 text-xs text-muted-foreground">{proj.summary}</p>
                ) : null}
                {proj.technologies.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.certificates.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Certificates
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {p.certificates.map((c) => (
              <li key={c.title} className="flex items-center gap-3 py-3">
                <Award className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.issuer}
                    {c.issuedAt
                      ? ` · Issued ${new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.achievementCount > 0 ? (
        <p className="mt-10 text-xs text-muted-foreground">
          {p.achievementCount} achievement{p.achievementCount === 1 ? "" : "s"} earned on Emtech
          Digital Academy.
        </p>
      ) : null}

      <p className="mt-16 text-center text-xs text-muted-foreground">
        Built on{" "}
        <Link to="/" className="text-primary hover:underline">
          Emtech Digital Academy
        </Link>
      </p>
    </main>
  );
}
