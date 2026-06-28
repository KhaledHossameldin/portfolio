import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

// Shared Open Graph + Twitter builder. Next merges metadata SHALLOWLY — a child
// generateMetadata that sets `openGraph` replaces the parent's wholesale — so every
// call returns the COMPLETE objects (siteName, image, locale, type) to avoid losing
// fields. `metadataBase` (root layout) resolves the relative `path`/image to absolute.
const SITE_NAME = "Khaled Hossameldin";
const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Khaled — Senior Software Engineer",
} as const;
const OG_LOCALE: Record<Locale, string> = { en: "en_US", de: "de_DE", ar: "ar_SA" };

export function socialMeta({
  locale,
  title,
  description,
  path,
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  /** Site-relative, e.g. `/en` or `/de/work/sedra-life` — resolved by metadataBase. */
  path: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      locale: OG_LOCALE[locale],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}
