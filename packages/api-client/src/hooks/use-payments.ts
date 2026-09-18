"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import type { operations } from "../generated/schema";

const client = createBrowserApiClient();

export type PaymentsListFilters = NonNullable<
  operations["TransactionsController_listOrGetPayments_v1"]["parameters"]["query"]
>;

export function usePaymentsList(filters: PaymentsListFilters = {}) {
  return useQuery({
    queryKey: ["payments", "list", filters] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments", {
        params: { query: filters },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
