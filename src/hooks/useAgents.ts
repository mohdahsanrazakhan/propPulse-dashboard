"use client";

import { useEffect, useState } from "react";

export interface AgentPerformance {
  _id: string;
  agentId: string;
  name: string;
  photo: string;
  specialization: string;
  nationality: string;
  languages: string[];
  communities: string[];
  isActive: boolean;
  targets: { monthlyDeals: number; monthlyRevenue: number; leadResponseMinutes: number };
  dealsMonth: number;
  targetProgress: number;
  commissionMonth: number;
  commissionYtd: number;
  leadsAssigned: number;
  conversionRate: number;
  avgResponseTime: number;
  avgDaysToClose: number;
  rating: number;
  totalDeals: number;
}

export function useAgents() {
  const [agents, setAgents] = useState<AgentPerformance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agents")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load agents");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setAgents(json.agents);
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

  return { agents, loading, error };
}
