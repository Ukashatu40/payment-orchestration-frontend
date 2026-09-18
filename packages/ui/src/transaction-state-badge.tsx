import { Badge, type BadgeProps } from "./badge";

/**
 * Mirrors src/common/enums/transaction-state.enum.ts on the backend exactly.
 * Keep in sync manually until the API client is generated from the OpenAPI
 * spec and this can be derived from there instead.
 */
export type TransactionState =
  | "CREATED"
  | "ROUTE_SELECTED"
  | "AUTH_INITIATED"
  | "AUTHORISED"
  | "AUTH_FAILED"
  | "AUTH_TIMEOUT"
  | "AUTH_EXPIRED"
  | "CAPTURE_INITIATED"
  | "CAPTURED"
  | "PARTIALLY_CAPTURED"
  | "CAPTURE_FAILED"
  | "VOID_INITIATED"
  | "VOIDED"
  | "REFUND_INITIATED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "REFUND_FAILED"
  | "SETTLED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "ABANDONED"
  | "ROUTE_FAILED"
  | "FAILED";

const STATE_META: Record<
  TransactionState,
  { label: string; variant: NonNullable<BadgeProps["variant"]> }
> = {
  CREATED: { label: "Created", variant: "neutral" },
  ROUTE_SELECTED: { label: "Route selected", variant: "neutral" },
  AUTH_INITIATED: { label: "Authorising…", variant: "info" },
  AUTHORISED: { label: "Authorised", variant: "success" },
  AUTH_FAILED: { label: "Auth failed", variant: "danger" },
  AUTH_TIMEOUT: { label: "Auth timed out", variant: "serious" },
  AUTH_EXPIRED: { label: "Auth expired", variant: "serious" },
  CAPTURE_INITIATED: { label: "Capturing…", variant: "info" },
  CAPTURED: { label: "Captured", variant: "success" },
  PARTIALLY_CAPTURED: { label: "Partially captured", variant: "warning" },
  CAPTURE_FAILED: { label: "Capture failed", variant: "danger" },
  VOID_INITIATED: { label: "Voiding…", variant: "info" },
  VOIDED: { label: "Voided", variant: "neutral" },
  REFUND_INITIATED: { label: "Refunding…", variant: "info" },
  REFUNDED: { label: "Refunded", variant: "neutral" },
  PARTIALLY_REFUNDED: { label: "Partially refunded", variant: "warning" },
  REFUND_FAILED: { label: "Refund failed", variant: "danger" },
  SETTLED: { label: "Settled", variant: "success" },
  DISPUTE_OPENED: { label: "Dispute opened", variant: "warning" },
  DISPUTE_RESOLVED: { label: "Dispute resolved", variant: "success" },
  ABANDONED: { label: "Abandoned", variant: "neutral" },
  ROUTE_FAILED: { label: "Routing failed", variant: "danger" },
  FAILED: { label: "Failed", variant: "danger" },
};

export const TRANSACTION_STATES = Object.keys(STATE_META) as TransactionState[];

export function transactionStateLabel(state: TransactionState): string {
  return STATE_META[state].label;
}

export interface TransactionStateBadgeProps {
  state: TransactionState;
  className?: string;
}

export function TransactionStateBadge({ state, className }: TransactionStateBadgeProps) {
  const meta = STATE_META[state];
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
