"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { cn } from "@/lib/utils";
import type { AgentPerformance } from "@/hooks/useAgents";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function responseTimeColor(minutes: number) {
  if (minutes < 15) return "text-success";
  if (minutes <= 30) return "text-warning";
  return "text-danger";
}

export function AgentPerformanceTable({ agents }: { agents: AgentPerformance[] }) {
  const t = useTranslations("agents.table");
  const tSpec = useTranslations("agents.specializations");

  const columns: DataTableColumn<AgentPerformance>[] = [
    {
      key: "agent",
      header: t("agent"),
      sortValue: (a) => a.name,
      render: (a) => (
        <Link href={`/agents/${a._id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-accent/15 text-xs font-semibold text-accent">
              {initials(a.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
            <Badge variant="outline" className="mt-0.5 text-[10px]">
              {tSpec.has(a.specialization) ? tSpec(a.specialization) : a.specialization}
            </Badge>
          </div>
        </Link>
      ),
    },
    {
      key: "deals",
      header: t("dealsMonth"),
      sortValue: (a) => a.dealsMonth,
      render: (a) => (
        <span className="tabular-nums">
          {a.dealsMonth} <span className="text-muted-foreground">({a.targets.monthlyDeals})</span>
        </span>
      ),
    },
    {
      key: "targetProgress",
      header: t("targetProgress"),
      sortValue: (a) => a.targetProgress,
      render: (a) => (
        <div className="flex items-center gap-2">
          <Progress value={Math.min(100, a.targetProgress)} className="h-1.5 w-20" />
          <span className="text-xs tabular-nums text-muted-foreground">{a.targetProgress.toFixed(0)}%</span>
        </div>
      ),
    },
    {
      key: "commissionMonth",
      header: t("commissionMonth"),
      sortValue: (a) => a.commissionMonth,
      render: (a) => <CurrencyDisplay value={a.commissionMonth} compact />,
    },
    {
      key: "commissionYtd",
      header: t("commissionYtd"),
      sortValue: (a) => a.commissionYtd,
      render: (a) => <CurrencyDisplay value={a.commissionYtd} compact bold />,
    },
    {
      key: "leadsAssigned",
      header: t("leadsAssigned"),
      sortValue: (a) => a.leadsAssigned,
      render: (a) => <span className="tabular-nums">{a.leadsAssigned}</span>,
    },
    {
      key: "conversionRate",
      header: t("conversion"),
      sortValue: (a) => a.conversionRate,
      render: (a) => <span className="tabular-nums">{a.conversionRate.toFixed(1)}%</span>,
    },
    {
      key: "avgResponseTime",
      header: t("avgResponse"),
      sortValue: (a) => a.avgResponseTime,
      render: (a) => (
        <span className={cn("tabular-nums font-medium", responseTimeColor(a.avgResponseTime))}>
          {a.avgResponseTime}min
        </span>
      ),
    },
    {
      key: "avgDaysToClose",
      header: t("avgDaysToClose"),
      sortValue: (a) => a.avgDaysToClose,
      render: (a) => <span className="tabular-nums">{a.avgDaysToClose}d</span>,
    },
    {
      key: "rating",
      header: t("rating"),
      sortValue: (a) => a.rating,
      render: (a) => (
        <span className="flex items-center gap-1 tabular-nums">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {a.rating.toFixed(1)}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={agents} rowKey={(a) => a._id} />;
}
