import { describe, expect, it } from "vitest";
import { ACCESS_TOKEN_COOKIE, getOptimisticRole, hasOptimisticSession } from "../cookies";

function fakeJwt(payload: Record<string, unknown>): string {
  const base64url = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${base64url({ alg: "HS256" })}.${base64url(payload)}.signature`;
}

function cookieJar(values: Record<string, string>) {
  return { get: (name: string) => (name in values ? { value: values[name]! } : undefined) };
}

describe("hasOptimisticSession", () => {
  it("is true when the access-token cookie is present", () => {
    expect(hasOptimisticSession(cookieJar({ [ACCESS_TOKEN_COOKIE]: "any-value" }))).toBe(true);
  });

  it("is false when the access-token cookie is absent", () => {
    expect(hasOptimisticSession(cookieJar({}))).toBe(false);
  });
});

describe("getOptimisticRole", () => {
  it("extracts the role claim from a well-formed JWT", () => {
    const token = fakeJwt({ sub: "user-1", role: "MERCHANT_ADMIN" });
    expect(getOptimisticRole(cookieJar({ [ACCESS_TOKEN_COOKIE]: token }))).toBe("MERCHANT_ADMIN");
  });

  it("returns null when there is no access-token cookie", () => {
    expect(getOptimisticRole(cookieJar({}))).toBeNull();
  });

  it("returns null for a malformed token", () => {
    expect(getOptimisticRole(cookieJar({ [ACCESS_TOKEN_COOKIE]: "not-a-jwt" }))).toBeNull();
  });

  it("returns null when the payload has no role claim", () => {
    const token = fakeJwt({ sub: "user-1" });
    expect(getOptimisticRole(cookieJar({ [ACCESS_TOKEN_COOKIE]: token }))).toBeNull();
  });
});
