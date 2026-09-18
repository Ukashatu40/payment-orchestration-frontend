"use client";

import * as React from "react";
import { useAnomalies, useResolveAnomaly } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Badge } from "@payflow/ui/badge";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";

export interface AnomaliesQueueProps {
  canAct: boolean;
}

export function AnomaliesQueue({ canAct }: AnomaliesQueueProps) {
  const { data: anomalies, isLoading } = useAnomalies();
  const resolve = useResolveAnomaly();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");
  const [idempotencyKey, setIdempotencyKey] = React.useState("");

  const active = anomalies?.find((a) => a.id === activeId) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalies queue</CardTitle>
      </CardHeader>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !anomalies?.length ? (
        <p className="text-sm text-muted-foreground">No unresolved anomalies.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Detected</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Discrepancy</TableHead>
              <TableHead>Internal / gateway state</TableHead>
              <TableHead>Review</TableHead>
              {canAct ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalies.map((anomaly) => (
              <TableRow key={anomaly.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(anomaly.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{anomaly.gateway ?? "—"}</TableCell>
                <TableCell>{anomaly.discrepancyType ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {anomaly.internalState ?? "—"} / {anomaly.gatewayState ?? "—"}
                </TableCell>
                <TableCell>
                  {anomaly.requiresReview ? (
                    <Badge variant="warning">Needs review</Badge>
                  ) : (
                    <Badge variant="neutral">Auto</Badge>
                  )}
                </TableCell>
                {canAct ? (
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveId(anomaly.id);
                        setNotes("");
                        setIdempotencyKey(crypto.randomUUID());
                      }}
                    >
                      Resolve
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDangerousActionDialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        title="Resolve anomaly"
        confirmLabel="Mark resolved"
        description={
          <div className="flex flex-col gap-2 pt-2">
            <p>
              {active?.gateway} · {active?.discrepancyType}
            </p>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Notes
              <textarea
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="What did you find? Why is this resolved?"
              />
            </label>
          </div>
        }
        onConfirm={async () => {
          if (!activeId || !notes.trim()) return;
          await resolve.mutateAsync({ id: activeId, notes: notes.trim(), idempotencyKey });
        }}
      />
    </Card>
  );
}
