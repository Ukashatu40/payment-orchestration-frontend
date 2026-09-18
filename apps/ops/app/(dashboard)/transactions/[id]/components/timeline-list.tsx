"use client";

import { useTimeline } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { TransactionStateBadge } from "@payflow/ui/transaction-state-badge";

export function TimelineList({ paymentId }: { paymentId: string }) {
  const { data, isLoading } = useTimeline(paymentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No events recorded.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.map((entry) => (
            <li key={entry.id} className="flex gap-3 border-l-2 border-border pl-3">
              <div className="flex flex-1 flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <TransactionStateBadge state={entry.fromState} />
                  <span className="text-muted-foreground">→</span>
                  <TransactionStateBadge state={entry.toState} />
                </div>
                <p className="text-muted-foreground">
                  {entry.event} · triggered by {entry.triggeredBy}
                </p>
                {entry.gatewayReference ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    ref {entry.gatewayReference}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
