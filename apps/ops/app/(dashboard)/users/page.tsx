"use client";

import * as React from "react";
import { useUsersList, useMe, type UsersListFilters } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { Badge } from "@payflow/ui/badge";
import { Select } from "@payflow/ui/select";
import { Pagination } from "@payflow/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@payflow/ui/table";
import { CreateUserDialog } from "./components/create-user-dialog";
import { UserRowActions } from "./components/user-row-actions";
import { RoleSelect } from "./components/role-select";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const { data: me } = useMe();
  const canManage = hasRole(me?.role, ["SUPER_ADMIN"]);

  const [filters, setFilters] = React.useState<UsersListFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const { data, isLoading } = useUsersList(filters);

  function updateFilter(patch: Partial<UsersListFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Internal staff and merchant accounts with API access.
          </p>
        </div>
        {canManage ? <CreateUserDialog /> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RoleSelect
          allowAll
          value={filters.role ?? ""}
          onChange={(value) =>
            updateFilter({ role: (value || undefined) as UsersListFilters["role"] })
          }
        />
        <Select
          aria-label="Filter by status"
          value={filters.status ?? ""}
          onChange={(e) =>
            updateFilter({ status: (e.target.value || undefined) as UsersListFilters["status"] })
          }
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last login</TableHead>
            {canManage ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : !data?.data.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No users match these filters.
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {user.merchantId ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "ACTIVE" ? "success" : "neutral"}>
                    {user.status}
                  </Badge>
                  {user.lockedUntil && new Date(user.lockedUntil) > new Date() ? (
                    <Badge variant="warning" className="ml-1.5">
                      Locked
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                </TableCell>
                {canManage ? (
                  <TableCell>
                    <UserRowActions
                      id={user.id}
                      email={user.email}
                      role={user.role}
                      merchantId={user.merchantId}
                      status={user.status}
                      isSelf={user.id === me?.id}
                    />
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      ) : null}
    </div>
  );
}
