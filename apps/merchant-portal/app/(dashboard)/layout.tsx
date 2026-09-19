import type * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerApiClient } from "@payflow/api-client";
import { DashboardSidebar } from "./dashboard-sidebar";

const MERCHANT_ROLES = ["MERCHANT_ADMIN", "MERCHANT_VIEWER"];

/**
 * Real session check — proxy.ts only verified a cookie was present, not
 * that it's valid. This Server Component calls the backend directly (not
 * through the app/api/v1 proxy — see Next's own guidance against Server
 * Components fetching via Route Handlers) and forwards the incoming
 * request's Cookie header explicitly, since a server-to-server fetch
 * doesn't attach it automatically.
 *
 * Also gates on role: an internal (OPS_ or SUPER_ADMIN) JWT has no
 * merchantId, so every merchant-scoped query on this app either 403s or —
 * worse — for internal roles the backend treats an absent merchant filter
 * as "all merchants", which would silently show platform-wide data in a
 * UI built to look like one merchant's own view. Refuse rather than risk
 * that; internal staff belong in the ops app.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const client = createServerApiClient(cookieHeader);

  const { data: me, error } = await client.GET("/api/v1/auth/me");

  if (error || !me || !MERCHANT_ROLES.includes(me.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar email={me.email} />
      <main className="flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  );
}
