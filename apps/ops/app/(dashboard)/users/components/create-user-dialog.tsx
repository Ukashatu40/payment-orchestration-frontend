"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { useCreateUser } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";
import { RoleSelect, MERCHANT_ROLES } from "./role-select";

const inputClass =
  "h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateUserDialog() {
  const createUser = useCreateUser();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("OPS_VIEWER");
  const [merchantId, setMerchantId] = React.useState("");
  const [idempotencyKey, setIdempotencyKey] = React.useState("");

  const isMerchantRole = MERCHANT_ROLES.includes(role);

  function openDialog() {
    setEmail("");
    setPassword("");
    setRole("OPS_VIEWER");
    setMerchantId("");
    setIdempotencyKey(crypto.randomUUID());
    setOpen(true);
  }

  return (
    <>
      <Button type="button" variant="primary" className="gap-2" onClick={openDialog}>
        <UserPlus className="size-4" />
        Add user
      </Button>

      <ConfirmDangerousActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Create user"
        confirmLabel="Create"
        description={
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Temporary password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <span className="font-normal text-muted-foreground">At least 8 characters.</span>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
              Role
              <RoleSelect value={role} onChange={setRole} />
            </label>
            {isMerchantRole ? (
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                Merchant ID
                <input
                  type="text"
                  required
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="UUID"
                  className={inputClass}
                />
              </label>
            ) : null}
          </div>
        }
        onConfirm={async () => {
          await createUser.mutateAsync({
            email,
            password,
            role,
            merchantId: isMerchantRole ? merchantId : undefined,
            idempotencyKey,
          });
        }}
      />
    </>
  );
}
