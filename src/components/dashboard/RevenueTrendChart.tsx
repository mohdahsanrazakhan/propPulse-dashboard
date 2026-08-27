"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/useDashboard";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-AE", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 tabular-nums">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">AED {formatCompact(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: DashboardData["revenueTrend"] }) {
  const t = useTranslations("dashboard.revenueTrend");

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="rentalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="offPlanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={formatCompact}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width="auto"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sale" name={t("sales")} stackId="1" stroke="#3B82F6" fill="url(#saleGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="rental" name={t("rentals")} stackId="1" stroke="#10B981" fill="url(#rentalGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="offPlan" name={t("offPlan")} stackId="1" stroke="#8B5CF6" fill="url(#offPlanGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
