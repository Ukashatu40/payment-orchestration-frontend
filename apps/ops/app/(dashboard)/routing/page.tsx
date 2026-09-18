"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRoutingConfig, useUpdateRoutingConfig, useMe, type RoutingWeights } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";
import { cn } from "@payflow/ui/utils";
import { WeightSlider } from "./components/weight-slider";

const WEIGHT_FIELDS: { key: keyof RoutingWeights; label: string; description: string }[] = [
  {
    key: "weightSuccessRate",
    label: "Success rate",
    description: "Historical success rate over the sliding window",
  },
  {
    key: "weightLatency",
    label: "Latency",
    description: "p95 latency — lower latency scores higher",
  },
  {
    key: "weightCost",
    label: "Cost",
    description: "Gateway transaction cost — lower cost scores higher",
  },
  {
    key: "weightHealth",
    label: "Health",
    description: "Circuit breaker health score",
  },
  {
    key: "weightFit",
    label: "Fit",
    description: "Whether the gateway supports the payment method (1.0 or 0.0)",
  },
];

const EPSILON = 0.005;

export default function RoutingConfigPage() {
  const { data: config, isLoading } = useRoutingConfig();
  const { data: me } = useMe();
  const updateConfig = useUpdateRoutingConfig();
  const canAct = hasRole(me?.role, ["SUPER_ADMIN", "OPS_ADMIN"]);

  const [weights, setWeights] = React.useState<RoutingWeights | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Local editable copy, re-synced from the server value whenever it
  // changes (initial load, or after a save) — adjusted during render per
  // React's own guidance for this pattern, not via useEffect, so there's no
  // extra post-commit render showing stale weights.
  const [loadedAt, setLoadedAt] = React.useState<string | undefined>(undefined);
  if (config && config.updatedAt !== loadedAt) {
    setLoadedAt(config.updatedAt);
    setWeights({
      weightSuccessRate: config.weightSuccessRate,
      weightLatency: config.weightLatency,
      weightCost: config.weightCost,
      weightHealth: config.weightHealth,
      weightFit: config.weightFit,
    });
  }

  if (isLoading || !weights) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(sum - 1) <= EPSILON;
  const isDirty = config
    ? WEIGHT_FIELDS.some((f) => weights[f.key] !== config[f.key])
    : false;

  function resetToServer() {
    if (config) {
      setWeights({
        weightSuccessRate: config.weightSuccessRate,
        weightLatency: config.weightLatency,
        weightCost: config.weightCost,
        weightHealth: config.weightHealth,
        weightFit: config.weightFit,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Routing configuration</h1>
        <p className="text-sm text-muted-foreground">
          Controls which gateway every future transaction routes to. Weights must sum to 1.0.
        </p>
      </div>

      {config ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Sliding window</p>
            <p className="text-sm font-medium">{config.slidingWindowMinutes} min</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Degraded skip threshold</p>
            <p className="text-sm font-medium tabular-nums">{config.degradedSkipThreshold}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium">{new Date(config.updatedAt).toLocaleString()}</p>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Scoring weights</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-5">
          {WEIGHT_FIELDS.map((field) => (
            <WeightSlider
              key={field.key}
              label={field.label}
              description={field.description}
              value={weights[field.key]}
              disabled={!canAct}
              onChange={(value) => setWeights((prev) => (prev ? { ...prev, [field.key]: value } : prev))}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              isBalanced ? "text-success" : "text-danger",
            )}
          >
            {isBalanced ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            Sum: <span className="tabular-nums">{sum.toFixed(3)}</span>
            {!isBalanced ? " (must equal 1.000)" : null}
          </div>

          {canAct ? (
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={!isDirty} onClick={resetToServer}>
                Reset
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={!isBalanced || !isDirty}
                onClick={() => setConfirmOpen(true)}
              >
                Save changes
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      <ConfirmDangerousActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update routing configuration"
        confirmLabel="Save"
        description="This changes which gateway every future transaction routes to, immediately and for all merchants. This cannot be undone from here — you'd need to manually set the weights back."
        onConfirm={async () => {
          await updateConfig.mutateAsync(weights);
        }}
      />
    </div>
  );
}
