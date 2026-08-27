"use client";

import { useEffect, useState } from "react";

export interface PipelineDeal {
  _id: string;
  dealId: string;
  type: string;
  property: {
    type: string;
    community: string;
    building: string;
    unitNumber: string;
    bedrooms: number;
    sqft: number;
    developer: string | null;
  };
  transactionValue: number;
  commission: {
    rate: number;
    grossAmount: number;
    vatAmount: number;
    agentSplit: number;
    agentAmount: number;
    agencyAmount: number;
    status: string;
    paidDate: string | null;
    invoiceNumber: string | null;
  };
  agent: { _id: string; name: string; photo: string; agentId: string } | null;
  clientName: string;
  clientNationality: string;
  clientType: string;
  stage: string;
  daysInStage: number;
  listingDate: string | null;
  viewingDate: string | null;
  offerDate: string | null;
  agreedDate: string | null;
  completionDate: string | null;
  daysToClose: number | null;
  isCobroker: boolean;
  cobrokerAgency: string | null;
  cobrokerSplit: number | null;
  notes: string;
  createdAt: string;
}

export interface PipelineSummary {
  totalPipelineValue: number;
  expectedCommission: number;
  avgDealAge: number;
  dealsAtRisk: number;
  winRate: number;
}

export function usePipeline() {
  const [deals, setDeals] = useState<PipelineDeal[] | null>(null);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pipeline")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load pipeline");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setDeals(json.deals);
          setSummary(json.summary);
        }
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

  return { deals, summary, loading, error };
}
