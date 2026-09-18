"use client";

import * as React from "react";
import { useMe } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { TriggerAction } from "./components/trigger-action";
import { AnomaliesQueue } from "./components/anomalies-queue";
import { ReportView } from "./components/report-view";

export default function ReconciliationPage() {
  const { data: me } = useMe();
  const canAct = hasRole(me?.role, ["SUPER_ADMIN", "OPS_ADMIN"]);
  const [lastRunId, setLastRunId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Reconciliation</h1>
        <p className="text-sm text-muted-foreground">
          Internal-vs-gateway state comparison, discrepancy detection, and the review queue.
        </p>
      </div>

      <TriggerAction canAct={canAct} onCompleted={setLastRunId} />
      {lastRunId ? <ReportView runId={lastRunId} /> : null}
      <AnomaliesQueue canAct={canAct} />
    </div>
  );
}
