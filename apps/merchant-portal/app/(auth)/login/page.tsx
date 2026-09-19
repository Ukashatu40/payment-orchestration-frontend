import { connection } from "next/server";
import { LoginPageClient } from "./login-client";

/**
 * Forces dynamic rendering so proxy.ts's per-request CSP nonce actually
 * reaches this page — a statically-prerendered page has no request to read
 * a nonce from, so Next can't inject one and the whole page fails to
 * hydrate (see proxy.ts for the full story).
 */
export default async function LoginPage() {
  await connection();
  return <LoginPageClient />;
}
