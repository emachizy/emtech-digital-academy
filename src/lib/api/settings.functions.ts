import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { httpUrl } from "@/lib/api/validators";
import { authMiddleware } from "@/lib/auth/middleware.server";

export interface ProfileSettings {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
}

export const getProfileSettingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProfileSettings> => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, bio, location, github_url, linkedin_url")
      .eq("id", userId)
      .single();
    if (error) throw error;

    const { data: authUser } = await supabase.auth.getUser();

    return {
      fullName: profile.full_name,
      email: authUser.user?.email ?? "",
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      githubUrl: profile.github_url,
      linkedinUrl: profile.linkedin_url,
    };
  });

const updateProfileInput = z.object({
  fullName: z.string().trim().min(1).max(100),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  githubUrl: httpUrl.optional(),
  linkedinUrl: httpUrl.optional(),
});

export const updateProfileSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateProfileInput)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        bio: data.bio || null,
        location: data.location || null,
        github_url: data.githubUrl || null,
        linkedin_url: data.linkedinUrl || null,
      })
      .eq("id", context.userId);
    if (error) throw error;

    return { ok: true };
  });
