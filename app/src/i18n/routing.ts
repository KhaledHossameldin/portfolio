import { defineRouting } from "next-intl/routing";

// Static sub-path locale routing (/en, /de, /ar) — EN default, DE + AR (RTL)
// secondary. No middleware: locales are generated at build time via
// generateStaticParams (locked decision §2 — static export, no runtime middleware).
export const routing = defineRouting({
  locales: ["en", "de", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/** Locales rendered right-to-left. */
export const rtlLocales: readonly Locale[] = ["ar"];

export function isRtl(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}
