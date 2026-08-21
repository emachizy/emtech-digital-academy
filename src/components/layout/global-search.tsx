import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { allSubjects, getTopics } from "@/data/curriculum";
import { challenges } from "@/data/practice";
import { projects } from "@/data/projects";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const topics = useMemo(
    () =>
      allSubjects.flatMap((s) =>
        getTopics(s.slug)
          .slice(0, 4)
          .map((t) => ({ ...t, subjectSlug: s.slug, subjectName: s.name })),
      ),
    [],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted md:w-64 lg:w-80"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">Search everything…</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search subjects, topics, projects, challenges…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Subjects">
            {allSubjects.map((s) => (
              <CommandItem
                key={s.id}
                value={`subject ${s.name}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/learning/$subject", params: { subject: s.slug } });
                }}
              >
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Topics">
            {topics.map((t) => (
              <CommandItem
                key={t.id}
                value={`topic ${t.subjectName} ${t.title}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({
                    to: "/learning/$subject/$topicId",
                    params: { subject: t.subjectSlug, topicId: t.id },
                  });
                }}
              >
                <span className="text-muted-foreground">{t.subjectName}</span>
                <span aria-hidden>·</span>
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem
                key={p.id}
                value={`project ${p.title}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/projects/$slug", params: { slug: p.slug } });
                }}
              >
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Challenges">
            {challenges.map((c) => (
              <CommandItem
                key={c.id}
                value={`challenge ${c.title}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/practice/$challengeId", params: { challengeId: c.id } });
                }}
              >
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}