"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { usePaymentsList, type PaymentsListFilters } from "@payflow/api-client";
import { Select } from "@payflow/ui/select";
import { Button } from "@payflow/ui/button";
import { Pagination } from "@payflow/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@payflow/ui/table";
import { TransactionStateBadge, TRANSACTION_STATES, transactionStateLabel } from "@payflow/ui/transaction-state-badge";

const PAGE_SIZE = 20;

function formatAmount(rupees: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(rupees);
  } catch {
    return `${rupees.toFixed(2)} ${currency}`;
  }
}

export default function TransactionsPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<PaymentsListFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching } = usePaymentsList(filters);

  function updateFilter(patch: Partial<PaymentsListFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every payment made to your account.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/transactions/new">
            <Plus className="size-4" />
            New payment
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Filter by state"
          value={filters.state ?? ""}
          onChange={(e) =>
            updateFilter({ state: (e.target.value || undefined) as PaymentsListFilters["state"] })
          }
        >
          <option value="">All states</option>
          {TRANSACTION_STATES.map((state) => (
            <option key={state} value={state}>
              {transactionStateLabel(state)}
            </option>
          ))}
        </Select>

        <input
          type="date"
          aria-label="From date"
          className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.from?.slice(0, 10) ?? ""}
          onChange={(e) =>
            updateFilter({ from: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined })
          }
        />
        <span className="text-sm text-muted-foreground">to</span>
        <input
          type="date"
          aria-label="To date"
          className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filters.to?.slice(0, 10) ?? ""}
          onChange={(e) =>
            updateFilter({ to: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })
          }
        />
      </div>

      <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No transactions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((txn) => (
                <TableRow
                  key={txn.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/transactions/${txn.id}`)}
                >
                  <TableCell className="text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{txn.merchantOrderId}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(txn.amountRupees, txn.currency)}
                  </TableCell>
                  <TableCell>
                    <TransactionStateBadge state={txn.state} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      ) : null}
    </div>
  );
}
