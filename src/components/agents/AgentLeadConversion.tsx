import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FunnelStats {
  contactedPct: number;
  qualifiedPct: number;
  viewingPct: number;
  wonPct: number;
}

function Row({
  label,
  agent,
  agency,
  agencyLabel,
}: {
  label: string;
  agent: number;
  agency: number;
  agencyLabel: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {agent.toFixed(0)}% <span className="text-muted-foreground/60">{agencyLabel}</span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 start-0 rounded-full bg-accent" style={{ width: `${Math.min(100, agent)}%` }} />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/50"
          style={{ insetInlineStart: `${Math.min(100, agency)}%` }}
        />
      </div>
    </div>
  );
}

export function AgentLeadConversion({ agent, agency }: { agent: FunnelStats; agency: FunnelStats }) {
  const t = useTranslations("agents.leadConversion");

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          label={t("contacted")}
          agent={agent.contactedPct}
          agency={agency.contactedPct}
          agencyLabel={t("agencyComparison", { value: agency.contactedPct.toFixed(0) })}
        />
        <Row
          label={t("qualified")}
          agent={agent.qualifiedPct}
          agency={agency.qualifiedPct}
          agencyLabel={t("agencyComparison", { value: agency.qualifiedPct.toFixed(0) })}
        />
        <Row
          label={t("viewing")}
          agent={agent.viewingPct}
          agency={agency.viewingPct}
          agencyLabel={t("agencyComparison", { value: agency.viewingPct.toFixed(0) })}
        />
        <Row
          label={t("won")}
          agent={agent.wonPct}
          agency={agency.wonPct}
          agencyLabel={t("agencyComparison", { value: agency.wonPct.toFixed(0) })}
        />
      </CardContent>
    </Card>
  );
}
