import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware.server";
import type { SearchItem } from "@/types";

type TopicRow = {
  title: string;
  order_index: number;
  subject: { name: string; slug: string } | null;
  lessons: { slug: string }[];
};

/**
 * Backs the global search command palette. Subjects/topics/projects are
 * real; challenges stay mocked in the caller (src/data/practice.ts) since
 * practice challenges are out of scope for this MVP (brief section 39).
 * Topics are capped at 4 per subject, mirroring the original mock's teaser
 * list — the subject page itself is where the full topic list lives.
 */
export const getSearchIndexFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SearchItem[]> => {
    const { supabase } = context;

    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("name, slug")
      .order("order_index");
    if (subjectsError) throw subjectsError;

    const { data: topicRows, error: topicsError } = await supabase
      .from("topics")
      .select("title, order_index, subject:subjects(name, slug), lessons(slug)")
      .order("order_index");
    if (topicsError) throw topicsError;

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("title, slug")
      .eq("published", true);
    if (projectsError) throw projectsError;

    const subjectItems: SearchItem[] = (subjects ?? []).map((s) => ({
      id: `subject-${s.slug}`,
      label: s.name,
      group: "Subjects",
      to: "/learning/$subject",
      params: { subject: s.slug },
    }));

    const topicCountBySubject = new Map<string, number>();
    const topicItems: SearchItem[] = [];
    for (const t of (topicRows ?? []) as unknown as TopicRow[]) {
      const lessonSlug = t.lessons?.[0]?.slug;
      if (!t.subject || !lessonSlug) continue;
      const count = topicCountBySubject.get(t.subject.slug) ?? 0;
      if (count >= 4) continue;
      topicCountBySubject.set(t.subject.slug, count + 1);
      topicItems.push({
        id: `topic-${t.subject.slug}-${lessonSlug}`,
        label: `${t.subject.name} · ${t.title}`,
        group: "Topics",
        to: "/learning/$subject/$topicId",
        params: { subject: t.subject.slug, topicId: lessonSlug },
      });
    }

    const projectItems: SearchItem[] = (projects ?? []).map((p) => ({
      id: `project-${p.slug}`,
      label: p.title,
      group: "Projects",
      to: "/projects/$slug",
      params: { slug: p.slug },
    }));

    return [...subjectItems, ...topicItems, ...projectItems];
  });
