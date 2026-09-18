"use client";

import * as React from "react";
import { useGatewayHealth, useUpdateGatewayConfig } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";

export interface GatewayConfigActionProps {
  name: string;
  /** Client-side UX only — the backend @Roles guard is the real boundary. */
  canAct: boolean;
}

export function GatewayConfigAction({ name, canAct }: GatewayConfigActionProps) {
  const { data: health } = useGatewayHealth(name);
  const updateConfig = useUpdateGatewayConfig(name);

  const [open, setOpen] = React.useState(false);
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [failureThreshold, setFailureThreshold] = React.useState("5");

  if (!canAct || !health) return null;

  return (
    <>
      <Button
        type="button"
        variant={health.isEnabled ? "danger" : "outline"}
        onClick={() => {
          setIsEnabled(health.isEnabled);
          setFailureThreshold(String(health.cbFailureThreshold));
          setOpen(true);
        }}
      >
        Edit configuration
      </Button>

      <ConfirmDangerousActionDialog
        open={open}
        onOpenChange={setOpen}
        title={`Edit ${name} configuration`}
        confirmLabel="Save"
        description={
          <div className="flex flex-col gap-3 pt-2">
            <p>Changes take effect immediately for all future transactions.</p>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="size-4"
              />
              Gateway enabled
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Circuit breaker failure threshold
              <input
                type="number"
                step="1"
                min="1"
                value={failureThreshold}
                onChange={(e) => setFailureThreshold(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="font-normal text-muted-foreground">
                Consecutive failures before the circuit trips open
              </span>
            </label>
          </div>
        }
        onConfirm={async () => {
          await updateConfig.mutateAsync({
            isEnabled,
            cbFailureThreshold: Math.max(1, Math.round(parseFloat(failureThreshold || "1"))),
          });
        }}
      />
    </>
  );
}
