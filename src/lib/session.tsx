import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Permission } from "@/types";
import { can, canAny } from "./permissions";

export type Theme = "light" | "dark";

interface PreferencesState {
  theme: Theme;
  leaderboardOptIn: boolean;
  githubConnected: boolean;
  completedLessons: string[];
}

const STORAGE_KEY = "techedu.preferences";

const defaultPreferences: PreferencesState = {
  theme: "light",
  leaderboardOptIn: true,
  githubConnected: false,
  completedLessons: [],
};

interface SessionContextValue extends PreferencesState {
  hydrated: boolean;
  /** Resolved server-side from the session cookie; null when signed out. */
  user: AuthUser | null;
  signOut: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLeaderboardOptIn: (value: boolean) => void;
  setGithubConnected: (value: boolean) => void;
  toggleLessonComplete: (id: string) => void;
  isLessonComplete: (id: string) => boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  auth,
  children,
}: {
  auth: AuthUser | null;
  children: ReactNode;
}) {
  const [state, setState] = useState<PreferencesState>(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState({ ...defaultPreferences, ...(JSON.parse(raw) as Partial<PreferencesState>) });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    document.documentElement.style.colorScheme = state.theme;
  }, [state, hydrated]);

  const patch = useCallback(
    (next: Partial<PreferencesState>) => setState((prev) => ({ ...prev, ...next })),
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      hydrated,
      user: auth,
      signOut: async () => {
        await supabaseBrowser.auth.signOut();
      },
      setTheme: (theme: Theme) => patch({ theme }),
      toggleTheme: () => patch({ theme: state.theme === "dark" ? "light" : "dark" }),
      setLeaderboardOptIn: (leaderboardOptIn: boolean) => patch({ leaderboardOptIn }),
      setGithubConnected: (githubConnected: boolean) => patch({ githubConnected }),
      toggleLessonComplete: (id: string) =>
        setState((prev) => ({
          ...prev,
          completedLessons: prev.completedLessons.includes(id)
            ? prev.completedLessons.filter((l) => l !== id)
            : [...prev.completedLessons, id],
        })),
      isLessonComplete: (id: string) => state.completedLessons.includes(id),
      can: (permission: Permission) => (auth ? can(auth.role, permission) : false),
      canAny: (permissions: Permission[]) => (auth ? canAny(auth.role, permissions) : false),
    }),
    [state, hydrated, patch, auth],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
