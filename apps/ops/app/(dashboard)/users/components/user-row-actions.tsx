"use client";

import * as React from "react";
import { useUpdateUserRole, useUpdateUserStatus, useResetUserPassword } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";
import { RoleSelect, MERCHANT_ROLES } from "./role-select";

const inputClass =
  "h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface UserRowActionsProps {
  id: string;
  email: string;
  role: string;
  merchantId: string | null;
  status: "ACTIVE" | "DISABLED";
  /** The row matching the signed-in user's own account — mutations blocked,
   * server-side too (see users.controller.ts's self-modification guards). */
  isSelf: boolean;
}

export function UserRowActions({ id, email, role, merchantId, status, isSelf }: UserRowActionsProps) {
  const updateRole = useUpdateUserRole(id);
  const updateStatus = useUpdateUserStatus(id);
  const resetPassword = useResetUserPassword(id);

  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [nextRole, setNextRole] = React.useState(role);
  const [nextMerchantId, setNextMerchantId] = React.useState(merchantId ?? "");
  const [newPassword, setNewPassword] = React.useState("");

  const isMerchantRole = MERCHANT_ROLES.includes(nextRole);
  const nextStatus = status === "ACTIVE" ? "DISABLED" : "ACTIVE";

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">You</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setNextRole(role);
          setNextMerchantId(merchantId ?? "");
          setRoleDialogOpen(true);
        }}
      >
        Change role
      </Button>
      <Button
        type="button"
        variant={status === "ACTIVE" ? "danger" : "outline"}
        size="sm"
        onClick={() => setStatusDialogOpen(true)}
      >
        {status === "ACTIVE" ? "Disable" : "Enable"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setNewPassword("");
          setPasswordDialogOpen(true);
        }}
      >
        Reset password
      </Button>

      <ConfirmDangerousActionDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        title={`Change role for ${email}`}
        confirmLabel="Save"
        description={
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Role
              <RoleSelect value={nextRole} onChange={setNextRole} />
            </label>
            {isMerchantRole ? (
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                Merchant ID
                <input
                  type="text"
                  required
                  value={nextMerchantId}
                  onChange={(e) => setNextMerchantId(e.target.value)}
                  placeholder="UUID"
                  className={inputClass}
                />
              </label>
            ) : null}
          </div>
        }
        onConfirm={async () => {
          await updateRole.mutateAsync({
            role: nextRole,
            merchantId: isMerchantRole ? nextMerchantId : undefined,
          });
        }}
      />

      <ConfirmDangerousActionDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title={`${status === "ACTIVE" ? "Disable" : "Enable"} ${email}`}
        confirmLabel={status === "ACTIVE" ? "Disable" : "Enable"}
        description={
          status === "ACTIVE"
            ? "Immediately blocks this account from logging in or refreshing its session."
            : "Restores this account's ability to log in."
        }
        onConfirm={async () => {
          await updateStatus.mutateAsync(nextStatus);
        }}
      />

      <ConfirmDangerousActionDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        title={`Reset password for ${email}`}
        confirmLabel="Reset"
        description={
          <div className="flex flex-col gap-2 pt-2">
            <p>
              Sets a new password immediately and clears any login lockout. Share it with{" "}
              {email} through a secure channel — this does not notify them.
            </p>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              New password
              <input
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </label>
          </div>
        }
        onConfirm={async () => {
          await resetPassword.mutateAsync(newPassword);
        }}
      />
    </div>
  );
}
