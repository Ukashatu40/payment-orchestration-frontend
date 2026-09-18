"use client";

import * as React from "react";
import { useCapturePayment, useVoidPayment, useRefundPayment } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";

export interface PaymentActionsProps {
  paymentId: string;
  state: string;
  currency: string;
  remainingCapturePaise: number;
  remainingRefundPaise: number;
  /** Client-side UX only — the backend is the real authorization boundary. */
  canAct: boolean;
}

function toMajorUnits(paise: number) {
  return (paise / 100).toFixed(2);
}

function toMinorUnits(major: string): number {
  return Math.round(parseFloat(major || "0") * 100);
}

export function PaymentActions({
  paymentId,
  state,
  currency,
  remainingCapturePaise,
  remainingRefundPaise,
  canAct,
}: PaymentActionsProps) {
  const capture = useCapturePayment(paymentId);
  const voidPayment = useVoidPayment(paymentId);
  const refund = useRefundPayment(paymentId);

  const [captureOpen, setCaptureOpen] = React.useState(false);
  const [voidOpen, setVoidOpen] = React.useState(false);
  const [refundOpen, setRefundOpen] = React.useState(false);

  const [captureAmount, setCaptureAmount] = React.useState(() => toMajorUnits(remainingCapturePaise));
  const [refundAmount, setRefundAmount] = React.useState(() => toMajorUnits(remainingRefundPaise));
  const [refundReason, setRefundReason] = React.useState("");

  // Generated once per dialog-open, not per confirm click, so retrying a
  // failed attempt reuses the same key instead of minting a fresh one —
  // that's the whole point of an idempotency key.
  const [captureIdempotencyKey, setCaptureIdempotencyKey] = React.useState("");
  const [voidIdempotencyKey, setVoidIdempotencyKey] = React.useState("");
  const [refundIdempotencyKey, setRefundIdempotencyKey] = React.useState("");

  if (!canAct) return null;

  const canCapture = state === "AUTHORISED";
  const canVoid = state === "AUTHORISED";
  const canRefund = state === "CAPTURED" || state === "PARTIALLY_CAPTURED" || state === "SETTLED";

  if (!canCapture && !canVoid && !canRefund) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {canCapture ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setCaptureAmount(toMajorUnits(remainingCapturePaise));
            setCaptureIdempotencyKey(crypto.randomUUID());
            setCaptureOpen(true);
          }}
        >
          Capture
        </Button>
      ) : null}
      {canVoid ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setVoidIdempotencyKey(crypto.randomUUID());
            setVoidOpen(true);
          }}
        >
          Void
        </Button>
      ) : null}
      {canRefund ? (
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            setRefundAmount(toMajorUnits(remainingRefundPaise));
            setRefundReason("");
            setRefundIdempotencyKey(crypto.randomUUID());
            setRefundOpen(true);
          }}
        >
          Refund
        </Button>
      ) : null}

      <ConfirmDangerousActionDialog
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        title="Capture payment"
        confirmLabel="Capture"
        description={
          <div className="flex flex-col gap-2 pt-2">
            <p>Captures funds from the authorised payment.</p>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Amount ({currency})
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={captureAmount}
                onChange={(e) => setCaptureAmount(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
        }
        onConfirm={async () => {
          await capture.mutateAsync({
            amountPaise: toMinorUnits(captureAmount),
            idempotencyKey: captureIdempotencyKey,
          });
        }}
      />

      <ConfirmDangerousActionDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        title="Void payment"
        confirmLabel="Void"
        description="Cancels the authorisation. This cannot be undone."
        onConfirm={async () => {
          await voidPayment.mutateAsync({ idempotencyKey: voidIdempotencyKey });
        }}
      />

      <ConfirmDangerousActionDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Refund payment"
        confirmLabel="Refund"
        description={
          <div className="flex flex-col gap-2 pt-2">
            <p>Refunds captured funds back to the customer.</p>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Amount ({currency})
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Reason (optional)
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
        }
        onConfirm={async () => {
          await refund.mutateAsync({
            amountPaise: toMinorUnits(refundAmount),
            reason: refundReason || undefined,
            idempotencyKey: refundIdempotencyKey,
          });
        }}
      />
    </div>
  );
}
