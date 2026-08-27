"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LayoutGrid, Table2 } from "lucide-react";
import { usePipeline, type PipelineDeal } from "@/hooks/usePipeline";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetricCard } from "@/components/shared/MetricCard";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { DealDetailModal } from "@/components/pipeline/DealDetailModal";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const t = useTranslations("pipeline");
  const tDealType = useTranslations("labels.dealType");
  const { deals, summary, loading, error } = usePipeline();
  const [view, setView] = useState<"board" | "table">("board");
  const [selected, setSelected] = useState<PipelineDeal | null>(null);
  const [dealType, setDealType] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [communityFilter, setCommunityFilter] = useState("all");

  const agents = useMemo(() => {
    if (!deals) return [];
    const map = new Map<string, string>();
    deals.forEach((d) => d.agent && map.set(d.agent._id, d.agent.name));
    return Array.from(map.entries());
  }, [deals]);

  const communities = useMemo(() => {
    if (!deals) return [];
    return Array.from(new Set(deals.map((d) => d.property.community))).sort();
  }, [deals]);

  const filtered = useMemo(() => {
    if (!deals) return [];
    return deals.filter((d) => {
      if (dealType !== "all" && d.type !== dealType) return false;
      if (agentFilter !== "all" && d.agent?._id !== agentFilter) return false;
      if (communityFilter !== "all" && d.property.community !== communityFilter) return false;
      return true;
    });
  }, [deals, dealType, agentFilter, communityFilter]);

  const activeDeals = filtered.filter((d) => d.stage !== "completed" && d.stage !== "fallen_through");

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !deals || !summary) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label={t("kpi.totalPipelineValue")} value={<CurrencyDisplay value={summary.totalPipelineValue} compact />} />
        <MetricCard label={t("kpi.expectedCommission")} value={<CurrencyDisplay value={summary.expectedCommission} compact />} />
        <MetricCard label={t("kpi.avgDealAge")} value={`${summary.avgDealAge}d`} />
        <MetricCard label={t("kpi.dealsAtRisk")} value={summary.dealsAtRisk} />
        <MetricCard label={t("kpi.winRate")} value={`${summary.winRate.toFixed(0)}%`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={dealType} onValueChange={(v) => setDealType(v ?? "all")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="sale">{tDealType("sale")}</SelectItem>
              <SelectItem value="rental">{tDealType("rental")}</SelectItem>
              <SelectItem value="off_plan">{tDealType("off_plan")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={agentFilter} onValueChange={(v) => setAgentFilter(v ?? "all")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allAgents")}</SelectItem>
              {agents.map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={communityFilter} onValueChange={(v) => setCommunityFilter(v ?? "all")}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCommunities")}</SelectItem>
              {communities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn(view === "board" && "bg-muted")}
            onClick={() => setView("board")}
          >
            <LayoutGrid className="h-4 w-4" /> {t("boardView")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(view === "table" && "bg-muted")}
            onClick={() => setView("table")}
          >
            <Table2 className="h-4 w-4" /> {t("tableView")}
          </Button>
        </div>
      </div>

      {view === "board" ? (
        <PipelineBoard deals={filtered} onSelect={setSelected} />
      ) : (
        <PipelineTable deals={activeDeals} onSelect={setSelected} />
      )}

      <DealDetailModal deal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
