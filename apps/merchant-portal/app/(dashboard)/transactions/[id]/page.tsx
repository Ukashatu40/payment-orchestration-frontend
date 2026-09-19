"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@payflow/ui/button";
import { usePayment } from "@payflow/api-client";
import { PaymentSummary } from "./components/payment-summary";
import { TimelineList } from "./components/timeline-list";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: payment, isLoading, error } = usePayment(id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/transactions"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to transactions
      </Link>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error || !payment ? (
        <p className="text-sm text-danger">Transaction not found.</p>
      ) : (
        <>
          {payment.checkoutUrl && payment.state === "AUTH_INITIATED" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-info/10 p-4">
              <p className="text-sm">
                This payment is waiting for the customer to pay. Open the hosted checkout page
                to complete it — until then the gateway will report it as abandoned.
              </p>
              <Button asChild>
                <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  Complete payment
                  <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          ) : null}
          <PaymentSummary payment={payment} />
          <TimelineList paymentId={payment.id} />
        </>
      )}
    </div>
  );
}
