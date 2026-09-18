import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { TransactionStateBadge, type TransactionState } from "@payflow/ui/transaction-state-badge";

export interface PaymentSummaryPayment {
  merchantOrderId: string;
  merchantId: string;
  state: TransactionState;
  amountRupees: number;
  capturedPaise: number;
  refundedPaise: number;
  amountPaise: number;
  currency: string;
  gateway: string | null;
  gatewayPaymentId: string | null;
  gatewayReference: string | null;
  paymentMethod: string;
  traceId: string;
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

export function PaymentSummary({ payment }: { payment: PaymentSummaryPayment }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{payment.merchantOrderId}</h1>
            <TransactionStateBadge state={payment.state} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">trace {payment.traceId}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Created {new Date(payment.createdAt).toLocaleString()}</p>
          <p>Updated {new Date(payment.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Amount</CardTitle>
          </CardHeader>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Authorised</dt>
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
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gateway</CardTitle>
          </CardHeader>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Gateway</dt>
              <dd>{payment.gateway ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Payment ID</dt>
              <dd className="truncate font-mono text-xs">{payment.gatewayPaymentId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Method</dt>
              <dd>{payment.paymentMethod}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merchant</CardTitle>
          </CardHeader>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Merchant ID</dt>
              <dd className="truncate font-mono text-xs">{payment.merchantId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{payment.currency}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
