"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePayment, useMe } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { PaymentSummary } from "./components/payment-summary";
import { PaymentActions } from "./components/payment-actions";
import { TimelineList } from "./components/timeline-list";
import { RefundsList } from "./components/refunds-list";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: payment, isLoading, error } = usePayment(id);
  const { data: me } = useMe();

  const canAct = hasRole(me?.role, ["SUPER_ADMIN", "OPS_ADMIN"]);

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
          <PaymentSummary payment={payment} />

          <PaymentActions
            paymentId={payment.id}
            state={payment.state}
            currency={payment.currency}
            remainingCapturePaise={payment.amountPaise - payment.capturedPaise}
            remainingRefundPaise={payment.capturedPaise - payment.refundedPaise}
            canAct={canAct}
          />

          <RefundsList paymentId={payment.id} />
          <TimelineList paymentId={payment.id} />
        </>
      )}
    </div>
  );
}
