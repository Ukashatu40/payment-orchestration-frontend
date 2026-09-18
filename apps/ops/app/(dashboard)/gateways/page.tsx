"use client";

import { useRouter } from "next/navigation";
import { useGateways } from "@payflow/api-client";
import { Badge } from "@payflow/ui/badge";
import { gatewayStatus } from "@payflow/ui/gateway-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@payflow/ui/table";

export default function GatewaysPage() {
  const router = useRouter();
  const { data: gateways, isLoading } = useGateways();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Gateways</h1>
        <p className="text-sm text-muted-foreground">
          Health, circuit-breaker state, and configuration for every payment gateway.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gateway</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Health</TableHead>
            <TableHead>Supported methods</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : (
            (gateways ?? []).map((gw) => {
              const status = gatewayStatus(gw.isEnabled, gw.circuitState);
              return (
                <TableRow
                  key={gw.gateway}
                  className="cursor-pointer"
                  onClick={() => router.push(`/gateways/${gw.gateway}`)}
                >
                  <TableCell className="font-medium">{gw.gateway}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Math.round(gw.healthScore * 100)}%
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {gw.supportedMethods.join(", ")}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
