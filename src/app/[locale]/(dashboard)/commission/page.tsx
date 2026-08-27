"use client";

import { useTranslations } from "next-intl";
import { useCommission } from "@/hooks/useCommission";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommissionSummary } from "@/components/commission/CommissionSummary";
import { CommissionByAgent } from "@/components/commission/CommissionByAgent";
import { CommissionCalculator } from "@/components/commission/CommissionCalculator";
import { CommissionTimeline } from "@/components/commission/CommissionTimeline";
import { PendingPayments } from "@/components/commission/PendingPayments";

export default function CommissionPage() {
  const t = useTranslations("commission");
  const { data, loading, error } = useCommission();

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
      <CommissionSummary summary={data.summary} />
      <CommissionByAgent data={data.commissionByAgent} />
      <CommissionCalculator />
      <CommissionTimeline data={data.timeline} />
      <PendingPayments data={data.pendingPayments} />
    </div>
  );
}
