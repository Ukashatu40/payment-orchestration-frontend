/** Mirrors src/common/enums/user-role.enum.ts on the backend exactly. */
export type UserRole =
  | "SUPER_ADMIN"
  | "OPS_ADMIN"
  | "OPS_VIEWER"
  | "MERCHANT_ADMIN"
  | "MERCHANT_VIEWER";

export const INTERNAL_ROLES: UserRole[] = ["SUPER_ADMIN", "OPS_ADMIN", "OPS_VIEWER"];
export const MERCHANT_ROLES: UserRole[] = ["MERCHANT_ADMIN", "MERCHANT_VIEWER"];

/**
 * UI-branching only — e.g. hiding a "Disable gateway" button for an
 * OPS_VIEWER. This is NEVER a real authorization boundary: the backend's
 * RolesGuard is the only thing that actually enforces access, and every
 * mutation must be safe to attempt (and correctly rejected) even if a client
 * bypasses this check entirely.
 */
export function hasRole(role: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
