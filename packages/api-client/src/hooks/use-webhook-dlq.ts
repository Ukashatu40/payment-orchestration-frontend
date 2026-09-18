"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import type { operations } from "../generated/schema";

const client = createBrowserApiClient();

type GatewayFilter = NonNullable<
  operations["WebhooksController_getDLQ_v1"]["parameters"]["query"]
>["gateway"];

export const dlqQueryKey = ["webhooks", "dlq"] as const;

/**
 * `gateway` comes from a <select> populated at runtime (see chart-colors'
 * GATEWAY_SERIES_INDEX) — always a plain string. Cast once here rather than
 * at each call site; the backend validates/404s on an unknown value anyway.
 */
export function useWebhookDlq(gateway?: string) {
  return useQuery({
    queryKey: [...dlqQueryKey, gateway] as const,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/webhooks/dlq", {
        params: { query: { gateway: gateway as GatewayFilter } },
      });
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}

/** Webhook endpoints are exempt from the Idempotency-Key requirement — they
 * manage their own dedup via event_id (see IdempotencyKeyInterceptor). */
export function useReplayWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.POST("/api/v1/webhooks/dlq/{id}/replay", {
        params: { path: { id } },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dlqQueryKey });
    },
  });
}
