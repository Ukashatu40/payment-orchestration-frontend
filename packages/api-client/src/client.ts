import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/schema";
import { ApiError, isApiErrorBody } from "./error";

const CSRF_COOKIE = "payflow_csrf_token";
const CSRF_HEADER = "x-csrf-token";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCsrfCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : undefined;
}

/**
 * Double-submit CSRF header — echoes the non-httpOnly payflow_csrf_token
 * cookie (set on login, see auth.controller.ts) back as a header on every
 * mutating request. The backend only checks it on routes explicitly marked
 * @RequireCsrf() (the dangerous-action set), so attaching it universally
 * here is harmless for every other route and means a new dangerous
 * endpoint never needs a matching frontend change to stay protected.
 */
const attachCsrfHeader: Middleware = {
  async onRequest({ request }) {
    if (!MUTATING_METHODS.has(request.method)) return request;
    const token = readCsrfCookie();
    if (token) request.headers.set(CSRF_HEADER, token);
    return request;
  },
};

const throwOnError: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return response;
    const clone = response.clone();
    let body: unknown;
    try {
      body = await clone.json();
    } catch {
      body = undefined;
    }
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body);
    }
    throw new ApiError(response.status, {
      error: {
        code: "UNKNOWN_ERROR",
        message: response.statusText || "Request failed",
        request_id: "unknown",
        timestamp: new Date().toISOString(),
      },
    });
  },
};

/**
 * Browser client. Always same-origin (empty base — every call site passes
 * the full spec path, e.g. `/api/v1/auth/me`, relayed by this app's own
 * `app/api/v1/[...path]/route.ts` proxy) — the backend's auth cookies are
 * SameSite=Strict, so the browser will never send them on a cross-origin
 * request straight to the NestJS backend. Never point this at the backend's
 * own origin.
 */
export function createBrowserApiClient() {
  const client = createClient<paths>({
    baseUrl: "",
    credentials: "include",
  });
  client.use(attachCsrfHeader);
  client.use(throwOnError);
  return client;
}

/**
 * Server-side client for Server Components and Route Handlers, which talk to
 * the backend directly (per Next's own guidance: Server Components should
 * fetch the data source directly rather than round-tripping through a Route
 * Handler). SameSite=Strict doesn't apply here — this is a server-to-server
 * fetch, not a browser request — but the incoming request's Cookie header
 * must be forwarded explicitly since it isn't attached automatically. Call
 * sites still pass the full spec path (e.g. `/api/v1/auth/me`).
 */
export function createServerApiClient(cookieHeader: string) {
  const baseUrl = process.env.BACKEND_API_URL;
  if (!baseUrl) {
    throw new Error("BACKEND_API_URL is not set");
  }
  const client = createClient<paths>({
    baseUrl,
    headers: { cookie: cookieHeader },
  });
  client.use(throwOnError);
  return client;
}

export type { paths } from "./generated/schema";
export { ApiError } from "./error";
