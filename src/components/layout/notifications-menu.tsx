import {
  Award,
  Bell,
  BookOpen,
  CalendarClock,
  FileBadge,
  MessageSquare,
  MessagesSquare,
  TimerReset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as seed } from "@/data/student";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const kindIcon: Record<NotificationItem["kind"], LucideIcon> = {
  lesson: BookOpen,
  class: CalendarClock,
  deadline: TimerReset,
  feedback: MessageSquare,
  achievement: Award,
  certificate: FileBadge,
  message: MessagesSquare,
};

export function NotificationsMenu() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </button>
        </div>
        <ScrollArea className="h-80">
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = kindIcon[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)),
                      )
                    }
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                      !n.read && "bg-primary-soft/40",
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}