"use client";

import { useTranslations } from "next-intl";
import { useLeadAnalytics } from "@/hooks/useLeadAnalytics";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LeadSourceChart } from "@/components/leads/LeadSourceChart";
import { LeadQualityMatrix } from "@/components/leads/LeadQualityMatrix";
import { PortalROIComparison } from "@/components/leads/PortalROIComparison";
import { ResponseTimeChart } from "@/components/leads/ResponseTimeChart";
import { LeadTrendChart } from "@/components/leads/LeadTrendChart";
import { LeadLossAnalysis } from "@/components/leads/LeadLossAnalysis";

export default function LeadsPage() {
  const t = useTranslations("leads");
  const { data, loading, error } = useLeadAnalytics();

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LeadSourceChart data={data.sourceOverview} />
        <div className="lg:col-span-2">
          <LeadQualityMatrix data={data.sourceStats} />
        </div>
      </div>

      <PortalROIComparison data={data.sourceStats} />

      <ResponseTimeChart data={data.responseTimeImpact} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadTrendChart data={data.leadTrend} sourceKeys={data.sourceKeys} />
        <LeadLossAnalysis data={data.lossReasons} />
      </div>
    </div>
  );
}
