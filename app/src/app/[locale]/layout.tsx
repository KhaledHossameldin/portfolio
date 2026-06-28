import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, isRtl } from "@/i18n/routing";

// Build /en and /de at export time; reject anything else (no runtime middleware).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering for this locale.
  setRequestLocale(locale);

  // The root layout owns <html> (locale-agnostic); the root pre-paint script sets
  // documentElement.lang/dir per URL for JS users (no FOUC). This server-rendered
  // wrapper bakes the direction into the static HTML for no-JS/crawlers.
  // display:contents → no extra box; `dir` still inherits to all descendants.
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider>
      <div dir={dir} style={{ display: "contents" }}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
