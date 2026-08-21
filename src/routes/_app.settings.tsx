import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TechEdu" },
      {
        name: "description",
        content: "Manage your account, appearance, notifications and privacy.",
      },
      { property: "og:title", content: "Settings — TechEdu" },
      {
        property: "og:description",
        content: "Manage your account, appearance, notifications and privacy.",
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
        title="Settings"
        description="Manage your account, appearance, notifications and privacy."
      />
      <EmptyState title="Settings unavailable" description="Try again in a moment." />
    </div>
  );
}
