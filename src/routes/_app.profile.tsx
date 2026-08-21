import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TechEdu" },
      { name: "description", content: "Your academy profile, skills and recent activity." },
      { property: "og:title", content: "Profile — TechEdu" },
      { property: "og:description", content: "Your academy profile, skills and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your academy profile, skills and recent activity." />
      <EmptyState title="Nothing to show yet" description="Your activity will appear here as you learn." />
    </div>
  );
}
