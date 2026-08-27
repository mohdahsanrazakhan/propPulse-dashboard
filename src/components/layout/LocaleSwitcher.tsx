"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Always rendered in the language's own script, regardless of the current
// UI locale; e.g. the label for Arabic is "العربية" even on the English page.
const LOCALE_NATIVE_LABEL = {
  en: "English",
  ar: "العربية",
} as const;

// Header control: shows the label of the OTHER locale; clicking switches to it.
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const otherLocale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  function switchLocale() {
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      aria-label={t("language")}
      className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
    >
      <Languages className="h-4 w-4" />
      {LOCALE_NATIVE_LABEL[otherLocale]}
    </button>
  );
}
