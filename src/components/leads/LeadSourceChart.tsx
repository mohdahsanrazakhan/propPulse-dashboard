"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLeadSourceLabel } from "@/lib/labels";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

const COLORS = ["#8B5CF6", "#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#D97706", "#9CA3B8"];

export function LeadSourceChart({ data }: { data: LeadAnalyticsData["sourceOverview"] }) {
  const t = useTranslations("leads.sourceOverview");
  const leadSourceLabel = useLeadSourceLabel();
  const total = data.reduce((s, d) => s + d.count, 0);
  const localized = data.map((d) => ({ ...d, label: leadSourceLabel(d.source) }));

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("totalLeads", { count: total })}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={localized} dataKey="count" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {localized.map((d, i) => (
                  <Cell key={d.source} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [t("leadsSuffix", { count: Number(value) }), name]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {localized.map((d, i) => (
            <div key={d.source} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.label}
              </span>
              <span className="tabular-nums font-medium text-foreground">
                {total > 0 ? ((d.count / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
