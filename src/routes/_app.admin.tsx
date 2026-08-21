import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Administration — TechEdu" },
      { name: "description", content: "Academy administration is prepared but not yet enabled." },
      { property: "og:title", content: "Administration — TechEdu" },
      {
        property: "og:description",
        content: "Academy administration is prepared but not yet enabled.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Academy administration is prepared but not yet enabled."
      />
      <EmptyState
        title="Admin dashboard not enabled"
        description="Cohorts, courses, mentors and analytics land here next."
      />
    </div>
  );
}
