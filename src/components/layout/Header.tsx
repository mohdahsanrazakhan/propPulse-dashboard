"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Building2, LogOut, ShieldCheck } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({
  userName,
  company,
  reraBrn,
  role,
}: {
  userName: string;
  company: string;
  reraBrn: string;
  role: string;
}) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");
  const locale = useLocale();
  const loginCallbackUrl = `/${locale}/login`;
  const pathname = usePathname();
  const current = NAV_ITEMS.find((n) => pathname === n.href || pathname?.startsWith(`${n.href}/`));
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav company={company} reraBrn={reraBrn} />
        <h1 className="text-lg font-semibold text-foreground">
          {current ? t(current.labelKey) : tCommon("brand")}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <LocaleSwitcher />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 ps-1 pe-2 outline-none transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 px-1.5 py-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>{tHeader("agency")}</DropdownMenuLabel>
              <div className="space-y-1 px-1.5 pb-2 text-sm">
                <p className="flex items-center gap-1.5 text-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{company}</span>
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  {tCommon("reraBrn", { brn: reraBrn })}
                </p>
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: loginCallbackUrl })}>
              <LogOut className="h-4 w-4" />
              {tCommon("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
