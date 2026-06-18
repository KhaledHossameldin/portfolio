"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

/**
 * Subtle GSAP yPercent parallax tied to scroll position. The design is
 * image-free, so this is used on type focal points (panels, big metric numbers)
 * with a small amplitude — restraint over spectacle.
 *
 * Transform-only (yPercent) → no layout thrash, stays on the compositor for
 * 60fps. No-op under reduced motion. gsap is dynamically imported so it stays
 * off the main bundle (static-export safe — nothing runs at module eval).
 */
export function Parallax({
  children,
  amount = 8,
  className,
  style,
}: {
  children: ReactNode;
  /** Peak yPercent offset; keep small for type. */
  amount?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const tween = gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced, amount]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
