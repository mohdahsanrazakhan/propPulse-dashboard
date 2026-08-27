"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLossReasonLabel } from "@/lib/labels";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

export function LeadLossAnalysis({ data }: { data: LeadAnalyticsData["lossReasons"] }) {
  const t = useTranslations("leads.lossAnalysis");
  const lossReasonLabel = useLossReasonLabel();
  const sorted = [...data]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ ...d, label: lossReasonLabel(d.reason) }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width="auto" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [t("leadsSuffix", { count: Number(value) }), t("count")]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--danger)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
