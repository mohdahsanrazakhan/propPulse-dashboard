"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { calculateCommission } from "@/lib/commission-calculator";
import { DEFAULT_COMMISSION_RATES } from "@/lib/constants";

export function CommissionCalculator() {
  const t = useTranslations("commission.calculator");
  const tDealType = useTranslations("labels.dealType");
  const [dealType, setDealType] = useState<"sale" | "rental" | "off_plan">("sale");
  const [propertyValue, setPropertyValue] = useState(1500000);
  const [commissionRate, setCommissionRate] = useState(DEFAULT_COMMISSION_RATES.sale);
  const [agentSplit, setAgentSplit] = useState(60);
  const [isCobroker, setIsCobroker] = useState(false);
  const [cobrokerSplit, setCobrokerSplit] = useState(50);

  function handleDealType(value: string) {
    const type = value as "sale" | "rental" | "off_plan";
    setDealType(type);
    setCommissionRate(DEFAULT_COMMISSION_RATES[type]);
  }

  const result = useMemo(
    () =>
      calculateCommission({
        dealType,
        transactionValue: propertyValue,
        commissionRate,
        agentSplitPercent: agentSplit,
        isCoBroker: isCobroker,
        coBrokerSplitPercent: cobrokerSplit,
      }),
    [dealType, propertyValue, commissionRate, agentSplit, isCobroker, cobrokerSplit]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Calculator className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("dealType")}</Label>
            <Select value={dealType} onValueChange={(v) => v && handleDealType(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">{tDealType("sale")}</SelectItem>
                <SelectItem value="rental">{tDealType("rental")}</SelectItem>
                <SelectItem value="off_plan">{tDealType("off_plan")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("propertyValue")}</Label>
            <Input
              type="number"
              min={0}
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("commissionRate")}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("agentSplit")}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={agentSplit}
              onChange={(e) => setAgentSplit(Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("isCobroker")}</Label>
            <Select value={isCobroker ? "yes" : "no"} onValueChange={(v) => setIsCobroker(v === "yes")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{t("no")}</SelectItem>
                <SelectItem value="yes">{t("yes")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCobroker && (
            <div className="space-y-1.5">
              <Label>{t("cobrokerSplit")}</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={cobrokerSplit}
                onChange={(e) => setCobrokerSplit(Number(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-5">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("grossCommission")}</span><CurrencyDisplay value={result.grossCommission} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("vat")}</span><CurrencyDisplay value={result.vatAmount} /></div>
            <div className="flex justify-between font-medium"><span>{t("totalWithVat")}</span><CurrencyDisplay value={result.totalWithVat} /></div>
            <Separator />
            {isCobroker && (
              <div className="flex justify-between"><span className="text-muted-foreground">{t("cobrokerPays")}</span><CurrencyDisplay value={result.coBrokerAmount} /></div>
            )}
            <div className="flex justify-between text-base font-bold"><span className="text-foreground">{t("agentEarns")}</span><CurrencyDisplay value={result.agentAmount} bold /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("agencyKeeps")}</span><CurrencyDisplay value={result.agencyAmount} /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
