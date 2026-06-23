import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import en from "@/messages/en.json";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { ProjectDetail } from "@/components/sections/ProjectDetail";

type ProjectLite = { slug: string; detail: boolean; title: string; tagline: string };

// Detail pages exist only for the featured (detail:true) projects. Slugs are
// the single source from the catalog; this runs once per locale, emitting
// /en/work/<slug>/ and /de/work/<slug>/.
const DETAIL_SLUGS = (en.projects as ProjectLite[]).filter((p) => p.detail).map((p) => p.slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return DETAIL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const projects = t.raw("projects") as ProjectLite[];
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: {
        en: `/en/work/${slug}`,
        de: `/de/work/${slug}`,
        "x-default": `/en/work/${slug}`,
      },
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!DETAIL_SLUGS.includes(slug)) notFound();

  return (
    <ThemeProvider>
      <Nav />
      <main>
        <ProjectDetail slug={slug} />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
