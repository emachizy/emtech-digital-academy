import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseBrowser } from "@/lib/supabase/browser";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { code?: string } => {
    const code = search["code"];
    return typeof code === "string" ? { code } : {};
  },
  head: () => ({
    meta: [{ title: "Reset password — TechEdu" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { code } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [exchanging, setExchanging] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!code) {
      setError(
        "This reset link is invalid or has expired. Request a new one from the sign-in page.",
      );
      setExchanging(false);
      return;
    }
    supabaseBrowser.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) setError(exchangeError.message);
      setExchanging(false);
    });
  }, [code]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 1500);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        <Sparkles className="size-3.5" /> TechEdu
      </span>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {done && (
              <Alert>
                <AlertTitle>Password updated</AlertTitle>
                <AlertDescription>Redirecting you to sign in…</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                autoFocus
                disabled={exchanging || done}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={exchanging || done || !!error}>
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
