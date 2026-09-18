"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import type { operations } from "../generated/schema";

const client = createBrowserApiClient();

export type GatewayName =
  operations["GatewaysController_updateGatewayConfig_v1"]["parameters"]["path"]["name"];

/**
 * Route params from Next's `useParams()` are always plain `string` — there's
 * no static way to prove a URL segment matches the gateway enum ahead of the
 * request, so the cast lives here once instead of at every call site. The
 * backend is the real validation boundary (an unknown name 404s/400s there).
 */
function asGatewayName(name: string): GatewayName {
  return name as GatewayName;
}

export function useGatewayHealth(name: string) {
  const gateway = asGatewayName(name);
  return useQuery({
    queryKey: ["gateways", "detail", gateway, "health"] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/gateways/{name}/health", {
        params: { path: { name: gateway } },
      });
      return data;
    },
    refetchInterval: 15_000,
  });
}

export function useGatewayMetrics(name: string) {
  const gateway = asGatewayName(name);
  return useQuery({
    queryKey: ["gateways", "detail", gateway, "metrics"] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/gateways/{name}/metrics", {
        params: { path: { name: gateway } },
      });
      return data ?? [];
    },
    refetchInterval: 15_000,
  });
}

export function useUpdateGatewayConfig(name: string) {
  const gateway = asGatewayName(name);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { isEnabled?: boolean; cbFailureThreshold?: number }) => {
      const { data } = await client.PUT("/api/v1/gateways/{name}/config", {
        params: { path: { name: gateway } },
        body,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
    },
  });
}
