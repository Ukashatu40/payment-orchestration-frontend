"use client";

import { CheckCircle2, Calendar, Activity } from "lucide-react";
import { useSuccessRateAnalytics, useVolumeAnalytics, useMe } from "@payflow/api-client";
import { StatTile } from "@payflow/ui/stat-tile";
import { VolumeChart } from "./components/volume-chart";

export default function OverviewPage() {
  const { data: me } = useMe();
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
        <h1 className="text-lg font-semibold">
          {me ? `Welcome back, ${me.email}` : "Overview"}
        </h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your payment activity over the last 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Success rate (24h)"
          value={overallSuccessRate !== null ? `${overallSuccessRate}%` : "—"}
          icon={CheckCircle2}
        />
        <StatTile label="Transactions today" value={txnsToday} icon={Calendar} />
        <StatTile label="Transactions (24h)" value={totalTxns} icon={Activity} />
      </div>

      <VolumeChart />
    </div>
  );
}
