import { defineRouting } from "next-intl/routing";

// Static sub-path locale routing (/en, /de) — EN default, DE secondary.
// No middleware: locales are generated at build time via generateStaticParams
// (locked decision §2 — static export, no runtime middleware).
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
