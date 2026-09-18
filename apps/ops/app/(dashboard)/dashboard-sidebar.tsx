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
  Zap,
} from "lucide-react";
import { useLogout } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
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
}

export function DashboardSidebar({ email, role }: DashboardSidebarProps) {
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
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">PayFlow</p>
          <p className="text-xs text-muted-foreground">Ops</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
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
        <div className="px-1 text-xs leading-tight">
          <p className="truncate font-medium text-foreground">{email}</p>
          <p className="text-muted-foreground">{role}</p>
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
