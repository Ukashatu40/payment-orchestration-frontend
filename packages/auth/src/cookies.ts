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
