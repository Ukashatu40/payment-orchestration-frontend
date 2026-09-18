"use client";

import { useReconciliationReport } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Badge } from "@payflow/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";

export function ReportView({ runId }: { runId: string }) {
  const { data: entries, isLoading } = useReconciliationReport(runId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report for run {runId}</CardTitle>
      </CardHeader>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !entries?.length ? (
        <p className="text-sm text-muted-foreground">No discrepancies found in this run.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gateway</TableHead>
              <TableHead>Discrepancy</TableHead>
              <TableHead>Internal / gateway state</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.gateway ?? "—"}</TableCell>
                <TableCell>{entry.discrepancyType ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.internalState ?? "—"} / {entry.gatewayState ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={entry.resolved ? "success" : "warning"}>
                    {entry.resolved ? "Resolved" : "Open"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
