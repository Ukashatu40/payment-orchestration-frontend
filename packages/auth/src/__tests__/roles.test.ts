import { describe, expect, it } from "vitest";
import { hasRole, INTERNAL_ROLES, MERCHANT_ROLES } from "../roles";

describe("hasRole", () => {
  it("allows a role present in the allowed list", () => {
    expect(hasRole("OPS_ADMIN", ["SUPER_ADMIN", "OPS_ADMIN"])).toBe(true);
  });

  it("denies a role absent from the allowed list", () => {
    expect(hasRole("OPS_VIEWER", ["SUPER_ADMIN", "OPS_ADMIN"])).toBe(false);
  });

  it("denies an undefined role", () => {
    expect(hasRole(undefined, ["SUPER_ADMIN"])).toBe(false);
  });
});

describe("role groups", () => {
  it("keeps internal and merchant roles disjoint", () => {
    const overlap = INTERNAL_ROLES.filter((r) => (MERCHANT_ROLES as string[]).includes(r));
    expect(overlap).toEqual([]);
  });
});
