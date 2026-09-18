"use client";

import { useGatewayHealth } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Badge } from "@payflow/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";

const STATE_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  CLOSED: "success",
  HALF_OPEN: "warning",
  OPEN: "danger",
};

export function CircuitBreakerTable({ name }: { name: string }) {
  const { data, isLoading } = useGatewayHealth(name);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit breaker</CardTitle>
      </CardHeader>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data?.circuitBreakerStates.length ? (
        <p className="text-sm text-muted-foreground">No circuit breaker activity recorded.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment method</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Failures</TableHead>
              <TableHead>Last failure</TableHead>
              <TableHead>Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.circuitBreakerStates.map((entry, i) => (
              <TableRow key={`${entry.paymentMethod ?? "all"}-${i}`}>
                <TableCell>{entry.paymentMethod ?? "All methods"}</TableCell>
                <TableCell>
                  <Badge variant={STATE_VARIANT[entry.state] ?? "neutral"}>{entry.state}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{entry.failureCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.lastFailureAt ? new Date(entry.lastFailureAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.openedAt ? new Date(entry.openedAt).toLocaleString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
