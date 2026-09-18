"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import { anomaliesQueryKey } from "./use-anomalies";

const client = createBrowserApiClient();

export function reportQueryKey(runId: string) {
  return ["reconciliation", "report", runId] as const;
}

export function useReconciliationReport(runId: string) {
  return useQuery({
    queryKey: reportQueryKey(runId),
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/reconciliation/reports/{runId}", {
        params: { path: { runId } },
      });
      return data ?? [];
    },
    enabled: Boolean(runId),
  });
}

/**
 * The backend's IdempotencyKeyInterceptor exempts POST /reconciliation/trigger
 * by path but NOT /reconciliation/anomalies/:id/resolve — only the trigger
 * endpoint is on the exempt list, so resolve still needs the header.
 */
export function useTriggerReconciliation() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.POST("/api/v1/reconciliation/trigger");
      return data;
    },
  });
}

export function useResolveAnomaly() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; notes: string; idempotencyKey: string }) => {
      const { data } = await client.POST("/api/v1/reconciliation/anomalies/{id}/resolve", {
        params: { path: { id: input.id } },
        headers: { "Idempotency-Key": input.idempotencyKey },
        body: { notes: input.notes },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anomaliesQueryKey });
    },
  });
}
