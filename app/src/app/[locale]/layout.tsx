import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Newsreader, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.khaledhossameldin.com"),
  title: {
    default: "Khaled — Senior Software Engineer",
    template: "%s · Khaled",
  },
  description:
    "Senior software engineer shipping across the whole stack — Flutter/mobile, frontend, backend, and the DevOps that runs it. This site is deployed by the same Terraform and CI/CD it talks about.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  openGraph: {
    title: "Khaled — Senior Software Engineer",
    description:
      "End to end — infrastructure included. Flutter/mobile, frontend, backend, DevOps.",
    type: "website",
  },
};

// Build /en and /de at export time; reject anything else (no runtime middleware).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

// Theme is client state on <html data-theme>. This pre-paint script reads the
// saved choice (default dark) before first paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem('kp-theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

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

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${newsreader.variable} ${hanken.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
