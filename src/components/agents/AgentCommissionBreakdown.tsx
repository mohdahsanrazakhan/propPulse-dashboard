"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { DEAL_TYPE_COLORS } from "@/lib/constants";
import { useDealTypeLabel } from "@/lib/labels";

export function AgentCommissionBreakdown({
  byType,
  timeline,
  paidAmount,
  pendingAmount,
}: {
  byType: { type: string; amount: number }[];
  timeline: { month: string; amount: number }[];
  paidAmount: number;
  pendingAmount: number;
}) {
  const t = useTranslations("agents.commissionBreakdown");
  const dealTypeLabel = useDealTypeLabel();
  const total = paidAmount + pendingAmount;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">{t("byType")}</h3>
        </CardHeader>
        <CardContent>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byType} dataKey="amount" nameKey="type" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {byType.map((d) => (
                    <Cell key={d.type} fill={DEAL_TYPE_COLORS[d.type]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`AED ${Number(value).toLocaleString()}`, dealTypeLabel(String(name))]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">{t("monthlyCommission")}</h3>
        </CardHeader>
        <CardContent>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={timeline} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => [`AED ${Number(value).toLocaleString()}`, t("commission")]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("paid")}: <CurrencyDisplay value={paidAmount} compact className="font-medium text-success" /> (
              {total > 0 ? ((paidAmount / total) * 100).toFixed(0) : 0}%)
            </span>
            <span>
              {t("pending")}: <CurrencyDisplay value={pendingAmount} compact className="font-medium text-warning" /> (
              {total > 0 ? ((pendingAmount / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
