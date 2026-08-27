"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CommunitiesData } from "@/hooks/useCommunities";

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

export function PricePerSqftChart({ data }: { data: CommunitiesData["priceTrends"] }) {
  const t = useTranslations("communities.priceTrend");
  const [selected, setSelected] = useState<string[]>(data.slice(0, 3).map((d) => d.community));

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data[0].series.map((point, i) => {
      const row: Record<string, number | string | null> = { month: point.month };
      for (const community of selected) {
        const series = data.find((d) => d.community === community);
        row[community] = series?.series[i]?.value ?? null;
      }
      return row;
    });
  }, [data, selected]);

  function toggle(community: string) {
    setSelected((prev) =>
      prev.includes(community) ? prev.filter((c) => c !== community) : prev.length < 5 ? [...prev, community] : prev
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {data.map((d) => (
            <Badge
              key={d.community}
              onClick={() => toggle(d.community)}
              variant={selected.includes(d.community) ? "default" : "outline"}
              className="cursor-pointer"
            >
              {d.community}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width="auto" />
              <Tooltip
                formatter={(value) => (value == null ? "N/A" : t("tooltipSuffix", { value: Number(value).toLocaleString() }))}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {selected.map((community, i) => (
                <Line
                  key={community}
                  type="monotone"
                  dataKey={community}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
