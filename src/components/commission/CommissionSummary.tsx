import { useTranslations } from "next-intl";
import { MetricCard } from "@/components/shared/MetricCard";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import type { CommissionData } from "@/hooks/useCommission";

export function CommissionSummary({ summary }: { summary: CommissionData["summary"] }) {
  const t = useTranslations("commission.summary");
  const pctOfAnnualTarget = summary.annualTarget > 0 ? (summary.thisMonthCommission / (summary.annualTarget / 12)) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label={t("totalYtd")} value={<CurrencyDisplay value={summary.totalCommissionYtd} compact />} />
      <MetricCard
        label={t("thisMonth")}
        value={<CurrencyDisplay value={summary.thisMonthCommission} compact />}
        trend={pctOfAnnualTarget - 100}
      />
      <MetricCard label={t("pendingCollection")} value={<CurrencyDisplay value={summary.pendingCollection} compact />} />
      <MetricCard
        label={t("overdue")}
        value={<CurrencyDisplay value={summary.overdueAmount} compact className="text-danger" />}
      />
    </div>
  );
}
