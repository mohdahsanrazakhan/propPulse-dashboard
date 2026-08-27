"use client";

import { useEffect, useState } from "react";

export interface CommissionData {
  summary: {
    totalCommissionYtd: number;
    thisMonthCommission: number;
    annualTarget: number;
    pendingCollection: number;
    overdueAmount: number;
  };
  commissionByAgent: { agentId: string; name: string; paid: number; pending: number; overdue: number; total: number }[];
  timeline: { key: string; month: string; sale: number; rental: number; offPlan: number; total: number }[];
  pendingPayments: {
    _id: string;
    dealId: string;
    community: string;
    propertyType: string;
    clientName: string;
    agentName: string;
    commission: number;
    invoiceNumber: string | null;
    status: string;
    dueDate: string | null;
    daysOverdue: number;
  }[];
}

export function useCommission() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commission")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load commission data");
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
