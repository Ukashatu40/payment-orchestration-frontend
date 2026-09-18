"use client";

import { CheckCircle2, Timer, Activity } from "lucide-react";
import { useGatewayHealth, useGatewayMetrics } from "@payflow/api-client";
import { Badge } from "@payflow/ui/badge";
import { StatTile } from "@payflow/ui/stat-tile";
import { gatewayStatus } from "@payflow/ui/gateway-status";

export function GatewaySummary({ name }: { name: string }) {
  const { data: health } = useGatewayHealth(name);
  const { data: metrics } = useGatewayMetrics(name);

  const totalCount = (metrics ?? []).reduce((sum, m) => sum + m.totalCount, 0);
  const weightedSuccess = (metrics ?? []).reduce((sum, m) => sum + m.successRate * m.totalCount, 0);
  const successRate = totalCount > 0 ? Math.round((weightedSuccess / totalCount) * 100) : null;
  const p95 = (metrics ?? []).length
    ? Math.max(...(metrics ?? []).map((m) => m.p95LatencyMs))
    : null;

  const status = health ? gatewayStatus(health.isEnabled, health.circuitBreakerStates[0]?.state) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{name}</h1>
        {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Success rate (10min)"
          value={successRate !== null ? `${successRate}%` : "—"}
          icon={CheckCircle2}
        />
        <StatTile
          label="p95 latency"
          value={p95 !== null ? `${p95}ms` : "—"}
          icon={Timer}
        />
        <StatTile label="Transactions (10min)" value={totalCount} icon={Activity} />
      </div>
    </div>
  );
}
