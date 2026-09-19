/** Must match src/modules/auth/auth.controller.ts's ACCESS_COOKIE / REFRESH_COOKIE exactly. */
export const ACCESS_TOKEN_COOKIE = "payflow_access_token";
export const REFRESH_TOKEN_COOKIE = "payflow_refresh_token";

/**
 * Optimistic-only check for use in `proxy.ts` (Next's renamed middleware):
 * is there an access-token cookie present at all? This does NOT verify the
 * JWT's signature or expiry — proxy.ts runs on the Edge runtime, where doing
 * real verification would mean duplicating the backend's signing secret and
 * logic. It exists purely to redirect obviously-logged-out users away from
 * dashboard routes before a page render is attempted.
 *
 * The actual security boundary is the backend rejecting the request when the
 * token is missing, expired, or invalid — every protected Server Component
 * and Route Handler call goes through the backend regardless of what this
 * check decided. Per Next's own authentication guide: optimistic checks are
 * for UX only, never for real authorization.
 */
export function hasOptimisticSession(cookies: { get(name: string): { value: string } | undefined }): boolean {
  return Boolean(cookies.get(ACCESS_TOKEN_COOKIE)?.value);
}

/**
 * Reads the `role` claim out of the access-token JWT's payload segment
 * WITHOUT verifying its signature — base64url-decodes the middle segment
 * only. This is still purely optimistic/for-routing-only, same caveat as
 * hasOptimisticSession above: never treat this as proof of anything, the
 * backend is the real authorization boundary.
 *
 * Needed because a single role's optimistic redirect isn't enough for an
 * app that only serves one role (e.g. merchant-portal, MERCHANT_* only):
 * without this, a SUPER_ADMIN's cookie reads as "logged in" by
 * hasOptimisticSession, so proxy.ts would bounce them away from /login
 * back to /overview — where the real (server-side, role-aware) session
 * check then bounces them back to /login, forever. Decoding the role here
 * lets proxy.ts recognize "logged in, but not for this app" and let /login
 * render normally instead of looping.
 */
export function getOptimisticRole(cookies: {
  get(name: string): { value: string } | undefined;
}): string | null {
  const token = cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
