"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export function useGateways() {
  return useQuery({
    queryKey: ["gateways"] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/gateways");
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}
