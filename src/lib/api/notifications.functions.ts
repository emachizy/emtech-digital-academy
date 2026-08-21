import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware.server";
import type { NotificationItem } from "@/types";

function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export const getNotificationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<NotificationItem[]> => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, kind, title, body, read, created_at")
      .eq("profile_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;

    return (data ?? []).map((n) => ({
      id: n.id as string,
      kind: n.kind as NotificationItem["kind"],
      title: n.title as string,
      body: (n.body as string | null) ?? "",
      time: relativeTime(n.created_at as string),
      read: n.read as boolean,
    }));
  });

const idInput = z.object({ id: z.string().uuid() });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idInput)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", data.id)
      .eq("profile_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read: true })
      .eq("profile_id", context.userId)
      .eq("read", false);
    if (error) throw error;
    return { ok: true };
  });
