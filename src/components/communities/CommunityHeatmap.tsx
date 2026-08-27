"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CommunitiesData } from "@/hooks/useCommunities";

export function CommunityHeatmap({ data }: { data: CommunitiesData["heatmap"] }) {
  const t = useTranslations("communities.heatmap");
  const maxDeals = Math.max(...data.map((d) => d.deals), 1);
  const maxCommission = Math.max(...data.map((d) => d.avgCommission), 1);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          {data
            .filter((d) => d.deals > 0)
            .sort((a, b) => b.deals - a.deals)
            .map((d) => {
              const size = 48 + (d.deals / maxDeals) * 90;
              const intensity = 0.15 + (d.avgCommission / maxCommission) * 0.75;
              return (
                <div
                  key={d.community}
                  className="flex flex-col items-center justify-center rounded-full text-center transition-transform hover:scale-105"
                  style={{
                    width: size,
                    height: size,
                    background: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--muted))`,
                  }}
                  title={t("tooltip", { community: d.community, deals: d.deals, commission: d.avgCommission.toLocaleString() })}
                >
                  <span className="px-1 text-[10px] font-semibold leading-tight text-white drop-shadow-sm">
                    {d.community.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="text-[9px] text-white/90">{d.deals}</span>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
