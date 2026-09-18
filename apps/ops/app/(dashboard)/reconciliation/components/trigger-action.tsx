"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";
import { useTriggerReconciliation } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";
import { StatTile } from "@payflow/ui/stat-tile";

export interface TriggerActionProps {
  canAct: boolean;
  onCompleted: (runId: string) => void;
}

export function TriggerAction({ canAct, onCompleted }: TriggerActionProps) {
  const trigger = useTriggerReconciliation();
  const [open, setOpen] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<Awaited<
    ReturnType<typeof trigger.mutateAsync>
  > | null>(null);

  if (!canAct) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger reconciliation</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Compares stale internal transaction state against each gateway and flags
          discrepancies. Runs automatically every 15 minutes — this forces an immediate run.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit gap-2"
          onClick={() => setOpen(true)}
        >
          <PlayCircle className="size-4" />
          Run now
        </Button>

        {lastResult ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Checked" value={lastResult.totalChecked} />
            <StatTile label="Discrepancies" value={lastResult.discrepanciesFound} />
            <StatTile label="Auto-resolved" value={lastResult.autoResolved} />
            <StatTile label="Needs review" value={lastResult.requiresReview} />
          </div>
        ) : null}
      </div>

      <ConfirmDangerousActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Trigger reconciliation"
        confirmLabel="Run"
        description="Runs a full reconciliation pass immediately across all stale transactions."
        onConfirm={async () => {
          const result = await trigger.mutateAsync();
          if (result) {
            setLastResult(result);
            onCompleted(result.runId);
          }
        }}
      />
    </Card>
  );
}
