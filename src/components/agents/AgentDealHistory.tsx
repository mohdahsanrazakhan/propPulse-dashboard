"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { DealTypeBadge } from "@/components/shared/DealTypeBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Badge } from "@/components/ui/badge";
import { useDealStageLabel } from "@/lib/labels";

interface DealRow {
  _id: string;
  dealId: string;
  type: string;
  property: { community: string };
  transactionValue: number;
  commission: { agentAmount: number };
  stage: string;
  completionDate: string | null;
  createdAt: string;
}

export function AgentDealHistory({ deals }: { deals: DealRow[] }) {
  const t = useTranslations("agents.dealHistory");
  const tDealType = useTranslations("labels.dealType");
  const dealStageLabel = useDealStageLabel();
  const locale = useLocale();
  const [typeFilter, setTypeFilter] = useState("all");
  const [communityFilter, setCommunityFilter] = useState("all");

  const communities = useMemo(() => Array.from(new Set(deals.map((d) => d.property.community))).sort(), [deals]);

  const filtered = deals.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (communityFilter !== "all" && d.property.community !== communityFilter) return false;
    return true;
  });

  const columns: DataTableColumn<DealRow>[] = [
    { key: "dealId", header: t("dealId"), sortValue: (d) => d.dealId, render: (d) => <span className="font-medium">{d.dealId}</span> },
    { key: "type", header: t("type"), sortValue: (d) => d.type, render: (d) => <DealTypeBadge type={d.type} /> },
    { key: "community", header: t("community"), sortValue: (d) => d.property.community, render: (d) => d.property.community },
    {
      key: "value",
      header: t("value"),
      align: "right",
      sortValue: (d) => d.transactionValue,
      render: (d) => <CurrencyDisplay value={d.transactionValue} compact />,
    },
    {
      key: "commission",
      header: t("commission"),
      align: "right",
      sortValue: (d) => d.commission.agentAmount,
      render: (d) => <CurrencyDisplay value={d.commission.agentAmount} compact />,
    },
    {
      key: "stage",
      header: t("stage"),
      sortValue: (d) => d.stage,
      render: (d) => <Badge variant={d.stage === "completed" ? "default" : "outline"}>{dealStageLabel(d.stage)}</Badge>,
    },
    {
      key: "date",
      header: t("date"),
      sortValue: (d) => new Date(d.completionDate ?? d.createdAt).getTime(),
      render: (d) => new Date(d.completionDate ?? d.createdAt).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB"),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="sale">{tDealType("sale")}</SelectItem>
              <SelectItem value="rental">{tDealType("rental")}</SelectItem>
              <SelectItem value="off_plan">{tDealType("off_plan")}</SelectItem>
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
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filtered} rowKey={(d) => d._id} />
      </CardContent>
    </Card>
  );
}
