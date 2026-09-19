"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVolumeAnalytics } from "@payflow/api-client";
import { chartChrome, categoricalSeries } from "@payflow/ui/chart-colors";
import { Card, CardHeader, CardTitle } from "@payflow/ui/card";

interface TooltipPayloadItem {
  payload: { date: string; count: number; totalPaise: string };
}

function VolumeTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{point.count} transactions</p>
      <p className="text-muted-foreground">{point.date}</p>
    </div>
  );
}

export function VolumeChart() {
  const { data, isLoading } = useVolumeAnalytics();
  const chrome = chartChrome.light;
  const seriesColor = categoricalSeries.light[0];

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your transaction volume (24h)</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={seriesColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chrome.gridline} strokeWidth={1} />
            <XAxis
              dataKey="date"
              tick={{ fill: chrome.inkMuted, fontSize: 12 }}
              axisLine={{ stroke: chrome.baseline }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: chrome.inkMuted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip cursor={{ stroke: chrome.baseline }} content={<VolumeTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={seriesColor}
              strokeWidth={2}
              fill="url(#volume-fill)"
              dot={false}
              activeDot={{ r: 4, fill: seriesColor, stroke: chrome.surface, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
