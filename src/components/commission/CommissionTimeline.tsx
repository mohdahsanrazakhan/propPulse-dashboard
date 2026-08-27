"use client";

import { useTranslations } from "next-intl";
import { Bar, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CommissionData } from "@/hooks/useCommission";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-AE", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function CommissionTimeline({ data }: { data: CommissionData["timeline"] }) {
  const t = useTranslations("commission.timeline");

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip
                formatter={(value, name) => [`AED ${formatCompact(Number(value))}`, name]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="sale" name={t("sales")} stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rental" name={t("rentals")} stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="offPlan" name={t("offPlan")} stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="total" name={t("total")} stroke="var(--foreground)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
