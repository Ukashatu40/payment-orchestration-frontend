"use client";

import * as React from "react";
import { useReplayWebhook } from "@payflow/api-client";
import { Button } from "@payflow/ui/button";
import { ConfirmDangerousActionDialog } from "@payflow/ui/confirm-dangerous-action-dialog";

export function ReplayAction({ id, eventId }: { id: string; eventId: string }) {
  const replay = useReplayWebhook();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Replay
      </Button>
      <ConfirmDangerousActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Replay webhook"
        confirmLabel="Replay"
        description={`Re-queues event ${eventId} for processing. Its signature is re-verified before it runs.`}
        onConfirm={async () => {
          await replay.mutateAsync(id);
        }}
      />
    </>
  );
}
