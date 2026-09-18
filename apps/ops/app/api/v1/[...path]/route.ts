import type { NextRequest } from "next/server";

/**
 * Transparent proxy to the real backend, mounted at the identical path
 * suffix the backend uses (`/api/v1/*`). This is required, not cosmetic:
 * the backend's refresh-token cookie is scoped to
 * `Path=/api/v1/auth/refresh`, and the browser can only ever send/receive
 * cookies for the origin it's actually talking to. Since the backend's auth
 * cookies are SameSite=Strict, the browser must talk to this app's own
 * origin — never the backend's origin directly — so this route exists to
 * relay requests through. Mounting it at any other prefix (e.g.
 * `/api/backend/v1/...`) would change the relayed cookie's effective Path
 * and break the refresh flow.
 *
 * The backend's `Set-Cookie` response headers are relayed to the browser
 * untouched by returning the fetch Response directly rather than
 * reconstructing one — reconstructing risks collapsing multiple `Set-Cookie`
 * headers (access + refresh token, set together on login) into one.
 */
const BACKEND_API_URL = process.env.BACKEND_API_URL;

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!BACKEND_API_URL) {
    return new Response("BACKEND_API_URL is not configured", { status: 500 });
  }

  const { path } = await params;
  const proxyURL = new URL(`/api/v1/${path.join("/")}`, BACKEND_API_URL);
  proxyURL.search = request.nextUrl.search;

  const proxyRequest = new Request(proxyURL, request);

  try {
    return await fetch(proxyRequest);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Backend unreachable";
    return new Response(message, { status: 502 });
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
