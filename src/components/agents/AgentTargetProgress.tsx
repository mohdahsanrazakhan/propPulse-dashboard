import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

function Ring({ percent, label, value, target }: { percent: number; label: string; value: React.ReactNode; target: React.ReactNode }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (clamped / 100) * circumference;
  const color = percent >= 100 ? "var(--success)" : percent >= 60 ? "var(--accent)" : "var(--warning)";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums text-foreground">
          {percent.toFixed(0)}%
        </div>
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        {value} / {target}
      </p>
    </div>
  );
}

export function AgentTargetProgress({
  targetVsActual,
}: {
  targetVsActual: {
    dealsActual: number;
    dealsTarget: number;
    commissionActual: number;
    commissionTarget: number;
    responseActual: number;
    responseTarget: number;
  };
}) {
  const v = targetVsActual;
  const t = useTranslations("agents.targetProgress");
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-around gap-6">
        <Ring
          percent={v.dealsTarget > 0 ? (v.dealsActual / v.dealsTarget) * 100 : 0}
          label={t("deals")}
          value={v.dealsActual}
          target={v.dealsTarget}
        />
        <Ring
          percent={v.commissionTarget > 0 ? (v.commissionActual / v.commissionTarget) * 100 : 0}
          label={t("commission")}
          value={<CurrencyDisplay value={v.commissionActual} compact />}
          target={<CurrencyDisplay value={v.commissionTarget} compact />}
        />
        <Ring
          percent={v.responseActual > 0 ? Math.max(0, 100 - ((v.responseActual - v.responseTarget) / v.responseTarget) * 100) : 100}
          label={t("responseTime")}
          value={`${v.responseActual}min`}
          target={t("responseTargetSuffix", { minutes: v.responseTarget })}
        />
      </CardContent>
    </Card>
  );
}
