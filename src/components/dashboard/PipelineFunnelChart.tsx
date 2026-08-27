"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFunnelStageLabel } from "@/lib/labels";
import type { DashboardData } from "@/hooks/useDashboard";

export function PipelineFunnelChart({ data }: { data: DashboardData["pipelineFunnel"] }) {
  const t = useTranslations("dashboard.pipelineFunnel");
  const funnelStageLabel = useFunnelStageLabel();
  const max = data[0]?.count || 1;

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {data.map((stage) => (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-foreground">{funnelStageLabel(stage.stage)}</span>
              <span className="tabular-nums text-muted-foreground">
                {stage.count.toLocaleString()}
                {stage.dropOffPercent > 0 && (
                  <span className="ms-1.5 text-danger">-{stage.dropOffPercent.toFixed(0)}%</span>
                )}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(3, (stage.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
