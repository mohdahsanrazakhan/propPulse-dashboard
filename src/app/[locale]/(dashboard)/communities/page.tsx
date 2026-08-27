"use client";

import { useTranslations } from "next-intl";
import { useCommunities } from "@/hooks/useCommunities";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommunityTable } from "@/components/communities/CommunityTable";
import { CommunityHeatmap } from "@/components/communities/CommunityHeatmap";
import { PricePerSqftChart } from "@/components/communities/PricePerSqftChart";
import { CommunityTrendChart } from "@/components/communities/CommunityTrendChart";

export default function CommunitiesPage() {
  const t = useTranslations("communities");
  const { data, loading, error } = useCommunities();

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
      <CommunityTable data={data.table} />
      <CommunityHeatmap data={data.heatmap} />
      <PricePerSqftChart data={data.priceTrends} />
      <CommunityTrendChart data={data.dealTypeByCommunity} />
    </div>
  );
}
