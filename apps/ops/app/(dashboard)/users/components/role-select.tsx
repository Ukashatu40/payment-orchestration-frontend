"use client";

import { Select } from "@payflow/ui/select";

const ALL_ROLES = [
  "SUPER_ADMIN",
  "OPS_ADMIN",
  "OPS_VIEWER",
  "MERCHANT_ADMIN",
  "MERCHANT_VIEWER",
] as const;

export const MERCHANT_ROLES: string[] = ["MERCHANT_ADMIN", "MERCHANT_VIEWER"];

export function RoleSelect({
  value,
  onChange,
  allowAll,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Adds an "All roles" option at the top — for filter bars, not forms. */
  allowAll?: boolean;
}) {
  return (
    <Select aria-label="Role" value={value} onChange={(e) => onChange(e.target.value)}>
      {allowAll ? <option value="">All roles</option> : null}
      {ALL_ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </Select>
  );
}
