import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Arabic UI font; swapped in for the `ar` locale via `--font-sans` override
// in globals.css (see `html[lang="ar"]`).
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The whole app is behind auth (session-dependent) and locale-dependent
// messages are resolved per request; never let Next serve a cached/prerendered
// render of one locale for another.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  // Makes the resolved locale available synchronously to every server
  // component/translation call in this render tree; avoids relying on
  // request-header propagation timing for locale negotiation.
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
