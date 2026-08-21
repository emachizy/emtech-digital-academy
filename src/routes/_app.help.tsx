import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export const Route = createFileRoute("/_app/help")({
  head: () => ({
    meta: [
      { title: "Help — TechEdu" },
      { name: "description", content: "Guides, FAQs and how to reach your mentor." },
      { property: "og:title", content: "Help — TechEdu" },
      { property: "og:description", content: "Guides, FAQs and how to reach your mentor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help" description="Guides, FAQs and how to reach your mentor." />
      <EmptyState
        title="No open support requests"
        description="Ask your mentor a question and it will show up here."
      />
    </div>
  );
}
