"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DEAL_TYPE_COLORS } from "@/lib/constants";
import { useDealTypeLabel } from "@/lib/labels";
import type { DashboardData } from "@/hooks/useDashboard";

export function DealTypeBreakdown({ data }: { data: DashboardData["dealTypeMix"] }) {
  const t = useTranslations("dashboard.dealTypeMix");
  const dealTypeLabel = useDealTypeLabel();
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {data.map((d) => (
                    <Cell key={d.type} fill={DEAL_TYPE_COLORS[d.type]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [t("dealsSuffix", { count: Number(value) }), dealTypeLabel(String(name))]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">{t("totalDeals")}</span>
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          {data.map((d) => (
            <div key={d.type} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEAL_TYPE_COLORS[d.type] }} />
                {dealTypeLabel(d.type)}
              </span>
              <span className="tabular-nums font-medium text-foreground">{d.percent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
