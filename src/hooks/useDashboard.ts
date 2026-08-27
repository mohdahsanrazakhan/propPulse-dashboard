"use client";

import { useEffect, useState } from "react";

export interface DashboardData {
  kpis: {
    totalRevenue: { value: number; change: number };
    dealsClosed: { value: number; change: number };
    activePipelineValue: { value: number };
    leadConversionRate: { value: number; change: number };
    avgDaysToClose: { value: number; change: number };
  };
  revenueTrend: { key: string; month: string; sale: number; rental: number; offPlan: number; total: number }[];
  dealTypeMix: { type: string; count: number; percent: number }[];
  topAgents: {
    agentId: string;
    _id: string;
    name: string;
    photo: string;
    specialization: string;
    dealsCount: number;
    commissionEarned: number;
    conversionRate: number;
  }[];
  leadSourceROI: {
    source: string;
    label: string;
    leads: number;
    deals: number;
    conversionRate: number;
    commissionEarned: number;
    estMonthlyCost: number;
    roi: number;
  }[];
  pipelineFunnel: { stage: string; count: number; dropOffPercent: number }[];
  alerts: { severity: "critical" | "warning" | "success" | "info"; message: string; href: string }[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
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
