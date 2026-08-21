import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Permission, Role } from "@/types";
import { can, canAny } from "./permissions";

export type Theme = "light" | "dark";

interface SessionState {
  role: Role;
  signedIn: boolean;
  theme: Theme;
  leaderboardOptIn: boolean;
  githubConnected: boolean;
  completedLessons: string[];
}

const STORAGE_KEY = "techedu.session";

const defaultState: SessionState = {
  role: "student",
  signedIn: false,
  theme: "light",
  leaderboardOptIn: true,
  githubConnected: false,
  completedLessons: [],
};

interface SessionContextValue extends SessionState {
  hydrated: boolean;
  signIn: (role?: Role) => void;
  signOut: () => void;
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...(JSON.parse(raw) as Partial<SessionState>) });
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
    (next: Partial<SessionState>) => setState((prev) => ({ ...prev, ...next })),
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      hydrated,
      signIn: (role: Role = "student") => patch({ signedIn: true, role }),
      signOut: () => patch({ signedIn: false }),
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
      can: (permission: Permission) => can(state.role, permission),
      canAny: (permissions: Permission[]) => canAny(state.role, permissions),
    }),
    [state, hydrated, patch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
