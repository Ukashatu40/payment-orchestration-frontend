import { connection } from "next/server";
import { cookies } from "next/headers";
import { THEME_COOKIE_NAME, resolveTheme } from "@payflow/ui/theme";
import { LoginPageClient } from "./login-client";

/**
 * Forces dynamic rendering so proxy.ts's per-request CSP nonce actually
 * reaches this page — a statically-prerendered page has no request to read
 * a nonce from, so Next can't inject one and the whole page fails to
 * hydrate (see proxy.ts for the full story).
 */
export default async function LoginPage() {
  await connection();
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, "dark");
  return <LoginPageClient theme={theme} />;
}
