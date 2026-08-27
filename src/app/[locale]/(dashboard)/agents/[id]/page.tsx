"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgentProfileCard } from "@/components/agents/AgentProfileCard";
import { AgentTargetProgress } from "@/components/agents/AgentTargetProgress";
import { AgentPerformanceTrendChart } from "@/components/agents/AgentPerformanceTrendChart";
import { AgentDealHistory } from "@/components/agents/AgentDealHistory";
import { AgentLeadConversion } from "@/components/agents/AgentLeadConversion";
import { AgentCommissionBreakdown } from "@/components/agents/AgentCommissionBreakdown";
import { AgentAssessment } from "@/components/agents/AgentAssessment";

interface AgentBundle {
  agent: {
    _id: string;
    name: string;
    reraId: string;
    specialization: string;
    languages: string[];
    communities: string[];
    joinDate: string;
    totalDeals: number;
    totalCommission: number;
  };
  targetVsActual: {
    dealsActual: number;
    dealsTarget: number;
    commissionActual: number;
    commissionTarget: number;
    responseActual: number;
    responseTarget: number;
  };
  trend: { month: string; agentDeals: number; agencyAverage: number }[];
  funnel: {
    agent: { contactedPct: number; qualifiedPct: number; viewingPct: number; wonPct: number };
    agency: { contactedPct: number; qualifiedPct: number; viewingPct: number; wonPct: number };
  };
  deals: {
    _id: string;
    dealId: string;
    type: string;
    property: { community: string };
    transactionValue: number;
    commission: { agentAmount: number };
    stage: string;
    completionDate: string | null;
    createdAt: string;
  }[];
  commissionBreakdown: {
    byType: { type: string; amount: number }[];
    timeline: { month: string; amount: number }[];
    paidAmount: number;
    pendingAmount: number;
  };
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("agents.detail");
  const { id } = use(params);
  const [data, setData] = useState<AgentBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/agents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(t("notFound"));
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
  }, [id, t]);

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("notFound")}</AlertDescription>
      </Alert>
    );
  }

  const rating = Math.min(5, Math.max(1, 3 + data.funnel.agent.wonPct / 20));

  return (
    <div className="space-y-6">
      <AgentProfileCard agent={data.agent} rating={rating} />
      <AgentTargetProgress targetVsActual={data.targetVsActual} />
      <AgentPerformanceTrendChart data={data.trend} />
      <AgentDealHistory deals={data.deals} />
      <AgentLeadConversion agent={data.funnel.agent} agency={data.funnel.agency} />
      <AgentCommissionBreakdown {...data.commissionBreakdown} />
      <AgentAssessment agentId={data.agent._id} />
    </div>
  );
}
