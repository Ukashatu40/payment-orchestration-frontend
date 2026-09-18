"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export const routingConfigQueryKey = ["gateways", "routing-config"] as const;

export function useRoutingConfig() {
  return useQuery({
    queryKey: routingConfigQueryKey,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/gateways/routing/config");
      return data;
    },
  });
}

export interface RoutingWeights {
  weightSuccessRate: number;
  weightLatency: number;
  weightCost: number;
  weightHealth: number;
  weightFit: number;
}

export function useUpdateRoutingConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RoutingWeights) => {
      const { data } = await client.PUT("/api/v1/gateways/routing/config", { body });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routingConfigQueryKey });
    },
  });
}
