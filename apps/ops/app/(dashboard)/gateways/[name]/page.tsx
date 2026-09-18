"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMe } from "@payflow/api-client";
import { hasRole } from "@payflow/auth";
import { GatewaySummary } from "./components/gateway-summary";
import { CircuitBreakerTable } from "./components/circuit-breaker-table";
import { GatewayConfigAction } from "./components/gateway-config-action";

export default function GatewayDetailPage() {
  const params = useParams<{ name: string }>();
  const name = params.name;

  const { data: me } = useMe();
  const canAct = hasRole(me?.role, ["SUPER_ADMIN", "OPS_ADMIN"]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/gateways"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to gateways
      </Link>

      <GatewaySummary name={name} />
      <GatewayConfigAction name={name} canAct={canAct} />
      <CircuitBreakerTable name={name} />
    </div>
  );
}
