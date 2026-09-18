"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export interface AnalyticsRange {
  from?: string;
  to?: string;
}

export function useSuccessRateAnalytics(range: AnalyticsRange = {}) {
  return useQuery({
    queryKey: ["analytics", "success-rate", range] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments/analytics/success-rate", {
        params: { query: range },
      });
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useVolumeAnalytics(range: AnalyticsRange = {}) {
  return useQuery({
    queryKey: ["analytics", "volume", range] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments/analytics/volume", {
        params: { query: range },
      });
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
