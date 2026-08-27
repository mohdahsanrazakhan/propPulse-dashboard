"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CommunitiesData } from "@/hooks/useCommunities";

export function CommunityTrendChart({ data }: { data: CommunitiesData["dealTypeByCommunity"] }) {
  const t = useTranslations("communities.dealTypeByCommunity");

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="community"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sale" name={t("sale")} stackId="a" fill="#3B82F6" />
              <Bar dataKey="rental" name={t("rental")} stackId="a" fill="#10B981" />
              <Bar dataKey="offPlan" name={t("offPlan")} stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
