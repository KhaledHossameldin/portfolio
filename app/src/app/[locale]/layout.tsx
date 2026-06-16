import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

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

  // The root layout owns <html> with a default lang; correct it to the active
  // locale on load (each locale is a separate static document).
  const setLang = `document.documentElement.lang=${JSON.stringify(locale)};`;

  return (
    <NextIntlClientProvider>
      <script dangerouslySetInnerHTML={{ __html: setLang }} />
      {children}
    </NextIntlClientProvider>
  );
}
