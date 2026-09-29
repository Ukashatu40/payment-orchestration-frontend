"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Settings, LogOut } from "lucide-react";
import { useLogout } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ThemeToggle } from "@payflow/ui/theme-toggle";
import type { Theme } from "@payflow/ui/theme";
import { cn } from "@payflow/ui/utils";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export interface DashboardSidebarProps {
  email: string;
  theme: Theme;
}

export function DashboardSidebar({ email, theme }: DashboardSidebarProps) {
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
      <div className="flex items-center gap-2.5 px-4 py-5">
        {/* A wax-seal mark, not a wallet icon — the "manifest" is stamped,
            not swiped. */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10.5" stroke="var(--primary)" strokeWidth="1.5" />
          <path
            d="M8 12.5 10.5 15 16 9"
            stroke="var(--primary)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-display text-lg font-semibold tracking-tight">PayFlow</p>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="truncate text-xs font-medium text-foreground">{email}</p>
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
