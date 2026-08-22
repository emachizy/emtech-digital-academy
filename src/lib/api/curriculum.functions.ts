import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware.server";
import type { Difficulty, Lesson, Subject, Topic, TopicStatus, Track } from "@/types";

/**
 * A topic's display status is derived purely from how far the student has
 * actually completed, not stored — mirrors the original mock's own rule
 * (index vs. completed count), just computed from real lesson_progress
 * instead of a hardcoded number. `lastCompletedIndex` is the highest index
 * with a completed lesson (order doesn't have to be contiguous); exactly
 * one topic beyond that is unlocked as "in-progress", the rest are locked.
 */
export function deriveStatus(
  index: number,
  isCompleted: boolean,
  lastCompletedIndex: number,
): TopicStatus {
  if (isCompleted) return "completed";
  if (index <= lastCompletedIndex + 1)
    return index === lastCompletedIndex + 1 ? "in-progress" : "not-started";
  return "locked";
}

export const getTracksFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Track[]> => {
    const { supabase, userId } = context;

    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select(
        "id, name, slug, description, subjects(id, name, slug, icon, color, description, estimated_hours, order_index, topics(id, lessons(id)))",
      )
      .order("name");
    if (tracksError) throw tracksError;

    const { data: completedRows, error: progressError } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("profile_id", userId)
      .eq("status", "completed");
    if (progressError) throw progressError;
    const completedLessonIds = new Set((completedRows ?? []).map((r) => r.lesson_id as string));

    return (tracks ?? []).map((track) => {
      const subjects: Subject[] = (track.subjects ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((subject) => {
          const lessonIds = (subject.topics ?? []).flatMap((t) =>
            (t.lessons ?? []).map((l) => l.id as string),
          );
          const completedCount = lessonIds.filter((id) => completedLessonIds.has(id)).length;
          return {
            id: subject.id,
            name: subject.name,
            slug: subject.slug,
            icon: subject.icon,
            color: subject.color,
            description: subject.description ?? "",
            estimatedHours: subject.estimated_hours,
            topicCount: lessonIds.length,
            completedTopics: completedCount,
            progress: lessonIds.length ? Math.round((completedCount / lessonIds.length) * 100) : 0,
          };
        });

      const totalLessons = subjects.reduce((n, s) => n + s.topicCount, 0);
      const totalCompleted = subjects.reduce((n, s) => n + s.completedTopics, 0);

      return {
        id: track.id,
        name: track.name,
        description: track.description ?? "",
        progress: totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0,
        subjects,
      };
    });
  });

const getSubjectInput = z.object({ slug: z.string().min(1) });

export const getSubjectFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(getSubjectInput)
  .handler(async ({ context, data }): Promise<{ subject: Subject; topics: Topic[] }> => {
    const { supabase, userId } = context;

    const { data: subjectRow, error: subjectError } = await supabase
      .from("subjects")
      .select("id, name, slug, icon, color, description, estimated_hours")
      .eq("slug", data.slug)
      .maybeSingle();
    if (subjectError) throw subjectError;
    if (!subjectRow) throw notFound();

    const { data: topicRows, error: topicsError } = await supabase
      .from("topics")
      .select("id, title, summary, difficulty, duration_minutes, order_index, lessons(id, slug)")
      .eq("subject_id", subjectRow.id)
      .order("order_index");
    if (topicsError) throw topicsError;

    const lessonIds = (topicRows ?? [])
      .map((t) => t.lessons?.[0]?.id)
      .filter((id): id is string => !!id);
    const { data: progressRows, error: progressError } = await supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("profile_id", userId)
      .in("lesson_id", lessonIds.length ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);
    if (progressError) throw progressError;
    const progressByLesson = new Map(
      (progressRows ?? []).map((r) => [r.lesson_id as string, r.status as string]),
    );

    const ordered = (topicRows ?? []).slice().sort((a, b) => a.order_index - b.order_index);
    let lastCompletedIndex = -1;
    ordered.forEach((t, i) => {
      const lessonId = t.lessons?.[0]?.id;
      if (lessonId && progressByLesson.get(lessonId) === "completed") lastCompletedIndex = i;
    });

    const topics: Topic[] = ordered.map((t, i) => {
      const lessonId = t.lessons?.[0]?.id;
      const lessonSlug = t.lessons?.[0]?.slug;
      const isCompleted = !!lessonId && progressByLesson.get(lessonId) === "completed";
      const status = deriveStatus(i, isCompleted, lastCompletedIndex);
      return {
        id: lessonSlug ?? t.id,
        subjectId: subjectRow.id,
        title: t.title,
        summary: t.summary ?? "",
        status,
        duration: `${t.duration_minutes} min`,
        difficulty: t.difficulty as Difficulty,
        progress: status === "completed" ? 100 : status === "in-progress" ? 50 : 0,
      };
    });

    const completedCount = topics.filter((t) => t.status === "completed").length;

    const subject: Subject = {
      id: subjectRow.id,
      name: subjectRow.name,
      slug: subjectRow.slug,
      icon: subjectRow.icon,
      color: subjectRow.color,
      description: subjectRow.description ?? "",
      estimatedHours: subjectRow.estimated_hours,
      topicCount: topics.length,
      completedTopics: completedCount,
      progress: topics.length ? Math.round((completedCount / topics.length) * 100) : 0,
    };

    return { subject, topics };
  });

const getLessonInput = z.object({ subjectSlug: z.string().min(1), topicId: z.string().min(1) });

export const getLessonFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(getLessonInput)
  .handler(
    async ({ context, data }): Promise<{ lesson: Lesson; topics: Topic[]; subject: Subject }> => {
      const { subject, topics } = await getSubjectFn({ data: { slug: data.subjectSlug } });

      const { data: lessonRow, error: lessonError } = await context.supabase
        .from("lessons")
        .select("id, title, slug, duration_minutes, content")
        .eq("slug", data.topicId)
        .maybeSingle();
      if (lessonError) throw lessonError;
      if (!lessonRow) throw notFound();

      const content = (lessonRow.content ?? {}) as Record<string, unknown>;

      const lesson: Lesson = {
        id: lessonRow.id,
        topicId: lessonRow.slug,
        subjectId: subject.id,
        subjectName: subject.name,
        title: lessonRow.title,
        durationMinutes: lessonRow.duration_minutes,
        videoLabel: content["videoLabel"] as string,
        intro: content["intro"] as string,
        sections: content["sections"] as Lesson["sections"],
        resources: content["resources"] as Lesson["resources"],
        exercise: content["exercise"] as Lesson["exercise"],
        quiz: content["quiz"] as Lesson["quiz"],
      };

      return { lesson, topics, subject };
    },
  );

const lessonIdInput = z.object({ lessonId: z.string().uuid() });

export const markLessonCompleteFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(lessonIdInput)
  .handler(async ({ context, data }) => {
    const nowIso = new Date().toISOString();
    const { error } = await context.supabase.from("lesson_progress").upsert(
      {
        profile_id: context.userId,
        lesson_id: data.lessonId,
        status: "completed",
        completed_at: nowIso,
        last_accessed_at: nowIso,
      },
      { onConflict: "profile_id,lesson_id" },
    );
    if (error) throw error;
    return { completed: true };
  });
