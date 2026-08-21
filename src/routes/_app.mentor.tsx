import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { roleHome } from "@/lib/permissions";

export const Route = createFileRoute("/_app/mentor")({
  beforeLoad: ({ context }) => {
    if (context.auth.role !== "mentor") {
      throw redirect({ to: roleHome[context.auth.role] });
    }
  },
  head: () => ({
    meta: [
      { title: "Mentor Workspace — TechEdu" },
      {
        name: "description",
        content: "Mentor tools are prepared but not yet enabled for this cohort.",
      },
      { property: "og:title", content: "Mentor Workspace — TechEdu" },
      {
        property: "og:description",
        content: "Mentor tools are prepared but not yet enabled for this cohort.",
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
        title="Mentor Workspace"
        description="Mentor tools are prepared but not yet enabled for this cohort."
      />
      <EmptyState
        title="Mentor dashboard not enabled"
        description="Students, submissions, reviews and analytics land here next."
      />
    </div>
  );
}
