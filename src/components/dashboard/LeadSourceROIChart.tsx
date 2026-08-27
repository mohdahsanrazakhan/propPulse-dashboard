"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLeadSourceLabel } from "@/lib/labels";
import type { DashboardData } from "@/hooks/useDashboard";

function colorForConversion(rate: number) {
  if (rate >= 25) return "#8B5CF6";
  if (rate >= 15) return "#A78BFA";
  if (rate >= 8) return "#C4B5FD";
  return "#DDD6FE";
}

export function LeadSourceROIChart({ data }: { data: DashboardData["leadSourceROI"] }) {
  const t = useTranslations("dashboard.leadSourceRoi");
  const leadSourceLabel = useLeadSourceLabel();
  const sorted = [...data]
    .sort((a, b) => b.leads - a.leads)
    .map((d) => ({ ...d, label: leadSourceLabel(d.source) }));

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                width="auto"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "leads") return [value, t("leads")];
                  return [String(value), String(name)];
                }}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload as { deals: number; conversionRate: number } | undefined;
                  if (!p) return label;
                  return `${label}: ${t("tooltipDeals", { deals: p.deals, rate: p.conversionRate.toFixed(0) })}`;
                }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="leads" radius={[0, 6, 6, 0]}>
                {sorted.map((d) => (
                  <Cell key={d.source} fill={colorForConversion(d.conversionRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
