"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PanelLeft, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { PropPulseLogo } from "@/components/shared/PropPulseLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STORAGE_KEY = "proppulse:sidebar-collapsed";

export function Sidebar({
  company,
  reraBrn,
}: {
  company: string;
  reraBrn: string;
}) {
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const loginCallbackUrl = `/${locale}/login`;
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read the saved preference after mount only, so server and first client
  // render match (avoids a hydration mismatch) and it still restores instantly.
  // Deliberately setting state from an effect here: this synchronizes React
  // state with an external store (localStorage) read that can only happen
  // client-side, which is exactly the sanctioned exception to this rule.
  useEffect(() => {
    let storedCollapsed = false;
    try {
      storedCollapsed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage unavailable (private mode, etc.); default to expanded.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(storedCollapsed);
    setHydrated(true);
  }, []);

  function setCollapsedPersisted(next: boolean) {
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore write failures
    }
  }

  const items = useMemo(
    () => NAV_ITEMS.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t]
  );

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
        hydrated && "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[76px]" : "w-72"
      )}
    >
      {/* Logo row */}
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "flex-col justify-center gap-2")}>
        <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
            <PropPulseLogo className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          {!collapsed && <span className="truncate text-lg font-bold tracking-tight">{tCommon("brand")}</span>}
        </Link>
        <button
          onClick={() => setCollapsedPersisted(!collapsed)}
          aria-label={collapsed ? tSidebar("expandSidebar") : tSidebar("collapseSidebar")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto pt-2", collapsed ? "px-3" : "px-3")}>
        {!collapsed && (
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40">
            {tSidebar("mainMenu").toUpperCase()}
          </p>
        )}
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const linkClassName = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            collapsed && "justify-center px-0",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          );

          if (!collapsed) {
            return (
              <Link key={item.href} href={item.href} className={linkClassName}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={<Link href={item.href} className={linkClassName} />}>
                <Icon className="h-4 w-4 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Agency footer */}
      <div
        className={cn(
          "border-t border-sidebar-border py-3 text-xs text-sidebar-foreground/60",
          collapsed ? "flex flex-col items-center px-2" : "px-4"
        )}
      >
        {!collapsed && (
          <>
            <p className="truncate font-medium text-sidebar-foreground/90">{company}</p>
            <p>{tCommon("reraBrn", { brn: reraBrn })}</p>
          </>
        )}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => signOut({ callbackUrl: loginCallbackUrl })}
                  aria-label={tCommon("logout")}
                  className="mt-1 flex items-center justify-center rounded-md p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                />
              }
            >
              <LogOut className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">{tCommon("logout")}</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: loginCallbackUrl })}
            className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            {tCommon("logout")}
          </button>
        )}
      </div>
    </aside>
  );
}
