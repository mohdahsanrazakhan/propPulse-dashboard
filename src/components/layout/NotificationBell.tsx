"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Bell, AlertTriangle, Clock, CheckCircle2, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Alert {
  severity: "critical" | "warning" | "success" | "info";
  message: string;
  href: string;
}

const SEVERITY_STYLE: Record<Alert["severity"], { icon: typeof AlertTriangle; iconClass: string; bgClass: string }> = {
  critical: { icon: AlertTriangle, iconClass: "text-danger!", bgClass: "bg-danger/10" },
  warning: { icon: Clock, iconClass: "text-warning!", bgClass: "bg-warning/10" },
  success: { icon: CheckCircle2, iconClass: "text-success!", bgClass: "bg-success/10" },
  info: { icon: Info, iconClass: "text-secondary!", bgClass: "bg-secondary/10" },
};

export function NotificationBell() {
  const t = useTranslations("notifications");
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { alerts: [] }))
      .then((json) => {
        if (!cancelled) setAlerts(json.alerts ?? []);
      })
      .catch(() => {
        // Silently ignore; the bell just shows no notifications.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = alerts.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
        aria-label={count > 0 ? t("labelWithCount", { count }) : t("label")}
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-1 py-1.5 text-sm">
            <span className="font-semibold text-foreground">{t("label")}</span>
            {count > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {count}
              </span>
            )}
          </DropdownMenuLabel>

          {count === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-3 py-8 text-center">
              <Bell className="h-5 w-5 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            </div>
          ) : (
            <div className="mt-0.5 flex flex-col gap-0.5">
              {alerts.map((alert, i) => {
                const { icon: Icon, iconClass, bgClass } = SEVERITY_STYLE[alert.severity];
                return (
                  <DropdownMenuItem
                    key={i}
                    render={<Link href={alert.href} />}
                    className="items-center gap-2.5 rounded-lg px-2 py-2 focus:bg-muted!"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        bgClass
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", iconClass)} />
                    </span>
                    <span className="text-sm leading-snug text-foreground!">
                      {alert.message}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
