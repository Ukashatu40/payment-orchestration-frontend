"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export function paymentQueryKey(id: string) {
  return ["payments", "detail", id] as const;
}

export function timelineQueryKey(id: string) {
  return ["payments", "detail", id, "timeline"] as const;
}

export function refundsQueryKey(id: string) {
  return ["payments", "detail", id, "refunds"] as const;
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentQueryKey(id),
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments/{id}", {
        params: { path: { id } },
      });
      return data;
    },
  });
}

export function useTimeline(id: string) {
  return useQuery({
    queryKey: timelineQueryKey(id),
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments/{id}/timeline", {
        params: { path: { id } },
      });
      return data ?? [];
    },
  });
}

export function useRefunds(id: string) {
  return useQuery({
    queryKey: refundsQueryKey(id),
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/payments/{id}/refunds", {
        params: { path: { id } },
      });
      return data ?? [];
    },
  });
}

function useInvalidatePaymentDetail(id: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: paymentQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: timelineQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: ["payments", "list"] });
  };
}

/**
 * The backend's IdempotencyKeyInterceptor requires an `Idempotency-Key`
 * header on every POST payment mutation (capture/void/refund included) —
 * separate from, and in addition to, refund's own `idempotencyKey` body
 * field. Callers generate the key (see payment-actions.tsx) rather than the
 * hook generating one per call, so a retry of the same user intent reuses
 * the same key instead of minting a fresh one each attempt.
 */
export function useCapturePayment(id: string) {
  const invalidate = useInvalidatePaymentDetail(id);
  return useMutation({
    mutationFn: async (input: { amountPaise?: number; idempotencyKey: string }) => {
      const { idempotencyKey, ...body } = input;
      const { data } = await client.POST("/api/v1/payments/{id}/capture", {
        params: { path: { id } },
        headers: { "Idempotency-Key": idempotencyKey },
        body,
      });
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useVoidPayment(id: string) {
  const invalidate = useInvalidatePaymentDetail(id);
  return useMutation({
    mutationFn: async (input: { idempotencyKey: string }) => {
      const { data } = await client.POST("/api/v1/payments/{id}/void", {
        params: { path: { id } },
        headers: { "Idempotency-Key": input.idempotencyKey },
      });
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useRefundPayment(id: string) {
  const invalidate = useInvalidatePaymentDetail(id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { amountPaise: number; reason?: string; idempotencyKey: string }) => {
      const { data } = await client.POST("/api/v1/payments/{id}/refund", {
        params: { path: { id } },
        headers: { "Idempotency-Key": body.idempotencyKey },
        body,
      });
      return data;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: refundsQueryKey(id) });
    },
  });
}
