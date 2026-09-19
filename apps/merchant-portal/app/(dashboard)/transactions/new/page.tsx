"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInitiatePayment, ApiError } from "@payflow/api-client";
import { Card } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";
import { Select } from "@payflow/ui/select";

const PAYMENT_METHODS = [
  "CARD_CREDIT",
  "CARD_DEBIT",
  "UPI",
  "NET_BANKING",
  "WALLET",
  "BANK_TRANSFER",
  "USSD",
  "MOBILE_MONEY",
  "VIRTUAL_ACCOUNT",
] as const;

const CURRENCIES = ["INR", "NGN", "USD"] as const;

const paymentSchema = z.object({
  merchantOrderId: z.string().min(1, "Enter an order reference"),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  currency: z.enum(CURRENCIES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function NewPaymentPage() {
  const router = useRouter();
  const initiate = useInitiatePayment();
  const [idempotencyKey] = React.useState(() => crypto.randomUUID());
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { currency: "INR", paymentMethod: "CARD_CREDIT" },
  });

  async function onSubmit(values: PaymentFormValues) {
    setFormError(null);
    try {
      const payment = await initiate.mutateAsync({
        merchantOrderId: values.merchantOrderId,
        amountPaise: Math.round(values.amount * 100),
        currency: values.currency,
        paymentMethod: values.paymentMethod,
        customerEmail: values.customerEmail || undefined,
        idempotencyKey,
      });
      if (payment) {
        router.push(`/transactions/${payment.id}`);
        router.refresh();
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to create payment.");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/transactions"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to transactions
      </Link>

      <div>
        <h1 className="text-lg font-semibold">New payment</h1>
        <p className="text-sm text-muted-foreground">
          Manually create a payment — useful for phone/mail orders or testing your
          integration.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="merchantOrderId" className="text-sm font-medium">
              Order reference
            </label>
            <input
              id="merchantOrderId"
              type="text"
              placeholder="e.g. order-10231"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={Boolean(errors.merchantOrderId)}
              {...register("merchantOrderId")}
            />
            {errors.merchantOrderId ? (
              <p role="alert" className="text-xs text-danger">
                {errors.merchantOrderId.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
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
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <Select id="currency" {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="paymentMethod" className="text-sm font-medium">
              Payment method
            </label>
            <Select id="paymentMethod" {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="customerEmail" className="text-sm font-medium">
              Customer email <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={Boolean(errors.customerEmail)}
              {...register("customerEmail")}
            />
            <p className="text-xs text-muted-foreground">
              Some payment methods (e.g. NGN card/bank transfer) require a customer email to
              authorise the charge.
            </p>
            {errors.customerEmail ? (
              <p role="alert" className="text-xs text-danger">
                {errors.customerEmail.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" type="button">
              <Link href="/transactions">Cancel</Link>
            </Button>
            <Button type="submit" disabled={initiate.isPending}>
              {initiate.isPending ? "Creating…" : "Create payment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
