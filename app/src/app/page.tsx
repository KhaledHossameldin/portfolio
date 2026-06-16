import type { Metadata } from "next";

export const metadata: Metadata = {
  // The root is a locale dispatcher, not a content page — keep it out of indexes.
  robots: { index: false, follow: false },
  alternates: {
    languages: { en: "/en", de: "/de", "x-default": "/en" },
  },
};

// Static root: detect the browser language client-side and hand off to the
// matching locale (German speakers → /de, everyone else → /en). This runs at
// the edge-served `/` because the site is a static export (no middleware).
const detect = `(function(){try{var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||navigator.userLanguage||'en'];var de=langs.some(function(l){return String(l).toLowerCase().indexOf('de')===0});location.replace(de?'/de/':'/en/');}catch(e){location.replace('/en/');}})();`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: detect }} />
      {/* No-JS fallback: send crawlers and script-less clients to English. */}
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/en/" />
      </noscript>
    </>
  );
}
