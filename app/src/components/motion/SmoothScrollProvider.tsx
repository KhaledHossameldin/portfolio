"use client";

import { useEffect, useRef } from "react";
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
  const pathname = usePathname();
  const firstRefresh = useRef(true);

  // Init effect — keyed on `reduced` ONLY. Lenis is built once (and rebuilt only
  // when the motion preference flips), not on every client navigation. It does
  // not own any ScrollTriggers, so it never kills them — each Parallax/pin owns
  // and cleans up its own.
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

      // Debounced — resize fires in bursts and refresh() is expensive.
      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      // Fonts reflow layout — refresh once they're ready, then on resize.
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
      }
      window.addEventListener("resize", onResize);

      scrollToHashOnMount();

      cleanupExtra = () => {
        clearTimeout(resizeTimer);
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      cancelled = true;
      cleanupExtra?.();
      lenis?.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // Refresh effect — keyed on `pathname`. Recomputes trigger positions after a
  // route change (DE copy length, different page) without tearing Lenis down.
  // Runs after the destination page's child effects have created their triggers.
  useEffect(() => {
    if (reduced) return;
    // First mount is covered by the init effect's fonts.ready refresh; only
    // refresh on subsequent route changes.
    if (firstRefresh.current) {
      firstRefresh.current = false;
      return;
    }
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [reduced, pathname]);

  return <>{children}</>;
}
