"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserApiClient } from "../client";
import type { components, operations } from "../generated/schema";

const client = createBrowserApiClient();

export type UsersListFilters = NonNullable<
  operations["UsersController_listUsers_v1"]["parameters"]["query"]
>;

export function usersListQueryKey(filters: UsersListFilters) {
  return ["users", "list", filters] as const;
}

export function useUsersList(filters: UsersListFilters = {}) {
  return useQuery({
    queryKey: usersListQueryKey(filters),
    queryFn: async () => {
      const { data } = await client.GET("/api/v1/users", { params: { query: filters } });
      return data;
    },
  });
}

export interface CreateUserInput {
  email: string;
  password: string;
  /** Loosened to `string` — populated from a <select>, cast at the fetch
   * boundary below. The backend validates/400s on an unknown role anyway. */
  role: string;
  merchantId?: string;
  idempotencyKey: string;
}

/** POST /users is not on the IdempotencyKeyInterceptor's exempt list —
 * needs the header, same as capture/void/refund/resolve. */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { idempotencyKey, ...body } = input;
      const { data } = await client.POST("/api/v1/users", {
        headers: { "Idempotency-Key": idempotencyKey },
        body: body as components["schemas"]["CreateUserDto"],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export interface UpdateUserRoleInput {
  role: string;
  merchantId?: string;
}

export function useUpdateUserRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateUserRoleInput) => {
      const { data } = await client.PUT("/api/v1/users/{id}/role", {
        params: { path: { id } },
        body: body as components["schemas"]["UpdateUserRoleDto"],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useUpdateUserStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: components["schemas"]["UpdateUserStatusDto"]["status"]) => {
      const { data } = await client.PUT("/api/v1/users/{id}/status", {
        params: { path: { id } },
        body: { status },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

/** Admin-initiated reset — also clears any accumulated login lockout. */
export function useResetUserPassword(id: string) {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await client.PUT("/api/v1/users/{id}/password", {
        params: { path: { id } },
        body: { password },
      });
      return data;
    },
  });
}
