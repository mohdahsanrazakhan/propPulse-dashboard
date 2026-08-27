import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { DealTypeBadge } from "@/components/shared/DealTypeBadge";
import { DEAL_STAGES } from "@/lib/constants";
import { useDealStageLabel, useCommissionStatusLabel } from "@/lib/labels";
import { CheckCircle2, Circle } from "lucide-react";
import type { PipelineDeal } from "@/hooks/usePipeline";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function DealDetailModal({ deal, onClose }: { deal: PipelineDeal | null; onClose: () => void }) {
  const t = useTranslations("pipeline.detail");
  const tRoot = useTranslations("pipeline");
  const dealStageLabel = useDealStageLabel();
  const commissionStatusLabel = useCommissionStatusLabel();
  const stages: string[] = DEAL_STAGES.filter((s) => s !== "fallen_through");
  const currentIdx = deal ? stages.indexOf(deal.stage) : -1;

  return (
    <Dialog open={!!deal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
        {deal && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {deal.dealId}
                <DealTypeBadge type={deal.type} />
              </DialogTitle>
            </DialogHeader>

            <div className="min-w-0 space-y-5">
              {/* Stage timeline */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {stages.map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    {i <= currentIdx ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={`text-xs whitespace-nowrap ${i <= currentIdx ? "text-foreground" : "text-muted-foreground"}`}>
                      {dealStageLabel(s)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("propertySection")}</h4>
                  <Row label={t("type")} value={<span className="capitalize">{deal.property.type}</span>} />
                  <Row label={t("community")} value={deal.property.community} />
                  <Row label={t("building")} value={deal.property.building} />
                  <Row label={t("unit")} value={deal.property.unitNumber} />
                  <Row label={t("bedrooms")} value={deal.property.bedrooms} />
                  <Row label={t("sqft")} value={deal.property.sqft.toLocaleString()} />
                  {deal.property.developer && <Row label={t("developer")} value={deal.property.developer} />}
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("clientAgentSection")}</h4>
                  <Row label={t("client")} value={deal.clientName} />
                  <Row label={t("nationality")} value={deal.clientNationality} />
                  <Row label={t("type")} value={<span className="capitalize">{deal.clientType}</span>} />
                  <Row label={t("agent")} value={deal.agent?.name ?? tRoot("unassigned")} />
                  {deal.isCobroker && <Row label={t("cobroker")} value={`${deal.cobrokerAgency} (${deal.cobrokerSplit}%)`} />}
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("financialSection")}</h4>
                <Row label={t("transactionValue")} value={<CurrencyDisplay value={deal.transactionValue} />} />
                <Row label={t("commissionRate")} value={`${deal.commission.rate}%`} />
                <Row label={t("grossCommission")} value={<CurrencyDisplay value={deal.commission.grossAmount} />} />
                <Row label={t("vat")} value={<CurrencyDisplay value={deal.commission.vatAmount} />} />
                <Row label={t("agentSplit")} value={`${deal.commission.agentSplit}%`} />
                <Row label={t("agentEarns")} value={<CurrencyDisplay value={deal.commission.agentAmount} bold />} />
                <Row label={t("agencyKeeps")} value={<CurrencyDisplay value={deal.commission.agencyAmount} />} />
                <Row label={t("status")} value={<Badge variant="outline">{commissionStatusLabel(deal.commission.status)}</Badge>} />
              </div>

              <Row label={t("daysInCurrentStage")} value={t("daysSuffix", { count: deal.daysInStage })} />

              {deal.notes && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("notesSection")}</h4>
                  <p className="text-sm text-foreground">{deal.notes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
