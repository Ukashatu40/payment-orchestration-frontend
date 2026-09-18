"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export const anomaliesQueryKey = ["reconciliation", "anomalies"] as const;

export function useAnomalies() {
  return useQuery({
    queryKey: anomaliesQueryKey,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/reconciliation/anomalies");
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}
