import type { Permission, Role } from "@/types";

/**
 * Role capability map. Mentor and admin surfaces are not built yet, but the
 * permission model is in place so those areas can be gated without refactors.
 */
export const rolePermissions: Record<Role, Permission[]> = {
  student: ["learning:view", "attendance:checkin", "projects:submit"],
  mentor: ["learning:view", "projects:review", "students:manage"],
  admin: [
    "learning:view",
    "projects:review",
    "students:manage",
    "platform:manage",
    "attendance:checkin",
  ],
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function canAny(role: Role, permissions: Permission[]) {
  return permissions.some((p) => can(role, p));
}

export const roleHome: Record<Role, string> = {
  student: "/dashboard",
  mentor: "/mentor",
  admin: "/admin",
};