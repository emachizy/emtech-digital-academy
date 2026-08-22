import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { challenges } from "@/data/practice";
import { api } from "@/lib/api";
import type { SearchItem } from "@/types";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function goTo(item: SearchItem) {
    setOpen(false);
    navigate({ to: item.to, ...(item.params ? { params: item.params } : {}) });
  }
  const { data: index } = useQuery({
    queryKey: ["search-index"],
    queryFn: api.getSearchIndex,
    enabled: open,
    staleTime: 5 * 60_000,
  });

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

  const subjects = index?.filter((i) => i.group === "Subjects") ?? [];
  const topics = index?.filter((i) => i.group === "Topics") ?? [];
  const projects = index?.filter((i) => i.group === "Projects") ?? [];

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
            {subjects.map((s) => (
              <CommandItem key={s.id} value={`subject ${s.label}`} onSelect={() => goTo(s)}>
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Topics">
            {topics.map((t) => (
              <CommandItem key={t.id} value={`topic ${t.label}`} onSelect={() => goTo(t)}>
                {t.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem key={p.id} value={`project ${p.label}`} onSelect={() => goTo(p)}>
                {p.label}
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
