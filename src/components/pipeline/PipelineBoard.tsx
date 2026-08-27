"use client";

import { useTranslations } from "next-intl";
import { DEAL_STAGES } from "@/lib/constants";
import { useDealStageLabel } from "@/lib/labels";
import { DealCard } from "./DealCard";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import type { PipelineDeal } from "@/hooks/usePipeline";

export function PipelineBoard({ deals, onSelect }: { deals: PipelineDeal[]; onSelect: (deal: PipelineDeal) => void }) {
  const t = useTranslations("pipeline");
  const dealStageLabel = useDealStageLabel();

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {DEAL_STAGES.filter((s) => s !== "fallen_through").map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const totalValue = stageDeals.reduce((s, d) => s + d.transactionValue, 0);
        return (
          <div key={stage} className="flex w-64 shrink-0 flex-col rounded-lg bg-muted/40">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{dealStageLabel(stage)}</p>
              <p className="text-xs text-muted-foreground">
                {t("dealsCount", { count: stageDeals.length })} &middot; <CurrencyDisplay value={totalValue} compact />
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {stageDeals.map((deal) => (
                <DealCard key={deal._id} deal={deal} onClick={() => onSelect(deal)} />
              ))}
              {stageDeals.length === 0 && (
                <p className="px-1 py-3 text-center text-xs text-muted-foreground">{t("noDeals")}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
