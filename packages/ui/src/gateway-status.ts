export type GatewayStatusVariant = "success" | "warning" | "danger" | "neutral";

export interface GatewayStatus {
  label: string;
  variant: GatewayStatusVariant;
}

export function gatewayStatus(isEnabled: boolean, circuitState?: string): GatewayStatus {
  if (!isEnabled) return { label: "Disabled", variant: "neutral" };
  if (circuitState === "OPEN") return { label: "Circuit open", variant: "danger" };
  if (circuitState === "HALF_OPEN") return { label: "Recovering", variant: "warning" };
  return { label: "Healthy", variant: "success" };
}
