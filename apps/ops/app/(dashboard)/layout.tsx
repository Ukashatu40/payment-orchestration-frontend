import type * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerApiClient } from "@payflow/api-client";
import { THEME_COOKIE_NAME, resolveTheme } from "@payflow/ui/theme";
import { DashboardSidebar } from "./dashboard-sidebar";

/**
 * Real session check — proxy.ts only verified a cookie was present, not
 * that it's valid. This Server Component calls the backend directly (not
 * through the app/api/v1 proxy — see Next's own guidance against Server
 * Components fetching via Route Handlers) and forwards the incoming
 * request's Cookie header explicitly, since a server-to-server fetch
 * doesn't attach it automatically.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const client = createServerApiClient(cookieHeader);

  const { data: me, error } = await client.GET("/api/v1/auth/me");

  if (error || !me) {
    redirect("/login");
  }

  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, "dark");

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar email={me.email} role={me.role} theme={theme} />
      <main className="flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  );
}
