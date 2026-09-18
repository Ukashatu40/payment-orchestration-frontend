"use client";

import { useRefunds } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Badge } from "@payflow/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";

const REFUND_STATE_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  INITIATED: "info",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
  PARTIALLY_COMPLETED: "warning",
};

function formatAmount(paise: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(paise / 100);
  } catch {
    return `${(paise / 100).toFixed(2)} ${currency}`;
  }
}

export function RefundsList({ paymentId }: { paymentId: string }) {
  const { data, isLoading } = useRefunds(paymentId);

  if (isLoading || !data?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((refund) => (
            <TableRow key={refund.id}>
              <TableCell className="text-muted-foreground">
                {new Date(refund.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatAmount(refund.amountPaise, refund.currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">{refund.reason ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={REFUND_STATE_VARIANT[refund.state] ?? "neutral"}>
                  {refund.state}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
