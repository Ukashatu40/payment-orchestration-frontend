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
 * The backend's `Set-Cookie` response headers are relayed individually
 * (via getSetCookie) — a naive header copy risks collapsing multiple
 * `Set-Cookie` headers (access + refresh token, set together on login) into
 * one.
 */
const BACKEND_API_URL = process.env.BACKEND_API_URL;

// A sleeping free-tier backend (e.g. Render) needs ~1 minute to wake; the
// default function timeout would fail the first request after idle.
export const maxDuration = 60;

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!BACKEND_API_URL) {
    return new Response("BACKEND_API_URL is not configured", { status: 500 });
  }

  const { path } = await params;
  const proxyURL = new URL(`/api/v1/${path.join("/")}`, BACKEND_API_URL);
  proxyURL.search = request.nextUrl.search;

  const proxyRequest = new Request(proxyURL, request);

  try {
    const upstream = await fetch(proxyRequest);

    // fetch() transparently decompresses the upstream body (Render gzips
    // responses) but leaves Content-Encoding/Content-Length describing the
    // COMPRESSED bytes; relaying those makes the browser try to decode an
    // already-plain body (net::ERR_CONTENT_DECODING_FAILED). Drop them.
    // Set-Cookie is copied one-by-one so access + refresh cookies both survive.
    const headers = new Headers();
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "set-cookie" || k === "content-encoding" || k === "content-length") return;
      headers.append(key, value);
    });
    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
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
