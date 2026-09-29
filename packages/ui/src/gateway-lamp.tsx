import * as React from "react";
import { cn } from "./utils";
import type { GatewayStatusVariant } from "./gateway-status";

const LAMP_COLOR: Record<GatewayStatusVariant, string> = {
  success: "bg-success shadow-[0_0_6px_2px_var(--success)]",
  warning: "bg-warning shadow-[0_0_6px_2px_var(--warning)]",
  danger: "bg-danger shadow-[0_0_6px_2px_var(--danger)]",
  neutral: "bg-muted-foreground/40 shadow-none",
};

export interface GatewayLampProps {
  name: string;
  variant: GatewayStatusVariant;
  statusLabel: string;
  readout: string;
  href?: string;
  className?: string;
}

/**
 * The instrument-panel module that carries "Switchboard": a lit LED above a
 * mono readout, not a card with a badge and a progress bar. Eight of these
 * sit in a fixed grid wired by a hairline patch-rail (see GatewayLampRail) —
 * a rail that goes dark is meant to look like a real console losing a
 * signal, not a muted list item.
 */
export function GatewayLamp({ name, variant, statusLabel, readout, href, className }: GatewayLampProps) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={cn(
        "group flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2.5 transition-colors hover:border-ring",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-data truncate text-[0.7rem] uppercase tracking-[0.08em] text-muted-foreground group-hover:text-foreground"
          title={statusLabel}
        >
          {name}
        </span>
        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", LAMP_COLOR[variant])} />
      </div>
      <span className="font-data text-lg font-medium text-foreground">{readout}</span>
      <span className="sr-only">{statusLabel}</span>
    </Wrapper>
  );
}

/** The hairline "patch rail" baseline a row of GatewayLamps sits on. */
export function GatewayLampRail({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-border to-transparent", className)}
    />
  );
}
