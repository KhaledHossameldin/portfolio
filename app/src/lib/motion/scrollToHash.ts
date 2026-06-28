import { getLenis } from "./lenisRef";

// Breathing room between the sticky nav and the target's top.
const GAP = 16;

function resolveTarget(hash: string): HTMLElement | null {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return null;
  try {
    return document.getElementById(id);
  } catch {
    return null;
  }
}

// Live height of the sticky header. The mobile nav WRAPS (taller than on
// desktop), so a hardcoded offset can't clear it — measure it at scroll time.
function navOffset(): number {
  if (typeof document === "undefined") return 72;
  const header = document.querySelector("header");
  const h = header ? header.getBoundingClientRect().height : 72;
  return Math.round(h + GAP);
}

// Absolute document top of an element via the offsetParent chain. `offsetTop` is
// the layout position and IGNORES CSS transforms, so the Reveal entrance
// translateY on the contact form can't corrupt the scroll target (unlike
// getBoundingClientRect, which Lenis would use for an element target).
function absoluteTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

// Scroll to an in-page hash, landing the target `navOffset` below the viewport
// top. We compute an absolute pixel target and hand Lenis a NUMBER (not the
// element): that skips Lenis's element branch, which would otherwise also
// subtract CSS `scroll-padding-top` on top of our offset (a double-count). The
// native / reduced-motion path uses the same computed `top`, so both land
// identically on mobile and desktop.
export function scrollToHash(hash: string): void {
  const el = resolveTarget(hash);
  if (!el) return;
  const top = Math.max(0, absoluteTop(el) - navOffset());
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top);
  } else {
    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }
}

// Click handler for in-page hash links. Same-document hashes (`#work`) are
// intercepted for a Lenis-driven smooth scroll; cross-page links
// (`/en#work` from a sub-page) fall through to normal navigation, and the
// landing page handles the hash via scrollToHashOnMount.
export function handleHashClick(
  e: { preventDefault: () => void },
  href: string,
): void {
  if (!href.startsWith("#") || href === "#") return;
  e.preventDefault();
  scrollToHash(href);
  if (typeof history !== "undefined") {
    history.pushState(null, "", href);
  }
}

// On a fresh landing at /{locale}#section, scroll only after layout has settled
// (fonts can reflow positions). Waits for fonts + two animation frames.
export function scrollToHashOnMount(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash || hash === "#") return;

  const run = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(hash)));
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}
