"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { PropPulseLogo } from "@/components/shared/PropPulseLogo";

export function MobileNav({ company, reraBrn }: { company: string; reraBrn: string }) {
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const tMobile = useTranslations("mobileNav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const loginCallbackUrl = `/${locale}/login`;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => NAV_ITEMS.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
        <SheetTitle className="sr-only">{tMobile("srNavigation")}</SheetTitle>

        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
            <PropPulseLogo className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">{tCommon("brand")}</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40">
            {tSidebar("mainMenu").toUpperCase()}
          </p>
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/60">
          <p className="truncate font-medium text-sidebar-foreground/90">{company}</p>
          <p>{tCommon("reraBrn", { brn: reraBrn })}</p>
          <button
            onClick={() => signOut({ callbackUrl: loginCallbackUrl })}
            className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            {tCommon("logout")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
