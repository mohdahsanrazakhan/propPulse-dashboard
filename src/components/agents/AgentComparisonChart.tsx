"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentPerformance } from "@/hooks/useAgents";

const METRIC_KEYS = {
  deals: { labelKey: "dealsClosed", key: "totalDeals" as const, format: (v: number) => `${v}` },
  commission: { labelKey: "commissionEarned", key: "commissionYtd" as const, format: (v: number) => `AED ${Math.round(v / 1000)}K` },
  conversion: { labelKey: "conversionRate", key: "conversionRate" as const, format: (v: number) => `${v.toFixed(0)}%` },
  response: { labelKey: "avgResponseTime", key: "avgResponseTime" as const, format: (v: number) => `${v}min` },
};

export function AgentComparisonChart({ agents }: { agents: AgentPerformance[] }) {
  const t = useTranslations("agents.comparison");
  const [metric, setMetric] = useState<keyof typeof METRIC_KEYS>("deals");
  const config = METRIC_KEYS[metric];
  const label = t(config.labelKey as "dealsClosed" | "commissionEarned" | "conversionRate" | "avgResponseTime");

  const chartData = [...agents]
    .sort((a, b) => (b[config.key] as number) - (a[config.key] as number))
    .map((a) => ({
      name: a.name.split(" ")[0],
      value: a[config.key] as number,
    }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as keyof typeof METRIC_KEYS)}
          className="w-full min-w-0 sm:w-auto"
        >
          <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="w-max min-w-full sm:w-fit sm:min-w-0">
              {Object.entries(METRIC_KEYS).map(([key, m]) => (
                <TabsTrigger key={key} value={key} className="flex-none sm:flex-1">
                  {t(m.labelKey as "dealsClosed" | "commissionEarned" | "conversionRate" | "avgResponseTime")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip
                formatter={(value) => [config.format(Number(value)), label]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
