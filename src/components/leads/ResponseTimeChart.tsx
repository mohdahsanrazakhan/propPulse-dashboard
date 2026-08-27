"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap } from "lucide-react";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

export function ResponseTimeChart({ data }: { data: LeadAnalyticsData["responseTimeImpact"] }) {
  const t = useTranslations("leads.responseTime");

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)}%`, t("conversion")]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="conversionRate" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Alert>
          <Zap className="h-4 w-4 text-accent" />
          <AlertDescription>{t("tip")}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
