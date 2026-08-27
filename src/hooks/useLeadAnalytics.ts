"use client";

import { useEffect, useState } from "react";

export interface LeadAnalyticsData {
  sourceOverview: { source: string; label: string; count: number }[];
  sourceStats: {
    source: string;
    label: string;
    leads: number;
    deals: number;
    conversionRate: number;
    avgDealValue: number;
    commissionEarned: number;
    estMonthlyCost: number;
    roi: number | null;
  }[];
  responseTimeImpact: { label: string; leads: number; conversionRate: number }[];
  leadTrend: Record<string, number | string>[];
  lossReasons: { reason: string; label: string; count: number }[];
  sourceKeys: { key: string; label: string }[];
}

export function useLeadAnalytics() {
  const [data, setData] = useState<LeadAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load lead analytics");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
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
  }, []);

  return { data, loading, error };
}
