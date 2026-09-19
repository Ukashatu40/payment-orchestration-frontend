"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";

const client = createBrowserApiClient();

export const meQueryKey = ["auth", "me"] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/auth/me");
      return data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await client.POST("/api/v1/auth/login", {
        body: credentials,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.POST("/api/v1/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey, null);
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export const sessionsQueryKey = ["auth", "sessions"] as const;

export function useSessions() {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/auth/sessions");
      return data ?? [];
    },
  });
}

/** DELETE isn't subject to the IdempotencyKeyInterceptor (POST-only). */
export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.DELETE("/api/v1/auth/sessions/{id}", {
        params: { path: { id } },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}
