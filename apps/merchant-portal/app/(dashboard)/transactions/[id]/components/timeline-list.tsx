"use client";

import { useTimeline } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { TransactionStateBadge } from "@payflow/ui/transaction-state-badge";

export function TimelineList({ paymentId }: { paymentId: string }) {
  const { data, isLoading } = useTimeline(paymentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No events recorded.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.map((entry) => (
            <li key={entry.id} className="flex gap-3 border-l-2 border-border pl-3">
              {/* items-start: without it, a flex-col child stretches to the
                  parent's full cross-axis width by default — the badge (an
                  inline-flex span meant to hug its text) was rendering as a
                  full-width bar instead of a compact pill. */}
              <div className="flex flex-1 flex-col items-start gap-1 text-sm">
                <TransactionStateBadge state={entry.toState} />
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
