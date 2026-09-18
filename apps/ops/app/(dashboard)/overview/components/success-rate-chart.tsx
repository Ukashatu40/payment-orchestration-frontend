"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSuccessRateAnalytics } from "@payflow/api-client";
import { chartChrome, gatewaySeriesColor } from "@payflow/ui/chart-colors";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";

interface TooltipPayloadItem {
  payload: { gateway: string; successRate: number; total: number };
}

function SuccessRateTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{Math.round(point.successRate * 100)}%</p>
      <p className="text-muted-foreground">
        {point.gateway} · {point.total} transactions
      </p>
    </div>
  );
}

export function SuccessRateChart() {
  const { data, isLoading } = useSuccessRateAnalytics();
  const chrome = chartChrome.dark;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  const rows = (data ?? []).map((row) => ({
    ...row,
    successRatePct: Math.round(row.successRate * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Success rate by gateway (24h)</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={chrome.gridline} strokeWidth={1} />
            <XAxis
              dataKey="gateway"
              tick={{ fill: chrome.inkMuted, fontSize: 12 }}
              axisLine={{ stroke: chrome.baseline }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 100]}
              tick={{ fill: chrome.inkMuted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: chrome.gridline, opacity: 0.5 }}
              content={<SuccessRateTooltip />}
            />
            <Bar dataKey="successRatePct" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {rows.map((row) => (
                <Cell key={row.gateway} fill={gatewaySeriesColor(row.gateway, "dark")} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
