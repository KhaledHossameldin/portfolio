"use client";

import { useEffect } from "react";
// Plain framework pathname (not next-intl's) — this provider mounts in the root
// layout, above the [locale] segment, so it must not depend on the locale
// context (the not-found page has none). Full path still changes on /en<->/de.
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import { setLenis } from "@/lib/motion/lenisRef";
import { scrollToHashOnMount } from "@/lib/motion/scrollToHash";

/**
 * Drives Lenis smooth scroll and bridges it to GSAP ScrollTrigger. Mounted once
 * in the root layout, wrapping all routes.
 *
 * Static-export safe: this is a Client Component and gsap/lenis are dynamically
 * imported inside the effect, so nothing browser-only runs at module eval or on
 * the server (Next 16 forbids `ssr:false` in Server Components, so the import
 * lives here, not in the layout).
 *
 * Reduced motion: Lenis is never constructed — native scroll, no ticker, no
 * triggers. The preference is reactive, so a live toggle remounts the effect.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  // Locale change (/en <-> /de) shifts trigger positions because DE copy is
  // longer; usePathname is locale-aware and re-runs the effect on route change.
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;

    let lenis: import("lenis").default | null = null;
    let cancelled = false;
    let cleanupExtra: (() => void) | null = null;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      setLenis(lenis);

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const refresh = () => ScrollTrigger.refresh();
      // Fonts reflow layout — refresh once they're ready, then on resize.
      if (document.fonts?.ready) {
        document.fonts.ready.then(refresh).catch(() => {});
      }
      window.addEventListener("resize", refresh);

      scrollToHashOnMount();

      cleanupExtra = () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", refresh);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanupExtra?.();
      lenis?.destroy();
      setLenis(null);
    };
  }, [reduced, pathname]);

  return <>{children}</>;
}
