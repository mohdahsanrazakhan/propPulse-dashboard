"use client";

import { useEffect, useState } from "react";

export interface CommunitiesData {
  table: {
    community: string;
    totalDeals: number;
    avgSalePrice: number;
    avgRent: number;
    activeListings: number;
    avgDaysToClose: number;
    topAgent: string;
    trend: number;
    avgCommission: number;
    saleCount: number;
    rentalCount: number;
    offPlanCount: number;
  }[];
  heatmap: { community: string; deals: number; avgCommission: number }[];
  priceTrends: { community: string; series: { key: string; month: string; value: number | null }[] }[];
  dealTypeByCommunity: { community: string; sale: number; rental: number; offPlan: number }[];
}

export function useCommunities() {
  const [data, setData] = useState<CommunitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/communities")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load community data");
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
