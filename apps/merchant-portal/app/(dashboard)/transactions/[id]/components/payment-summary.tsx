import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";
import { TransactionStateBadge, type TransactionState } from "@payflow/ui/transaction-state-badge";

export interface PaymentSummaryPayment {
  id: string;
  merchantOrderId: string;
  state: TransactionState;
  amountPaise: number;
  capturedPaise: number;
  refundedPaise: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

function formatAmount(paise: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(paise / 100);
  } catch {
    return `${(paise / 100).toFixed(2)} ${currency}`;
  }
}

const REFUNDABLE_STATES = ["CAPTURED", "PARTIALLY_CAPTURED", "SETTLED"];

export function PaymentSummary({ payment }: { payment: PaymentSummaryPayment }) {
  const canRefund =
    REFUNDABLE_STATES.includes(payment.state) && payment.capturedPaise > payment.refundedPaise;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{payment.merchantOrderId}</h1>
            <TransactionStateBadge state={payment.state} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(payment.createdAt).toLocaleString()}
          </p>
        </div>
        {canRefund ? (
          <Button asChild variant="outline">
            <Link href={`/refunds/new/${payment.id}`}>Request refund</Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amount</CardTitle>
        </CardHeader>
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Paid</dt>
            <dd className="tabular-nums">{formatAmount(payment.amountPaise, payment.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Captured</dt>
            <dd className="tabular-nums">
              {formatAmount(payment.capturedPaise, payment.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Refunded</dt>
            <dd className="tabular-nums">
              {formatAmount(payment.refundedPaise, payment.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment method</dt>
            <dd>{payment.paymentMethod}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
