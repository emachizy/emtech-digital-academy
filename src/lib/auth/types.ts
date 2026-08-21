import type { Role } from "@/types";

/** The authenticated identity resolved server-side from the session cookie + profiles row. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  avatarUrl: string | null;
}
