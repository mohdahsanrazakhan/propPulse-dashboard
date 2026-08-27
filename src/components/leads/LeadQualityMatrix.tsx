"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

export function LeadQualityMatrix({ data }: { data: LeadAnalyticsData["sourceStats"] }) {
  const t = useTranslations("leads.qualityMatrix");
  const chartData = data.map((d) => ({ ...d, z: Math.max(d.commissionEarned, 5000) }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="leads"
                name={t("leadsReceived")}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                label={{ value: t("leadsReceived"), position: "insideBottom", offset: -5, fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="number"
                dataKey="conversionRate"
                name={t("conversionPercent")}
                unit="%"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width="auto"
                label={{ value: t("conversionPercent"), angle: -90, position: "insideLeft", fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 900]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as (typeof chartData)[number];
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
                      <p className="mb-1 font-medium text-foreground">{p.label}</p>
                      <p className="text-muted-foreground">
                        {t("leadsAndConversion", { leads: p.leads, rate: p.conversionRate.toFixed(1) })}
                      </p>
                      <p className="text-muted-foreground">
                        {t("commissionSuffix", { amount: p.commissionEarned.toLocaleString() })}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={chartData} fill="var(--accent)" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
