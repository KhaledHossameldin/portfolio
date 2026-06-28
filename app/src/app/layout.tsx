import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import "./globals.css";

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

// Arabic face for the RTL locale (/ar). preload:false so en/de don't fetch it;
// applied only under [dir="rtl"] (globals.css overrides the font vars there).
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Khaled Hossameldin",
    title: "Khaled — Senior Software Engineer",
    description:
      "End to end — infrastructure included. Flutter/mobile, frontend, backend, DevOps.",
    url: "/",
    locale: "en_US",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Khaled — Senior Software Engineer" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khaled — Senior Software Engineer",
    description:
      "End to end — infrastructure included. Flutter/mobile, frontend, backend, DevOps.",
    images: ["/og.png"],
  },
};

// theme-color = the dark-default surface (#0E0C0A), so the browser chrome matches
// the site's default theme. Next 16 reads themeColor from the viewport export.
export const viewport: Viewport = {
  themeColor: "#0E0C0A",
};

// Pre-paint (in <head>, before first paint → no flash): (1) apply the saved theme
// (default dark); (2) set lang + dir from the URL's locale segment so /ar renders
// RTL with no LTR flash. The static <html> is locale-agnostic (one root layout);
// this corrects it per document. Mirrors the [locale] no-JS dir wrapper.
const themeInit = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('kp-theme');if(t!=='light'&&t!=='dark'){t='dark'}d.setAttribute('data-theme',t)}catch(e){d.setAttribute('data-theme','dark')}try{var seg=location.pathname.split('/')[1];var loc=(seg==='ar'||seg==='de'||seg==='en')?seg:'en';d.lang=loc;d.dir=(loc==='ar')?'rtl':'ltr'}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${newsreader.variable} ${hanken.variable} ${plexMono.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
