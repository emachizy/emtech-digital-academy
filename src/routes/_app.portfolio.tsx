import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — TechEdu" },
      { name: "description", content: "Build and publish the developer portfolio that shows your work." },
      { property: "og:title", content: "Portfolio — TechEdu" },
      { property: "og:description", content: "Build and publish the developer portfolio that shows your work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio" description="Build and publish the developer portfolio that shows your work." />
      <EmptyState title="Portfolio builder coming online" description="Your sections, projects and certificates will appear here." />
    </div>
  );
}
