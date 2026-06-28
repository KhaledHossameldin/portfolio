import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { detailSlugs, getProject, pick } from "@/data/projects";
import type { Locale } from "@/i18n/routing";
import { socialMeta } from "@/lib/seo/og";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { ProjectDetail } from "@/components/sections/ProjectDetail";

// Detail pages exist only for the featured (detail:true) projects. Slugs come
// from the single projects.ts source; this runs once per locale, emitting
// /en/work/<slug>/ and /de/work/<slug>/.
export const dynamicParams = false;

export function generateStaticParams() {
  return detailSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: pick(p.title, locale as Locale),
    description: pick(p.tagline, locale as Locale),
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: {
        en: `/en/work/${slug}`,
        de: `/de/work/${slug}`,
        ar: `/ar/work/${slug}`,
        "x-default": `/en/work/${slug}`,
      },
    },
    ...socialMeta({
      locale: locale as Locale,
      title: pick(p.title, locale as Locale),
      description: pick(p.tagline, locale as Locale),
      path: `/${locale}/work/${slug}`,
      type: "article",
    }),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!detailSlugs.includes(slug)) notFound();

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
