import * as React from "react";
import { cn } from "./utils";
import { Card } from "./card";

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  delta?: {
    value: string;
    /** Whether this delta represents a good or bad change — not just sign. */
    direction: "up" | "down";
    isGood: boolean;
  };
  className?: string;
}

/**
 * Stat tile per the dataviz skill's figure contract: sentence-case label (no
 * trailing colon), semibold proportional-figure value, optional signed delta
 * colored by direction × whether up is good (not by sign alone — a rising
 * failure rate is bad even though it's "up").
 */
export function StatTile({ label, value, icon: Icon, delta, className }: StatTileProps) {
  return (
    <Card className={cn("flex items-start justify-between", className)}>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {delta ? (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              delta.isGood ? "text-success" : "text-danger",
            )}
          >
            {delta.direction === "up" ? "▲" : "▼"} {delta.value}
          </p>
        ) : null}
      </div>
      {Icon ? (
        <div className="rounded-md bg-muted p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      ) : null}
    </Card>
  );
}
