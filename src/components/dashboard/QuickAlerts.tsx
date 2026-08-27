"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/hooks/useDashboard";

const DOT_COLOR: Record<string, string> = {
  critical: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-secondary",
};

export function QuickAlerts({ alerts }: { alerts: DashboardData["alerts"] }) {
  const t = useTranslations("dashboard.quickAlerts");

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {alerts.length === 0 && (
          <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        )}
        {alerts.map((alert, i) => (
          <Link
            key={i}
            href={alert.href}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors hover:bg-muted/60"
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT_COLOR[alert.severity])} />
            <span className="text-foreground">{alert.message}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
