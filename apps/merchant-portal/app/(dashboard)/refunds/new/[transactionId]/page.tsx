"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePayment, useRefundPayment, ApiError } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";

function formatAmount(paise: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(paise / 100);
  } catch {
    return `${(paise / 100).toFixed(2)} ${currency}`;
  }
}

export default function NewRefundPage() {
  const params = useParams<{ transactionId: string }>();
  const transactionId = params.transactionId;
  const router = useRouter();

  const { data: payment, isLoading } = usePayment(transactionId);
  const refund = useRefundPayment(transactionId);
  const [idempotencyKey] = React.useState(() => crypto.randomUUID());
  const [formError, setFormError] = React.useState<string | null>(null);

  const remainingPaise = payment ? payment.capturedPaise - payment.refundedPaise : 0;

  const refundSchema = React.useMemo(
    () =>
      z.object({
        amount: z.coerce
          .number()
          .positive("Enter an amount greater than 0")
          .max(remainingPaise / 100, `Cannot exceed ${(remainingPaise / 100).toFixed(2)}`),
        reason: z.string().optional(),
      }),
    [remainingPaise],
  );
  type RefundFormValues = z.infer<typeof refundSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    values: { amount: remainingPaise / 100, reason: "" },
  });

  async function onSubmit(values: RefundFormValues) {
    setFormError(null);
    try {
      await refund.mutateAsync({
        amountPaise: Math.round(values.amount * 100),
        reason: values.reason || undefined,
        idempotencyKey,
      });
      router.push(`/transactions/${transactionId}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to request refund.");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href={`/transactions/${transactionId}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to transaction
      </Link>

      <div>
        <h1 className="text-lg font-semibold">Request a refund</h1>
        <p className="text-sm text-muted-foreground">
          {payment ? `Order ${payment.merchantOrderId}` : "Loading…"}
        </p>
      </div>

      {isLoading || !payment ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : remainingPaise <= 0 ? (
        <p className="text-sm text-danger">This payment has already been fully refunded.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Available to refund: {formatAmount(remainingPaise, payment.currency)}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount ({payment.currency})
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-invalid={Boolean(errors.amount)}
                {...register("amount")}
              />
              {errors.amount ? (
                <p role="alert" className="text-xs text-danger">
                  {errors.amount.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="reason"
                rows={3}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Helps us keep good records — not shown to the customer."
                {...register("reason")}
              />
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-danger">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline" type="button">
                <Link href={`/transactions/${transactionId}`}>Cancel</Link>
              </Button>
              <Button type="submit" variant="danger" disabled={refund.isPending}>
                {refund.isPending ? "Submitting…" : "Request refund"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
