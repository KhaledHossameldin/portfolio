import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { CaseStudy } from "@/components/sections/CaseStudy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "case" });
  return {
    title: `${t("title")} — ${t("eyebrow")}`,
    description: t("subtitle"),
  };
}

export default async function TmmsCasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ThemeProvider>
      <Nav />
      <main>
        <CaseStudy />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
