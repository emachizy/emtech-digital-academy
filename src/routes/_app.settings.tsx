import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { ProfileSettings } from "@/lib/api/settings.functions";
import { supabaseBrowser } from "@/lib/supabase/browser";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TechEdu" },
      {
        name: "description",
        content: "Manage your account, appearance, notifications and privacy.",
      },
      { property: "og:title", content: "Settings — TechEdu" },
      {
        property: "og:description",
        content: "Manage your account, appearance, notifications and privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["profile-settings"], queryFn: api.getProfileSettings });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and public profile details." />

      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isPending || !query.data ? (
        <ListSkeleton />
      ) : (
        <>
          <ProfileForm
            settings={query.data}
            onSaved={() => {
              void queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
              void queryClient.invalidateQueries({ queryKey: ["student"] });
              void queryClient.invalidateQueries({ queryKey: ["portfolio"] });
            }}
          />
          <PasswordForm />
        </>
      )}
    </div>
  );
}

function ProfileForm({ settings, onSaved }: { settings: ProfileSettings; onSaved: () => void }) {
  const [fullName, setFullName] = useState(settings.fullName);
  const [bio, setBio] = useState(settings.bio ?? "");
  const [location, setLocation] = useState(settings.location ?? "");
  const [githubUrl, setGithubUrl] = useState(settings.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      await api.updateProfileSettings({
        fullName,
        ...(bio ? { bio } : {}),
        ...(location ? { location } : {}),
        ...(githubUrl ? { githubUrl } : {}),
        ...(linkedinUrl ? { linkedinUrl } : {}),
      });
      toast.success("Profile updated");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-surface space-y-4 p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          This information appears on your profile and portfolio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Full name</Label>
          <Input
            id="settings-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input id="settings-email" value={settings.email} disabled readOnly />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-bio">Bio</Label>
        <Textarea
          id="settings-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short intro about you."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-location">Location</Label>
        <Input
          id="settings-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-github">GitHub URL</Label>
          <Input
            id="settings-github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/your-handle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-linkedin">LinkedIn URL</Label>
          <Input
            id="settings-linkedin"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-handle"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={saving || !fullName.trim()}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </section>
  );
}

function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabaseBrowser.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      setPassword("");
      setConfirm("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update password. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-surface space-y-4 p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Password</h2>
        <p className="text-sm text-muted-foreground">Change the password you sign in with.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-password">New password</Label>
          <Input
            id="settings-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-password-confirm">Confirm password</Label>
          <Input
            id="settings-password-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={saving || !password || !confirm}>
          {saving ? "Updating…" : "Update password"}
        </Button>
      </div>
    </section>
  );
}
