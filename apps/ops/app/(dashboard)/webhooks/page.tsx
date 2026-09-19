"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useWebhookDlq, useMe } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { GATEWAY_SERIES_INDEX } from "@payflow/ui/chart-colors";
import { Select } from "@payflow/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";
import { LiveRegion } from "@payflow/ui/live-region";
import { ReplayAction } from "./components/replay-action";

const GATEWAYS = Object.keys(GATEWAY_SERIES_INDEX);

export default function WebhookDlqPage() {
  const [gateway, setGateway] = React.useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { data: entries, isLoading } = useWebhookDlq(gateway);
  const { data: me } = useMe();
  const canAct = hasRole(me?.role, ["SUPER_ADMIN", "OPS_ADMIN"]);

  const [announcement, setAnnouncement] = React.useState("");
  const knownIds = React.useRef<Set<string> | null>(null);

  React.useEffect(() => {
    if (!entries) return;
    const ids = new Set(entries.map((e) => e.id));
    if (knownIds.current) {
      const newCount = [...ids].filter((id) => !knownIds.current!.has(id)).length;
      if (newCount > 0) {
        setAnnouncement(
          newCount === 1
            ? "A new webhook landed in the dead-letter queue."
            : `${newCount} new webhooks landed in the dead-letter queue.`,
        );
      }
    }
    knownIds.current = ids;
  }, [entries]);

  return (
    <div className="flex flex-col gap-4">
      <LiveRegion politeness="polite" message={announcement} />
      <div>
        <h1 className="text-lg font-semibold">Webhook DLQ</h1>
        <p className="text-sm text-muted-foreground">
          Webhook events that exhausted their retries. Replaying re-verifies the signature
          before re-processing.
        </p>
      </div>

      <Select
        aria-label="Filter by gateway"
        value={gateway ?? ""}
        onChange={(e) => setGateway(e.target.value || undefined)}
        className="w-fit"
      >
        <option value="">All gateways</option>
        {GATEWAYS.map((gw) => (
          <option key={gw} value={gw}>
            {gw}
          </option>
        ))}
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Failed</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Event ID</TableHead>
            <TableHead className="text-right">Retries</TableHead>
            <TableHead>Error</TableHead>
            {canAct ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : !entries?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Nothing in the dead-letter queue.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => {
              const expanded = expandedId === entry.id;
              return (
                <React.Fragment key={entry.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : entry.id)}
                  >
                    <TableCell>
                      {expanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.gateway}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.eventId}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.retryCount}/{entry.maxRetries}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {entry.errorMessage ?? "—"}
                    </TableCell>
                    {canAct ? (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <ReplayAction id={entry.id} eventId={entry.eventId} />
                      </TableCell>
                    ) : null}
                  </TableRow>
                  {expanded ? (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="flex flex-col gap-2 py-1">
                          {entry.errorMessage ? (
                            <p className="text-xs text-danger">{entry.errorMessage}</p>
                          ) : null}
                          <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 text-xs">
                            {JSON.stringify(entry.payload, null, 2)}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
