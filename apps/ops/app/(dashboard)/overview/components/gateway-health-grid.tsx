"use client";

import * as React from "react";
import Link from "next/link";
import { useGateways } from "@payflow/api-client";
import { Badge } from "@payflow/ui/badge";
import { Card } from "@payflow/ui/card";
import { cn } from "@payflow/ui/utils";
import { gatewayStatus, type GatewayStatusVariant } from "@payflow/ui/gateway-status";
import { LiveRegion } from "@payflow/ui/live-region";

const METER_FILL: Record<GatewayStatusVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-foreground",
};

export function GatewayHealthGrid() {
  const { data: gateways, isLoading } = useGateways();
  const [announcement, setAnnouncement] = React.useState("");
  const prevOpenGateways = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!gateways) return;
    const nowOpen = new Set(gateways.filter((g) => g.circuitState === "OPEN").map((g) => g.gateway));
    const newlyOpen = [...nowOpen].filter((g) => !prevOpenGateways.current.has(g));
    if (newlyOpen.length > 0) {
      setAnnouncement(
        `Circuit breaker opened for ${newlyOpen.join(", ")} — requests are failing fast.`,
      );
    }
    prevOpenGateways.current = nowOpen;
  }, [gateways]);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-lg border border-border bg-card" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <LiveRegion politeness="assertive" message={announcement} />
      {(gateways ?? []).map((gw) => {
        const status = gatewayStatus(gw.isEnabled, gw.circuitState);
        const healthPct = Math.round(gw.healthScore * 100);
        return (
          <Link key={gw.gateway} href={`/gateways/${gw.gateway}`}>
            <Card className="p-3 transition-colors hover:border-ring">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{gw.gateway}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", METER_FILL[status.variant])}
                  style={{ width: `${healthPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Health <span className="tabular-nums text-foreground">{healthPct}%</span>
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
