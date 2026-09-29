"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Waypoints,
  SlidersHorizontal,
  ShieldCheck,
  Webhook,
  Users,
  LogOut,
} from "lucide-react";
import { useLogout } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ThemeToggle } from "@payflow/ui/theme-toggle";
import type { Theme } from "@payflow/ui/theme";
import { cn } from "@payflow/ui/utils";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/gateways", label: "Gateways", icon: Waypoints },
  { href: "/routing", label: "Routing", icon: SlidersHorizontal },
  { href: "/reconciliation", label: "Reconciliation", icon: ShieldCheck },
  { href: "/webhooks", label: "Webhook DLQ", icon: Webhook },
  { href: "/users", label: "Users", icon: Users },
];

export interface DashboardSidebarProps {
  email: string;
  role: string;
  theme: Theme;
}

export function DashboardSidebar({ email, role, theme }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-4 py-4">
        {/* Signal-lamp mark: a lit rail out of eight — the app's own subject,
            not a generic bolt/wallet glyph. Static, not animated: the sidebar
            is on every page, and ambient motion there would be exactly the
            scattered decoration the rest of this app deliberately avoids. */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="9.5" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="3" fill="var(--primary)" />
        </svg>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-wide">PayFlow</p>
          <p className="font-data text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            Switchboard
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius)] border-l-2 px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-l-primary bg-muted text-foreground"
                  : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0 text-xs leading-tight">
            <p className="truncate font-medium text-foreground">{email}</p>
            <p className="font-data text-muted-foreground">{role}</p>
          </div>
          <ThemeToggle theme={theme} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-muted-foreground"
          disabled={logout.isPending}
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}
