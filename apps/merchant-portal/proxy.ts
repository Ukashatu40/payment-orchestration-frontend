import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasOptimisticSession, getOptimisticRole } from "@payflow/auth";

const MERCHANT_ROLES = ["MERCHANT_ADMIN", "MERCHANT_VIEWER"];

/**
 * Per-request nonce-based CSP, per Next's own guide
 * (guides/content-security-policy.md). A static `script-src 'self'` with no
 * `unsafe-inline`/nonce blocks Next's own inline hydration/RSC-payload
 * scripts — the page never hydrates, and a form whose submit handler never
 * attached falls back to a native HTML GET submission (credentials end up
 * in the URL). The nonce is threaded through the CSP header and Next
 * auto-applies it to its own framework scripts; pages that need it must be
 * dynamically rendered (see app/(auth)/login/page.tsx).
 */
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Optimistic-only redirect: presence of the access-token cookie, not its
 * validity. The real authorization boundary is the backend rejecting the
 * request; every dashboard page still re-checks via a real backend call
 * (see the `(dashboard)/layout.tsx` server-side session check). This just
 * avoids rendering a protected shell for an obviously logged-out visitor.
 *
 * Also checks the (unverified) role claim: this app only serves
 * MERCHANT_ADMIN/MERCHANT_VIEWER. Without this, an internal admin's
 * cookie reads as "logged in" here too, so this proxy would bounce them
 * away from /login back to /overview — where the real, role-aware session
 * check then bounces them back to /login, forever. Treating a
 * present-but-wrong-role cookie as "not logged in for this app" breaks
 * that loop and lets /login render normally instead.
 */
export function proxy(request: NextRequest) {
  const hasSession = hasOptimisticSession(request.cookies);
  const role = getOptimisticRole(request.cookies);
  const isRightRoleForApp = role !== null && MERCHANT_ROLES.includes(role);
  const isLoggedIn = hasSession && isRightRoleForApp;
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  if (!isLoggedIn && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    // A session exists but isn't a merchant account — surface why, rather
    // than silently landing on an unexplained login form.
    if (hasSession && !isRightRoleForApp) {
      loginUrl.searchParams.set("reason", "wrong-account");
    }
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  if (isLoggedIn && isAuthRoute) {
    const response = NextResponse.redirect(new URL("/overview", request.url));
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
