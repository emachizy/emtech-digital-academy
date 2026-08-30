import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Award, ExternalLink, GraduationCap, Link2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { MyPortfolio } from "@/lib/api/portfolio.functions";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Emtech Digital Academy" },
      {
        name: "description",
        content: "Build and publish the developer portfolio that shows your work.",
      },
      { property: "og:title", content: "Portfolio — Emtech Digital Academy" },
      {
        property: "og:description",
        content: "Build and publish the developer portfolio that shows your work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["portfolio"], queryFn: api.getPortfolio });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        description="Build and publish the developer portfolio that shows your work."
        actions={
          query.data?.isPublic && query.data.publicSlug ? (
            <Button asChild size="sm" variant="outline">
              <a href={`/p/${query.data.publicSlug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> View public page
              </a>
            </Button>
          ) : null
        }
      />

      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isPending || !query.data ? (
        <ListSkeleton />
      ) : (
        <PortfolioContent
          portfolio={query.data}
          onSaved={() => void queryClient.invalidateQueries({ queryKey: ["portfolio"] })}
        />
      )}
    </div>
  );
}

function PortfolioContent({ portfolio, onSaved }: { portfolio: MyPortfolio; onSaved: () => void }) {
  const [headline, setHeadline] = useState(portfolio.headline ?? "");
  const [bio, setBio] = useState(portfolio.bio ?? portfolio.profile.bio ?? "");
  const [slug, setSlug] = useState(portfolio.publicSlug ?? "");
  const [isPublic, setIsPublic] = useState(portfolio.isPublic);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.updatePortfolio({
        ...(headline ? { headline } : {}),
        ...(bio ? { bio } : {}),
        isPublic,
        ...(slug ? { publicSlug: slug } : {}),
      });
      toast.success("Portfolio saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    {
      id: "about",
      title: "About",
      description: "Your headline and bio.",
      itemCount: (headline ? 1 : 0) + (bio ? 1 : 0),
    },
    {
      id: "projects",
      title: "Projects",
      description: "Approved academy projects.",
      itemCount: portfolio.projects.length,
    },
    {
      id: "certificates",
      title: "Certificates",
      description: "Certificates you've earned.",
      itemCount: portfolio.certificates.length,
    },
    {
      id: "achievements",
      title: "Achievements",
      description: "Badges earned on the platform.",
      itemCount: portfolio.achievementCount,
    },
    {
      id: "education",
      title: "Education",
      description: "Cohort and track.",
      itemCount: (portfolio.cohortName ? 1 : 0) + (portfolio.trackName ? 1 : 0),
    },
    {
      id: "github",
      title: "GitHub",
      description: "Link your repositories.",
      itemCount: portfolio.profile.githubUrl ? 1 : 0,
    },
  ];

  return (
    <>
      <section className="card-surface space-y-4 p-5">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-headline">Headline</Label>
            <Input
              id="pf-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Frontend developer in training"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-slug">Public link</Label>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link2 className="size-4 shrink-0" />
              <span className="shrink-0">/p/</span>
              <Input
                id="pf-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="your-name"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-bio">Bio</Label>
          <Textarea
            id="pf-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short intro for people viewing your portfolio."
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Publish portfolio</p>
            <p className="text-xs text-muted-foreground">Anyone with the link can view it.</p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <div key={s.id} className="card-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <Badge variant={s.itemCount > 0 ? "secondary" : "outline"}>
                {s.itemCount > 0 ? "Complete" : "Incomplete"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {s.itemCount} item{s.itemCount === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>

      {portfolio.projects.length > 0 ? (
        <section className="card-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Featured projects</h2>
          <ul className="mt-4 space-y-3">
            {portfolio.projects.map((p) => (
              <li key={p.slug} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{p.title}</p>
                  <div className="flex items-center gap-3 text-xs text-primary">
                    {p.repoUrl ? (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Repository
                      </a>
                    ) : null}
                    {p.liveUrl ? (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Live site
                      </a>
                    ) : null}
                  </div>
                </div>
                {p.summary ? (
                  <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                ) : null}
                {p.technologies.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
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

      {portfolio.certificates.length > 0 ? (
        <section className="card-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Certificates</h2>
          <ul className="mt-4 divide-y divide-border">
            {portfolio.certificates.map((c) => (
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

      {portfolio.cohortName || portfolio.trackName ? (
        <section className="card-surface flex items-center gap-3 p-5">
          <GraduationCap className="size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            {[portfolio.trackName, portfolio.cohortName].filter(Boolean).join(" · ")}
          </p>
        </section>
      ) : null}
    </>
  );
}
