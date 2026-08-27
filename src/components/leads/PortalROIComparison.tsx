import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useLeadSourceLabel } from "@/lib/labels";
import type { LeadAnalyticsData } from "@/hooks/useLeadAnalytics";

export function PortalROIComparison({ data }: { data: LeadAnalyticsData["sourceStats"] }) {
  const t = useTranslations("leads.portalRoi");
  const leadSourceLabel = useLeadSourceLabel();

  const columns: DataTableColumn<LeadAnalyticsData["sourceStats"][number]>[] = [
    {
      key: "source",
      header: t("source"),
      sortValue: (d) => d.label,
      render: (d) => <span className="font-medium">{leadSourceLabel(d.source)}</span>,
    },
    { key: "leads", header: t("leads"), align: "right", sortValue: (d) => d.leads, render: (d) => d.leads },
    { key: "deals", header: t("deals"), align: "right", sortValue: (d) => d.deals, render: (d) => d.deals },
    {
      key: "conversion",
      header: t("conversion"),
      align: "right",
      sortValue: (d) => d.conversionRate,
      render: (d) => `${d.conversionRate.toFixed(1)}%`,
    },
    {
      key: "avgDealValue",
      header: t("avgDealValue"),
      align: "right",
      sortValue: (d) => d.avgDealValue,
      render: (d) => <CurrencyDisplay value={d.avgDealValue} compact />,
    },
    {
      key: "commission",
      header: t("commissionEarned"),
      align: "right",
      sortValue: (d) => d.commissionEarned,
      render: (d) => <CurrencyDisplay value={d.commissionEarned} compact bold />,
    },
    {
      key: "cost",
      header: t("estMonthlyCost"),
      align: "right",
      sortValue: (d) => d.estMonthlyCost,
      render: (d) => <CurrencyDisplay value={d.estMonthlyCost} compact />,
    },
    {
      key: "roi",
      header: t("roi"),
      align: "right",
      sortValue: (d) => (d.roi === null ? Infinity : d.roi),
      render: (d) => (d.roi === null ? <span className="font-semibold text-success">&infin;</span> : `${d.roi.toFixed(1)}x`),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} rowKey={(d) => d.source} />
      </CardContent>
    </Card>
  );
}
