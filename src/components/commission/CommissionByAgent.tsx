"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CommissionData } from "@/hooks/useCommission";

export function CommissionByAgent({ data }: { data: CommissionData["commissionByAgent"] }) {
  const t = useTranslations("commission.byAgent");
  const sorted = [...data].sort((a, b) => b.total - a.total).map((d) => ({ ...d, name: d.name.split(" ")[0] }));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width="auto" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value, name) => [`AED ${Number(value).toLocaleString()}`, name]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="paid" name={t("paid")} stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name={t("pending")} stackId="a" fill="var(--warning)" />
              <Bar dataKey="overdue" name={t("overdue")} stackId="a" fill="var(--danger)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
