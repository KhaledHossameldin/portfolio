"use client";

import { useEffect, useState } from "react";

// Client-only visitor-country probe for the geo-aware "Based" line.
//
// SSR / first client render returns null so it matches the country default baked
// into the static HTML — no hydration drift, no FOUC. After mount it makes ONE
// keyless, CORS-enabled request (ipapi.co returns a bare 2-letter code as text),
// abortable with a short timeout. ANY failure / timeout / abort / unexpected body
// → stays null and the caller keeps the country default. Runs in an effect after
// paint, so it never blocks render and costs no LCP/TBT.
const ENDPOINT = "https://ipapi.co/country/";
const TIMEOUT_MS = 2500;

export function useVisitorCountry(): string | null {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(ENDPOINT, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((body) => {
        const code = body.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(code)) setCountry(code);
      })
      .catch(() => {
        /* offline, blocked, timed out, rate-limited — keep the country default */
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return country;
}
