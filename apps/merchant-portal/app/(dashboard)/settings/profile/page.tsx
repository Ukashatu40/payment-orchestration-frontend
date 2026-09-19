"use client";

import { Monitor } from "lucide-react";
import { useMe, useSessions, useRevokeSession } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";

export default function ProfileSettingsPage() {
  const { data: me } = useMe();
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Account settings</h1>
        <p className="text-sm text-muted-foreground">Your profile and active sign-ins.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{me?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Last sign-in</dt>
            <dd>{me?.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString() : "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sign-ins</CardTitle>
        </CardHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !sessions?.length ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="size-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{session.userAgent ?? "Unknown device"}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.ip ?? "Unknown IP"} · signed in{" "}
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(session.id)}
                >
                  Sign out
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
