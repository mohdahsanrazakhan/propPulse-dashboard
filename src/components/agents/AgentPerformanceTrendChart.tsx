"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AgentPerformanceTrendChart({
  data,
}: {
  data: { month: string; agentDeals: number; agencyAverage: number }[];
}) {
  const t = useTranslations("agents.trend");

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="agentDeals" name={t("thisAgent")} stroke="var(--accent)" strokeWidth={2.5} dot={false} />
              <Line
                type="monotone"
                dataKey="agencyAverage"
                name={t("agencyAverage")}
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
