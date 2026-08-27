import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<string, { icon: typeof Info; color: string; labelKey: "opportunity" | "critical" | "warning" | "info" }> = {
  opportunity: { icon: TrendingUp, color: "text-success", labelKey: "opportunity" },
  critical: { icon: AlertCircle, color: "text-danger", labelKey: "critical" },
  warning: { icon: AlertTriangle, color: "text-warning", labelKey: "warning" },
  info: { icon: Info, color: "text-secondary", labelKey: "info" },
};

export interface InsightItem {
  _id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  metric: string;
  recommendation: string;
  isRead: boolean;
  createdAt: string;
}

export function InsightCard({ insight }: { insight: InsightItem }) {
  const t = useTranslations("insights");
  const tSeverity = useTranslations("insights.severity");
  const config = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="flex gap-3">
        <Icon className={cn("h-5 w-5 shrink-0", config.color)} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
            <Badge variant="outline" className={cn("text-[10px]", config.color)}>
              {tSeverity(config.labelKey)}
            </Badge>
            {insight.metric && (
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{insight.metric}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          {insight.recommendation && (
            <p className="text-sm text-foreground">
              <span className="font-medium text-accent">{t("recommendation")}</span>
              {insight.recommendation}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
