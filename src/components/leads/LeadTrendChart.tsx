"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLeadSourceLabel } from "@/lib/labels";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

const COLORS = ["#8B5CF6", "#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#D97706", "#9CA3B8"];

export function LeadTrendChart({ data, sourceKeys }: { data: LeadAnalyticsData["leadTrend"]; sourceKeys: LeadAnalyticsData["sourceKeys"] }) {
  const t = useTranslations("leads.trend");
  const leadSourceLabel = useLeadSourceLabel();

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              {sourceKeys.map((s, i) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={leadSourceLabel(s.key)}
                  stackId="1"
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
