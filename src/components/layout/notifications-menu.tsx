import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
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
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: api.getNotifications });
  const items = data ?? [];
  const unread = items.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await api.markNotificationRead(id);
    queryClient.setQueryData<NotificationItem[]>(["notifications"], (prev) =>
      prev?.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function markAllRead() {
    await api.markAllNotificationsRead();
    queryClient.setQueryData<NotificationItem[]>(["notifications"], (prev) =>
      prev?.map((n) => ({ ...n, read: true })),
    );
  }

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
            onClick={() => void markAllRead()}
          >
            Mark all read
          </button>
        </div>
        <ScrollArea className="h-80">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void markRead(n.id)}
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
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {n.time}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
