"use client";

import { useTranslations } from "next-intl";
import { DollarSign, Handshake, Layers, TrendingUp, Clock } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { MetricCard } from "@/components/shared/MetricCard";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { DealTypeBreakdown } from "@/components/dashboard/DealTypeBreakdown";
import { TopAgentsLeaderboard } from "@/components/dashboard/TopAgentsLeaderboard";
import { LeadSourceROIChart } from "@/components/dashboard/LeadSourceROIChart";
import { PipelineFunnelChart } from "@/components/dashboard/PipelineFunnelChart";
import { QuickAlerts } from "@/components/dashboard/QuickAlerts";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, loading, error } = useDashboard();

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label={t("kpi.totalRevenue")}
          value={<CurrencyDisplay value={kpis.totalRevenue.value} compact />}
          trend={kpis.totalRevenue.change}
          icon={DollarSign}
        />
        <MetricCard
          label={t("kpi.dealsClosed")}
          value={kpis.dealsClosed.value}
          trend={kpis.dealsClosed.change}
          icon={Handshake}
        />
        <MetricCard
          label={t("kpi.activePipelineValue")}
          value={<CurrencyDisplay value={kpis.activePipelineValue.value} compact />}
          icon={Layers}
        />
        <MetricCard
          label={t("kpi.leadConversionRate")}
          value={`${kpis.leadConversionRate.value.toFixed(1)}%`}
          trend={kpis.leadConversionRate.change}
          icon={TrendingUp}
        />
        <MetricCard
          label={t("kpi.avgDaysToClose")}
          value={kpis.avgDaysToClose.value}
          trend={kpis.avgDaysToClose.change}
          invertTrendColor
          icon={Clock}
        />
      </div>

      {/* Row 2: Revenue trend + deal type mix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={data.revenueTrend} />
        </div>
        <DealTypeBreakdown data={data.dealTypeMix} />
      </div>

      {/* Row 3: Agent leaderboard + lead source ROI */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopAgentsLeaderboard agents={data.topAgents} />
        <LeadSourceROIChart data={data.leadSourceROI} />
      </div>

      {/* Row 4: Pipeline funnel + quick alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PipelineFunnelChart data={data.pipelineFunnel} />
        <QuickAlerts alerts={data.alerts} />
      </div>
    </div>
  );
}
