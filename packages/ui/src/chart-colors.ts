/**
 * Plain hex mirror of tokens/base.css's chart roles, for Recharts — SVG
 * presentation attributes need real color strings, not `var(--x)` (patchy
 * cross-browser support), so this is the one place chart colors are
 * hardcoded. Keep in sync with base.css and each app's globals.css by hand;
 * both trace back to the same dataviz-skill reference palette.
 *
 * Categorical order is fixed — never cycle or reassign a slot by rank
 * (see the dataviz skill's color-formula.md).
 */
export const categoricalSeries = {
  light: [
    "#2a78d6",
    "#eb6834",
    "#1baf7a",
    "#eda100",
    "#e87ba4",
    "#008300",
    "#4a3aa7",
    "#e34948",
  ],
  dark: [
    "#3987e5",
    "#d95926",
    "#199e70",
    "#c98500",
    "#d55181",
    "#008300",
    "#9085e9",
    "#e66767",
  ],
} as const;

export const statusColor = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

/**
 * Fixed gateway -> series-slot identity. Color follows the entity, never its
 * rank — a gateway keeps its slot whether or not the other 7 are present in
 * a given response, so a filtered/partial list never repaints survivors.
 */
export const GATEWAY_SERIES_INDEX: Record<string, number> = {
  RAZORPAY: 0,
  STRIPE: 1,
  PAYU: 2,
  UPI: 3,
  PAYSTACK: 4,
  FLUTTERWAVE: 5,
  INTERSWITCH: 6,
  OPAY: 7,
};

export function gatewaySeriesColor(gateway: string, mode: "light" | "dark"): string {
  const index = GATEWAY_SERIES_INDEX[gateway] ?? 0;
  return categoricalSeries[mode][index] ?? categoricalSeries[mode][0];
}

export const chartChrome = {
  light: {
    surface: "#fcfcfb",
    pagePlane: "#f9f9f7",
    inkPrimary: "#0b0b0b",
    inkSecondary: "#52514e",
    inkMuted: "#898781",
    gridline: "#e1e0d9",
    baseline: "#c3c2b7",
  },
  dark: {
    surface: "#1a1a19",
    pagePlane: "#0d0d0d",
    inkPrimary: "#ffffff",
    inkSecondary: "#c3c2b7",
    inkMuted: "#898781",
    gridline: "#2c2c2a",
    baseline: "#383835",
  },
} as const;
