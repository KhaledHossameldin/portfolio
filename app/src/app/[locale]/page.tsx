import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { socialMeta } from "@/lib/seo/og";
import type { Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConsoleEasterEgg } from "@/components/ConsoleEasterEgg";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Stack } from "@/components/sections/Stack";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

// Per-locale canonical + hreflang. metadataBase (root layout) resolves these to
// absolute URLs; the case route already does this — the home route did not.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", de: "/de", "x-default": "/en" },
    },
    ...socialMeta({
      locale: locale as Locale,
      title: t("ogTitle"),
      description: t("ogDescription"),
      path: `/${locale}`,
    }),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ThemeProvider>
      <ConsoleEasterEgg />
      <Nav />
      <main>
        <Hero />
        <SelectedWork />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
