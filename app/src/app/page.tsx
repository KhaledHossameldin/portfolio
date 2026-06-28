import type { Metadata } from "next";

export const metadata: Metadata = {
  // The root is a locale dispatcher, not a content page — keep it out of indexes.
  robots: { index: false, follow: false },
  alternates: {
    languages: { en: "/en", de: "/de", ar: "/ar", "x-default": "/en" },
  },
};

// Static root: a client-side locale dispatcher (no middleware — static export).
// Language first (instant, no network): Arabic browser language → /ar, German → /de.
// Otherwise probe the visitor country (keyless ipapi, ~1.5s timeout, abortable) and
// send Saudi Arabia → /ar (Arabic-default market); everyone else → /en. Any
// failure/timeout never hangs — it falls back to /en.
const detect = `(function(){function go(p){location.replace(p)}try{var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||navigator.userLanguage||'en'];var L=langs.map(function(l){return String(l).toLowerCase()});if(L.some(function(l){return l.indexOf('ar')===0}))return go('/ar/');if(L.some(function(l){return l.indexOf('de')===0}))return go('/de/');var done=false;function finish(p){if(done)return;done=true;go(p)}var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();finish('/en/')},1500);fetch('https://ipapi.co/country/',{signal:ctrl.signal}).then(function(r){return r.ok?r.text():Promise.reject()}).then(function(t){clearTimeout(timer);finish(t.trim().toUpperCase()==='SA'?'/ar/':'/en/')}).catch(function(){clearTimeout(timer);finish('/en/')})}catch(e){go('/en/')}})();`;

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
