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
              <div className="flex flex-1 flex-col gap-1 text-sm">
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
