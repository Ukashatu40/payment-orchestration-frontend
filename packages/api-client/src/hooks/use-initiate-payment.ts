"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import type { components } from "../generated/schema";

const client = createBrowserApiClient();

export type InitiatePaymentInput = components["schemas"]["InitiatePaymentRequestDto"] & {
  idempotencyKey: string;
};

/**
 * @CurrentMerchant() derives the merchant from the caller's own session for
 * a MERCHANT_* JWT — no x-merchant-id header needed (that's the legacy
 * API-key path only). Available to a browser session because this endpoint
 * is dual-use: a merchant's own backend integration calls it too, via API
 * key, which is why it still needs an idempotency key like any payment
 * mutation.
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InitiatePaymentInput) => {
      const { idempotencyKey, ...body } = input;
      const { data } = await client.POST("/api/v1/payments", {
        params: { header: { "idempotency-key": idempotencyKey } },
        body,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "list"] });
    },
  });
}
