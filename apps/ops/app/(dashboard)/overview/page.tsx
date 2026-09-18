"use client";

import { AlertTriangle, CheckCircle2, Calendar, Activity } from "lucide-react";
import { useAnomalies, useSuccessRateAnalytics, useVolumeAnalytics } from "@payflow/api-client";
import { StatTile } from "@payflow/ui/stat-tile";
import { GatewayHealthGrid } from "./components/gateway-health-grid";
import { SuccessRateChart } from "./components/success-rate-chart";
import { VolumeChart } from "./components/volume-chart";

export default function OverviewPage() {
  const { data: anomalies } = useAnomalies();
  const { data: successRates } = useSuccessRateAnalytics();
  const { data: volume } = useVolumeAnalytics();

  const totalTxns = (successRates ?? []).reduce((sum, row) => sum + row.total, 0);
  const totalCaptured = (successRates ?? []).reduce(
    (sum, row) => sum + row.successRate * row.total,
    0,
  );
  const overallSuccessRate = totalTxns > 0 ? Math.round((totalCaptured / totalTxns) * 100) : null;
  const txnsToday = (volume ?? []).at(-1)?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Gateway health, routing performance, and reconciliation status at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Open anomalies"
          value={anomalies ? anomalies.length : "—"}
          icon={AlertTriangle}
        />
        <StatTile
          label="Success rate (24h)"
          value={overallSuccessRate !== null ? `${overallSuccessRate}%` : "—"}
          icon={CheckCircle2}
        />
        <StatTile label="Transactions today" value={txnsToday} icon={Calendar} />
        <StatTile label="Transactions (24h)" value={totalTxns} icon={Activity} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Gateways</h2>
        <GatewayHealthGrid />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SuccessRateChart />
        <VolumeChart />
      </div>
    </div>
  );
}
