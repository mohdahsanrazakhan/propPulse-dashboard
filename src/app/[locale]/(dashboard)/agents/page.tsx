"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAgents } from "@/hooks/useAgents";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentComparisonChart } from "@/components/agents/AgentComparisonChart";
import { AgentPerformanceTable } from "@/components/agents/AgentPerformanceTable";

const SPECIALIZATIONS = ["all", "sales", "rentals", "off-plan", "commercial", "mixed"];

export default function AgentsPage() {
  const t = useTranslations("agents");
  const { agents, loading, error } = useAgents();
  const [specialization, setSpecialization] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    if (!agents) return [];
    return agents.filter((a) => {
      if (specialization !== "all" && a.specialization !== specialization) return false;
      if (status === "active" && !a.isActive) return false;
      if (status === "inactive" && a.isActive) return false;
      return true;
    });
  }, [agents, specialization, status]);

  if (loading) return <LoadingSpinner label={t("loading")} />;
  if (error || !agents) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <AgentComparisonChart agents={agents} />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={specialization} onValueChange={(v) => setSpecialization(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("specializationPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "all" ? t("allSpecializations") : t(`specializations.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AgentPerformanceTable agents={filtered} />
    </div>
  );
}
