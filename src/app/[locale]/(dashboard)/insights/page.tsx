"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsightCard, type InsightItem } from "@/components/insights/InsightCard";
import { GenerateInsightsButton } from "@/components/insights/GenerateInsightsButton";

export default function InsightsPage() {
  const t = useTranslations("insights");
  const [insights, setInsights] = useState<InsightItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights")
      .then((res) => {
        if (!res.ok) throw new Error(t("loadError"));
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setInsights(json.insights);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !insights) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <GenerateInsightsButton onGenerated={(newOnes) => setInsights((prev) => [...newOnes, ...(prev ?? [])])} />
      </div>

      {insights.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard key={insight._id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
