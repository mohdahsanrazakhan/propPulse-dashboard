import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { DealTypeBadge } from "@/components/shared/DealTypeBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useDealStageLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { PipelineDeal } from "@/hooks/usePipeline";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function PipelineTable({ deals, onSelect }: { deals: PipelineDeal[]; onSelect: (deal: PipelineDeal) => void }) {
  const t = useTranslations("pipeline");
  const dealStageLabel = useDealStageLabel();

  const columns: DataTableColumn<PipelineDeal>[] = [
    { key: "dealId", header: t("table.dealId"), sortValue: (d) => d.dealId, render: (d) => <span className="font-medium text-accent">{d.dealId}</span> },
    { key: "type", header: t("table.type"), sortValue: (d) => d.type, render: (d) => <DealTypeBadge type={d.type} /> },
    {
      key: "property",
      header: t("table.property"),
      sortValue: (d) => d.property.community,
      render: (d) => (
        <span className="capitalize">
          {d.property.type} &middot; {d.property.community} &middot; {d.property.unitNumber}
        </span>
      ),
    },
    {
      key: "client",
      header: t("table.client"),
      sortValue: (d) => d.clientName,
      render: (d) => (
        <span>
          {d.clientName} <span className="text-xs text-muted-foreground">({d.clientNationality})</span>
        </span>
      ),
    },
    {
      key: "agent",
      header: t("table.agent"),
      sortValue: (d) => d.agent?.name ?? "",
      render: (d) => (
        <span className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-muted text-[10px]">{d.agent ? initials(d.agent.name) : "N/A"}</AvatarFallback>
          </Avatar>
          {d.agent?.name ?? t("unassigned")}
        </span>
      ),
    },
    {
      key: "value",
      header: t("table.value"),
      align: "right",
      sortValue: (d) => d.transactionValue,
      render: (d) => <CurrencyDisplay value={d.transactionValue} compact />,
    },
    {
      key: "commission",
      header: t("table.commission"),
      align: "right",
      sortValue: (d) => d.commission.grossAmount,
      render: (d) => <CurrencyDisplay value={d.commission.grossAmount} compact />,
    },
    {
      key: "stage",
      header: t("table.stage"),
      sortValue: (d) => d.stage,
      render: (d) => <Badge variant="outline">{dealStageLabel(d.stage)}</Badge>,
    },
    {
      key: "daysInStage",
      header: t("table.daysInStage"),
      align: "right",
      sortValue: (d) => d.daysInStage,
      render: (d) => (
        <span className={cn("tabular-nums font-medium", d.daysInStage > 14 && "text-danger")}>{d.daysInStage}d</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={deals} rowKey={(d) => d._id} onRowClick={onSelect} />;
}
