"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DEFAULT_COMMISSION_RATES } from "@/lib/constants";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { data: session } = useSession();
  const [saleRate, setSaleRate] = useState(DEFAULT_COMMISSION_RATES.sale);
  const [rentalRate, setRentalRate] = useState(DEFAULT_COMMISSION_RATES.rental);
  const [agentSplit, setAgentSplit] = useState(60);
  const [monthlyDealsTarget, setMonthlyDealsTarget] = useState(5);
  const [monthlyCommissionTarget, setMonthlyCommissionTarget] = useState(30000);
  const [responseTimeTarget, setResponseTimeTarget] = useState(15);
  const [saved, setSaved] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  async function handleReset() {
    setResetting(true);
    setResetError(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("dangerZone.genericError"));
      setResetDone(true);
      setConfirmOpen(false);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : t("dangerZone.genericError"));
    } finally {
      setResetting(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">{t("agencyInfo.title")}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("agencyInfo.companyName")}</Label>
            <Input value={session?.user?.company ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>{t("agencyInfo.reraBrn")}</Label>
            <Input value={session?.user?.reraBrn ?? ""} disabled />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">{t("commissionDefaults.title")}</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("commissionDefaults.saleRate")}</Label>
                <Input type="number" step={0.1} value={saleRate} onChange={(e) => setSaleRate(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("commissionDefaults.rentalRate")}</Label>
                <Input type="number" step={0.1} value={rentalRate} onChange={(e) => setRentalRate(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("commissionDefaults.defaultAgentSplit")}</Label>
              <Input type="number" value={agentSplit} onChange={(e) => setAgentSplit(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">{t("monthlyTargets.title")}</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("monthlyTargets.dealsPerAgent")}</Label>
                <Input type="number" value={monthlyDealsTarget} onChange={(e) => setMonthlyDealsTarget(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("monthlyTargets.commissionPerAgent")}</Label>
                <Input
                  type="number"
                  value={monthlyCommissionTarget}
                  onChange={(e) => setMonthlyCommissionTarget(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">{t("displayAlerts.title")}</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("displayAlerts.currencyDisplay")}</Label>
              <Input value="AED" disabled />
            </div>
            <div className="space-y-1.5">
              <Label>{t("displayAlerts.responseTimeTarget")}</Label>
              <Input type="number" value={responseTimeTarget} onChange={(e) => setResponseTimeTarget(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit">{t("save")}</Button>
          {saved && <span className="text-sm text-success">{t("saved")}</span>}
        </div>
      </form>

      <Card className="border-danger/30">
        <CardHeader>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertTriangle className="h-4 w-4" /> {t("dangerZone.title")}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("dangerZone.description")}</p>
          {resetError && (
            <Alert variant="destructive">
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}
          {resetDone && (
            <Alert>
              <AlertDescription>{t("dangerZone.resetSuccess")}</AlertDescription>
            </Alert>
          )}
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <RefreshCw className="h-4 w-4" /> {t("dangerZone.resetButton")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dangerZone.confirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("dangerZone.confirmDescription")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={resetting}>
              {t("dangerZone.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={resetting}>
              {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("dangerZone.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
