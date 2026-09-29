"use client";

import * as React from "react";
import { useGateways } from "@payflow/api-client";
import { GatewayLamp, GatewayLampRail } from "@payflow/ui/gateway-lamp";
import { gatewayStatus } from "@payflow/ui/gateway-status";
import { LiveRegion } from "@payflow/ui/live-region";

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
    return <div className="h-32 animate-pulse rounded-[var(--radius)] border border-border bg-card" />;
  }

  return (
    <div className="flex flex-col gap-0">
      <LiveRegion politeness="assertive" message={announcement} />
      <div className="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-4">
        {(gateways ?? []).map((gw) => {
          const status = gatewayStatus(gw.isEnabled, gw.circuitState);
          const healthPct = Math.round(gw.healthScore * 100);
          return (
            <GatewayLamp
              key={gw.gateway}
              href={`/gateways/${gw.gateway}`}
              name={gw.gateway}
              variant={status.variant}
              statusLabel={status.label}
              readout={`${healthPct}%`}
            />
          );
        })}
      </div>
      <GatewayLampRail />
    </div>
  );
}
