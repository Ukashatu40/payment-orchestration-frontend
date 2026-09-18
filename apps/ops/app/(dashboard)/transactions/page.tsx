"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePaymentsList, type PaymentsListFilters } from "@payflow/api-client";
import { GATEWAY_SERIES_INDEX } from "@payflow/ui/chart-colors";
import { Select } from "@payflow/ui/select";
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

const GATEWAYS = Object.keys(GATEWAY_SERIES_INDEX);
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
      <div>
        <h1 className="text-lg font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Every payment across all merchants and gateways.
        </p>
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

        <Select
          aria-label="Filter by gateway"
          value={filters.gateway ?? ""}
          onChange={(e) =>
            updateFilter({
              gateway: (e.target.value || undefined) as PaymentsListFilters["gateway"],
            })
          }
        >
          <option value="">All gateways</option>
          {GATEWAYS.map((gw) => (
            <option key={gw} value={gw}>
              {gw}
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
              <TableHead>Gateway</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                  <TableCell>{txn.gateway ?? "—"}</TableCell>
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
