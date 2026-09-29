"use client";

import * as React from "react";
import { Laptop, Smartphone, Terminal } from "lucide-react";
import { useMe, useSessions, useRevokeSession } from "@payflow/api-client";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";
import { Button } from "@payflow/ui/button";
import { parseSession, type DeviceKind } from "./parse-session";

const VISIBLE_COUNT = 5;

const DEVICE_ICON: Record<DeviceKind, typeof Laptop> = {
  desktop: Laptop,
  mobile: Smartphone,
  api: Terminal,
};

export default function ProfileSettingsPage() {
  const { data: me } = useMe();
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();
  const [showAll, setShowAll] = React.useState(false);

  const visible = showAll ? sessions : sessions?.slice(0, VISIBLE_COUNT);
  const hiddenCount = sessions ? sessions.length - VISIBLE_COUNT : 0;

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
          <>
            <ul className="flex flex-col gap-2">
              {visible!.map((session) => {
                const { label, kind } = parseSession(session.userAgent);
                const Icon = DEVICE_ICON[kind];
                return (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-medium">{label}</p>
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
                      className="shrink-0"
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(session.id)}
                    >
                      Sign out
                    </Button>
                  </li>
                );
              })}
            </ul>
            {!showAll && hiddenCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 self-start"
                onClick={() => setShowAll(true)}
              >
                Show {hiddenCount} more sign-in{hiddenCount === 1 ? "" : "s"}
              </Button>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
