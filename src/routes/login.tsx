import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth/session.functions";
import { roleHome } from "@/lib/permissions";
import { supabaseBrowser } from "@/lib/supabase/browser";

const DEV_ACCOUNTS = [
  { email: "admin@techedu.local", label: "Admin" },
  { email: "mentor@techedu.local", label: "Mentor" },
  { email: "student@techedu.local", label: "Student — Alex Johnson" },
];

function sanitizeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }
  return value;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = sanitizeRedirect(search["redirect"]);
    return redirect !== undefined ? { redirect } : {};
  },
  beforeLoad: ({ context, search }) => {
    if (context.auth) {
      throw redirect({ to: search.redirect ?? roleHome[context.auth.role] });
    }
  },
  head: () => ({
    meta: [{ title: "Sign in — Emtech Digital Academy" }],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot";

function LoginPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const profile = await getCurrentUser();
    await navigate({ to: search.redirect ?? roleHome[profile?.role ?? "student"] });
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session exists.
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
      setLoading(false);
      return;
    }

    await navigate({ to: search.redirect ?? "/dashboard" });
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Always show the same message, whether or not the email is registered.
    setNotice("If that email has an account, a reset link is on its way.");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        <img src="/logo-icon.png" alt="" className="size-3.5" /> Emtech Digital Academy
      </span>

      <Card className="w-full max-w-md">
        {mode === "forgot" ? (
          <>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setNotice(null);
                }}
              >
                <ArrowLeft className="size-4" /> Back to sign in
              </Button>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>We'll email you a link to set a new one.</CardDescription>
            </CardHeader>
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                {error && <FormAlert kind="error" message={error} />}
                {notice && <FormAlert kind="success" message={notice} />}
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input id="forgot-email" name="email" type="email" required autoFocus />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  Send reset link
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <CardHeader>
              <CardTitle>Welcome to Emtech Digital Academy</CardTitle>
              <CardDescription>Sign in to continue your learning path.</CardDescription>
              <TabsList className="mt-2 grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  {error && <FormAlert kind="error" message={error} />}
                  {notice && <FormAlert kind="success" message={notice} />}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="email" type="email" required autoFocus />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                          setNotice(null);
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input id="signin-password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    Sign in
                  </Button>
                  {import.meta.env.DEV && (
                    <div className="w-full rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                      <p className="mb-1 font-semibold">
                        Dev test accounts (password: TechEdu!2026)
                      </p>
                      {DEV_ACCOUNTS.map((account) => (
                        <p key={account.email}>
                          {account.label}: {account.email}
                        </p>
                      ))}
                    </div>
                  )}
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  {error && <FormAlert kind="error" message={error} />}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input id="signup-name" name="fullName" required autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      minLength={6}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Create account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </main>
  );
}

function FormAlert({ kind, message }: { kind: "error" | "success"; message: string }) {
  return (
    <Alert variant={kind === "error" ? "destructive" : "default"}>
      {kind === "error" ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
      <AlertTitle>{kind === "error" ? "Something went wrong" : "Check your email"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
